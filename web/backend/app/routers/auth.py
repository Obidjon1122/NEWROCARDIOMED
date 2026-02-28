from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_db
from app.repositories.user import UserRepository
from app.services.user import UserService

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    phone: str
    password: str


@router.post("/login")
async def login(request: LoginRequest, conn=Depends(get_db)):
    repo = UserRepository(conn)
    service = UserService(repo)
    return await service.login(request.phone, request.password)
