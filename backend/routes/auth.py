"""Auth routes."""
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import LoginInput
from services.db import db
from services.auth_service import verify_password, create_token, require_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(payload: LoginInput):
    user = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token({"sub": user["id"], "email": user["email"], "role": user.get("role", "admin"), "name": user.get("name", "")})
    return {
        "token": token,
        "user": {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user.get("role", "admin")},
    }


@router.get("/me")
async def me(payload: dict = Depends(require_admin)):
    return {"email": payload.get("email"), "name": payload.get("name"), "role": payload.get("role")}
