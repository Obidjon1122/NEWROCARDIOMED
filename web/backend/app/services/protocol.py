from typing import Dict, Any, Optional
from fastapi import HTTPException

from app.repositories.protocol import ProtocolRepository


class ProtocolService:
    def __init__(self, repo: ProtocolRepository):
        self.repo = repo

    async def get_protocol_by_id(self, protocol_id: int) -> dict:
        protocol = await self.repo.get_by_id(protocol_id)
        if not protocol:
            raise HTTPException(status_code=404, detail="Protokol topilmadi")
        return protocol

    async def get_all_by_doctor_id(self, doctor_id: int) -> list:
        return await self.repo.get_all_by_doctor_id(doctor_id)

    async def get_forms_by_client_id(self, client_id: int, page: int, page_size: int) -> dict:
        if page < 1 or page_size < 1 or page_size > 100:
            raise HTTPException(status_code=400, detail="Pagination parametrlari noto'g'ri")
        return await self.repo.get_forms_by_client_id(client_id, page, page_size)

    async def get_forms_by_client_and_protocol(self, client_id: int, protocol_id: int,
                                                page: int, page_size: int,
                                                date: str = "") -> dict:
        return await self.repo.get_forms_by_client_and_protocol(
            client_id, protocol_id, page, page_size, date
        )

    async def get_form_data(self, protocol_form_id: int, client_id: int, doctor_id: int) -> dict:
        data = await self.repo.get_form_data(protocol_form_id, client_id, doctor_id)
        if data is None:
            raise HTTPException(status_code=404, detail="Protokol formasi topilmadi")
        return data

    async def create_protocol_form(self, client_id: int, protocol_id: int,
                                   protocol_form: Dict[str, Any]) -> bool:
        if client_id <= 0 or protocol_id <= 0:
            raise HTTPException(status_code=400, detail="Client yoki Protocol ID noto'g'ri")
        return await self.repo.create_protocol_form(client_id, protocol_id, protocol_form)
