"""JWT + bcrypt auth."""
import os
import jwt
import bcrypt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Header, Depends
from typing import Optional

JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret")
JWT_ALGO = "HS256"
JWT_EXP_HOURS = 24 * 7  # 7 days


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_token(payload: dict) -> str:
    payload = {**payload}
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=JWT_EXP_HOURS)
    payload["iat"] = datetime.now(timezone.utc)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.replace("Bearer ", "", 1).strip()
    payload = decode_token(token)
    if payload.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


async def require_super_admin(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.replace("Bearer ", "", 1).strip()
    payload = decode_token(token)
    if payload.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Super Admin access required")
    return payload


async def require_employee(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.replace("Bearer ", "", 1).strip()
    payload = decode_token(token)
    if payload.get("role") not in ["super_admin", "admin", "employee"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return payload


def check_permission(user_payload: dict, permission: str) -> bool:
    """Check if an admin has a specific permission enabled."""
    if user_payload.get("role") == "super_admin":
        return True
    if user_payload.get("role") == "admin":
        perms = user_payload.get("adminPermissions", {})
        if isinstance(perms, dict):
            return perms.get(permission, False)
        return False
    return False
