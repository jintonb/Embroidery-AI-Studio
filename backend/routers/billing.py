from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import stripe

from database import get_db
from models.user import User
from api.deps import get_current_user
from core.config import settings
import os

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")

class CheckoutSessionRequest(BaseModel):
    credits: int

@router.post("/create-checkout-session")
def create_checkout_session(
    request: CheckoutSessionRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Mock price calculation (e.g. $1 per 10 credits)
        amount = int((request.credits / 10) * 100) # Amount in cents
        
        # This is a basic integration. In real production, use price IDs from Stripe dashboard
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'{request.credits} Embroidery Credits',
                    },
                    'unit_amount': amount,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:3000/dashboard?success=true',
            cancel_url='http://localhost:3000/dashboard?canceled=true',
            client_reference_id=str(current_user.id),
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/credits")
def get_credits(current_user: User = Depends(get_current_user)):
    return {"credits": current_user.credits}
