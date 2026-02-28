import hashlib
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str, phone: str) -> str:
    """C++ security.cpp dagi sxemani takrorlaydi:
    SHA256(password + ":" + phone + ":" + pepper)
    """
    pepper = settings.AUTH_PEPPER
    salted = f"{password}:{phone}:{pepper}"
    return hashlib.sha256(salted.encode()).hexdigest()


def verify_password(plain_password: str, phone: str, hashed_password: str) -> bool:
    """Parolni tekshirish — hash yoki plain matn"""
    hashed_input = hash_password(plain_password, phone)
    # Legacy plain-text parollarni ham qo'llab-quvvatlash
    return hashed_password == hashed_input or hashed_password == plain_password


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
