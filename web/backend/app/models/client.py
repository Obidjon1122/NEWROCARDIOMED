from pydantic import BaseModel
from typing import Optional


class ClientBase(BaseModel):
    first_name: str
    last_name: str
    gender: str
    phone: str
    birth_date: str
    region: str


class ClientCreate(ClientBase):
    pass


class ClientUpdate(ClientBase):
    id: int


class ClientResponse(ClientBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
