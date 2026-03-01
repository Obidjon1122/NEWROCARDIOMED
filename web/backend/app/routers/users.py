from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.database import get_db
from app.repositories.user import UserRepository
from app.services.user import UserService
from app.core.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/users", tags=["users"])


class UserCreateBody(BaseModel):
    first_name: str
    last_name: str
    patronymic_name: str
    gender: str
    password: str
    phone: str
    role: str


class UserUpdateBody(UserCreateBody):
    pass


@router.get("")
async def get_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    conn=Depends(get_db),
    _=Depends(require_admin),
):
    service = UserService(UserRepository(conn))
    return await service.get_all_users(page, page_size)


@router.post("", status_code=201)
async def create_user(
    body: UserCreateBody,
    conn=Depends(get_db),
    # _=Depends(require_admin),
):
    service = UserService(UserRepository(conn))
    return await service.create_user(
        body.first_name, body.last_name, body.patronymic_name,
        body.gender, body.password, body.phone, body.role
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "password"}


@router.get("/{user_id}")
async def get_user(
    user_id: int,
    conn=Depends(get_db),
    _=Depends(require_admin),
):
    service = UserService(UserRepository(conn))
    return await service.get_user_by_id(user_id)


@router.put("/{user_id}")
async def update_user(
    user_id: int,
    body: UserUpdateBody,
    conn=Depends(get_db),
    _=Depends(require_admin),
):
    service = UserService(UserRepository(conn))
    return await service.update_user(
        user_id, body.first_name, body.last_name, body.patronymic_name,
        body.gender, body.password, body.phone, body.role
    )


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    conn=Depends(get_db),
    _=Depends(require_admin),
):
    service = UserService(UserRepository(conn))
    await service.delete_user(user_id)
