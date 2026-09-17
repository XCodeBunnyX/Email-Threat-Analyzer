"""
Gmail API Integration for GmailGuard.
Handles Google OAuth 2.0 flow securely and fetches emails/raw data from Gmail.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import uuid
from typing import Any
from dotenv import load_dotenv

load_dotenv()

# Allow HTTP for local OAuth development
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from main import analyze_email

logger = logging.getLogger("gmailguard.gmail")

gmail_router = APIRouter(prefix="/gmail", tags=["Gmail Integration"])

# ── Configuration ──────────────────────────────────────────────────
# Fetch dynamically to ensure dotenv is fully loaded before access
def get_gcp_config():
    load_dotenv(override=True)
    return {
        "client_id": os.getenv("GCP_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("GCP_CLIENT_SECRET", "").strip(),
        "project_id": os.getenv("GCP_PROJECT_ID", "").strip(),
        "redirect_uri": os.getenv("GMAIL_REDIRECT_URI", "http://localhost:8000/gmail/callback").strip(),
        "frontend_url": os.getenv("FRONTEND_URL", "http://localhost:5173").strip()
    }

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
]

_SESSION_STORE: dict[str, dict[str, Any]] = {}

_OAUTH_FLOWS: dict[str, str] = {}

def _get_client_config() -> dict:
    conf = get_gcp_config()
    if not conf["client_id"] or not conf["client_secret"]:
        raise HTTPException(
            status_code=500,
            detail="Google Cloud credentials not configured. Please set GCP_CLIENT_ID and GCP_CLIENT_SECRET in .env."
        )
    return {
        "web": {
            "client_id": conf["client_id"],
            "project_id": conf["project_id"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": conf["client_secret"],
            "redirect_uris": [conf["redirect_uri"]]
        }
    }

def _get_credentials_from_session(session_id: str | None) -> Credentials:
    if not session_id or session_id not in _SESSION_STORE:
        raise HTTPException(status_code=401, detail="Not authenticated with Gmail")
    
    cred_data = _SESSION_STORE[session_id]
    creds = Credentials.from_authorized_user_info(cred_data)
    
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())
            _SESSION_STORE[session_id] = json.loads(creds.to_json())
        except Exception as e:
            logger.error(f"Failed to refresh token: {e}")
            del _SESSION_STORE[session_id]
            raise HTTPException(status_code=401, detail="Gmail session expired. Please reconnect.")
            
    return creds


@gmail_router.get("/auth")
async def gmail_auth():
    """Start the OAuth 2.0 flow."""
    conf = get_gcp_config()
    try:
        client_config = _get_client_config()
        # OOB or web flow
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=conf["redirect_uri"]
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        # Save the PKCE code_verifier against the state
        _OAUTH_FLOWS[state] = flow.code_verifier
        
        return RedirectResponse(url=authorization_url)
    except Exception as e:
        logger.error(f"Auth initiation failed: {e}")
        return RedirectResponse(url=f"{conf['frontend_url']}/inbox?error=not_configured")


@gmail_router.get("/callback")
async def gmail_callback(request: Request, response: Response, code: str = None, error: str = None, state: str = None):
    """Handle OAuth 2.0 callback."""
    conf = get_gcp_config()
    if error:
        return RedirectResponse(url=f"{conf['frontend_url']}/inbox?error={error}")
    if not code or not state:
        return RedirectResponse(url=f"{conf['frontend_url']}/inbox?error=no_code")
        
    if state not in _OAUTH_FLOWS:
        logger.error("OAuth state mismatch or expired.")
        return RedirectResponse(url=f"{conf['frontend_url']}/inbox?error=auth_failed")
        
    code_verifier = _OAUTH_FLOWS.pop(state)

    try:
        client_config = _get_client_config()
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=conf["redirect_uri"],
            state=state,
            code_verifier=code_verifier
        )
        
        full_url = str(request.url)
        # Handle proxy scheme mismatch if necessary
        if "http://" in full_url and conf["redirect_uri"].startswith("https://"):
            full_url = full_url.replace("http://", "https://")
            
        flow.fetch_token(authorization_response=full_url)
        creds = flow.credentials
        
        session_id = str(uuid.uuid4())
        _SESSION_STORE[session_id] = json.loads(creds.to_json())
        
        redirect = RedirectResponse(url=f"{conf['frontend_url']}/inbox")
        redirect.set_cookie(
            key="gmail_session",
            value=session_id,
            httponly=True,
            samesite="lax",
            max_age=30 * 24 * 60 * 60,
        )
        return redirect
    except Exception as e:
        logger.error(f"OAuth callback failed: {e}", exc_info=True)
        return RedirectResponse(url=f"{conf['frontend_url']}/inbox?error=auth_failed")


@gmail_router.get("/status")
async def gmail_status(gmail_session: str | None = Cookie(default=None)):
    if not gmail_session or gmail_session not in _SESSION_STORE:
        return {"authenticated": False}
    try:
        _get_credentials_from_session(gmail_session)
        return {"authenticated": True}
    except HTTPException:
        return {"authenticated": False}


@gmail_router.post("/disconnect")
async def gmail_disconnect(response: Response, gmail_session: str | None = Cookie(default=None)):
    if gmail_session and gmail_session in _SESSION_STORE:
        del _SESSION_STORE[gmail_session]
    response.delete_cookie("gmail_session")
    return {"status": "success", "message": "Disconnected"}


@gmail_router.get("/emails")
async def list_emails(gmail_session: str | None = Cookie(default=None), max_results: int = 15):
    creds = _get_credentials_from_session(gmail_session)
    try:
        service = build('gmail', 'v1', credentials=creds)
        results = service.users().messages().list(userId='me', maxResults=max_results, q="in:inbox").execute()
        messages = results.get('messages', [])
        
        email_list = []
        for msg in messages:
            msg_detail = service.users().messages().get(
                userId='me', 
                id=msg['id'], 
                format='metadata',
                metadataHeaders=['From', 'Subject', 'Date']
            ).execute()
            
            headers = msg_detail.get('payload', {}).get('headers', [])
            subject = "No Subject"
            sender = "Unknown Sender"
            date = ""
            
            for header in headers:
                name = header.get('name', '').lower()
                if name == 'subject':
                    subject = header.get('value', '')
                elif name == 'from':
                    sender = header.get('value', '')
                elif name == 'date':
                    date = header.get('value', '')
                    
            email_list.append({
                "id": msg['id'],
                "threadId": msg.get('threadId'),
                "snippet": msg_detail.get('snippet', ''),
                "subject": subject,
                "sender": sender,
                "date": date
            })
        return {"emails": email_list}
    except HttpError as error:
        raise HTTPException(status_code=502, detail=f"Error communicating with Gmail API: {error}")
    except Exception as e:
        logger.error(f"Failed to fetch emails: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal error fetching emails")


@gmail_router.post("/analyze/{message_id}")
async def analyze_gmail_message(message_id: str, gmail_session: str | None = Cookie(default=None)):
    creds = _get_credentials_from_session(gmail_session)
    try:
        service = build('gmail', 'v1', credentials=creds)
        message = service.users().messages().get(userId='me', id=message_id, format='raw').execute()
        
        if 'raw' not in message:
            raise HTTPException(status_code=400, detail="Could not retrieve raw email content from Gmail")
            
        raw_b64 = message['raw']
        # Gmail API returns base64url encoded raw string
        raw_bytes = base64.urlsafe_b64decode(raw_b64)
        
        try:
            raw_email_str = raw_bytes.decode("utf-8", errors="replace")
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to decode email file. Ensure UTF-8 encoding.")
            
        # Call the exact same core pipeline as .eml upload
        try:
            report = analyze_email(raw_email_str)
        except Exception as exc:
            logger.error("Analysis pipeline error on Gmail msg: %s", type(exc).__name__, exc_info=True)
            raise HTTPException(
                status_code=500,
                detail="Internal analysis error. The email could not be processed.",
            )
            
        return report
    except HttpError as error:
        raise HTTPException(status_code=502, detail=f"Error communicating with Gmail API: {error}")
