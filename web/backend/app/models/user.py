from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    first_name: str
    last_name: str
    patronymic_name: str
    gender: str
    phone: str
    role: str


class UserCreate(UserBase):
    password: str


class UserUpdate(UserBase):
    id: int
    password: str


class UserResponse(UserBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    phone: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class PaginationRequest(BaseModel):
    page: int = 1
    page_size: int = 20
    sort_by: str = "id"
    sort_order: str = "ASC"


class PaginationResponse(BaseModel):
    items: list
    total_count: int
    total_pages: int
    current_page: int
    page_size: int
    has_next: bool
    has_previous: bool
