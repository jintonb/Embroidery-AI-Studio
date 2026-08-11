from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests

from database import get_db
from models.user import User
from core.security import create_access_token
from core.config import settings
import os

router = APIRouter(prefix="/auth", tags=["auth"])

class GoogleAuthRequest(BaseModel):
    token: str

@router.post("/google")
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify Google token (Replace with actual CLIENT_ID in production)
        # Using a generic approach since we don't have the client ID yet
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        if client_id:
            idinfo = id_token.verify_oauth2_token(request.token, requests.Request(), client_id)
        else:
            # For local dev without a real Google Client ID, we might mock this
            # In a real app, do NOT do this.
            # But we will attempt verification anyway without strict client ID check
            # if one is not provided.
            idinfo = id_token.verify_oauth2_token(request.token, requests.Request())
            
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email not provided by Google")
            
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create new user
            user = User(email=email)
            db.add(user)
            db.commit()
            db.refresh(user)
            
        # Create JWT
        access_token = create_access_token(subject=str(user.id))
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "credits": user.credits
            }
        }
        
    except ValueError:
        # Invalid token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )
