from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from app.database import get_db
from app.repositories.client import ClientRepository
from app.services.client import ClientService
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/clients", tags=["clients"])


class ClientBody(BaseModel):
    first_name: str = ""
    last_name: str = ""
    patronymic: str = ""
    gender: str = ""
    phone: str = ""
    birth_date: str = ""
    region: str = ""


@router.get("")
async def get_clients(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search by name or phone"),
    protocol_id: int = Query(0, description="Filter by protocol_id"),
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ClientService(ClientRepository(conn))
    if protocol_id > 0:
        return await service.get_all_by_protocol_id(page, page_size, protocol_id, search)
    return await service.get_all_clients(page, page_size, search)


@router.post("", status_code=201)
async def create_client(
    body: ClientBody,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ClientService(ClientRepository(conn))
    return await service.create_client(
        body.first_name, body.last_name, body.patronymic, body.gender,
        body.phone, body.birth_date, body.region
    )


@router.get("/{client_id}")
async def get_client(
    client_id: int,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ClientService(ClientRepository(conn))
    return await service.get_client_by_id(client_id)


@router.put("/{client_id}")
async def update_client(
    client_id: int,
    body: ClientBody,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ClientService(ClientRepository(conn))
    return await service.update_client(
        client_id, body.first_name, body.last_name, body.patronymic, body.gender,
        body.phone, body.birth_date, body.region
    )


@router.delete("/{client_id}", status_code=204)
async def delete_client(
    client_id: int,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ClientService(ClientRepository(conn))
    await service.delete_client(client_id)
