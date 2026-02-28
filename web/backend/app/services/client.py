import re
from fastapi import HTTPException

from app.repositories.client import ClientRepository


class ClientService:
    def __init__(self, repo: ClientRepository):
        self.repo = repo

    @staticmethod
    def validate_phone(phone: str) -> bool:
        if not phone or len(phone) > 20:
            return False
        return bool(re.match(r"^\+?\d{9,20}$", phone))

    def _validate_fields(self, first_name: str, last_name: str, gender: str,
                          phone: str, birth_date: str, region: str):
        if not first_name or len(first_name) > 50:
            raise HTTPException(status_code=400, detail="Ism xato")
        if not last_name or len(last_name) > 50:
            raise HTTPException(status_code=400, detail="Familiya xato")
        if gender not in ("male", "female"):
            raise HTTPException(status_code=400, detail="Jins noto'g'ri (male/female)")
        if not self.validate_phone(phone):
            raise HTTPException(status_code=400, detail="Telefon raqami noto'g'ri")
        if not birth_date:
            raise HTTPException(status_code=400, detail="Tug'ilgan sana kiritilmagan")
        if not region:
            raise HTTPException(status_code=400, detail="Viloyat kiritilmagan")

    async def create_client(self, first_name: str, last_name: str, gender: str,
                            phone: str, birth_date: str, region: str) -> dict:
        self._validate_fields(first_name, last_name, gender, phone, birth_date, region)
        client = await self.repo.create(first_name, last_name, gender, phone, birth_date, region)
        if not client:
            raise HTTPException(status_code=500, detail="Mijoz yaratishda xato")
        return client

    async def get_client_by_id(self, client_id: int) -> dict:
        client = await self.repo.get_by_id(client_id)
        if not client:
            raise HTTPException(status_code=404, detail="Mijoz topilmadi")
        return client

    async def update_client(self, client_id: int, first_name: str, last_name: str,
                            gender: str, phone: str, birth_date: str, region: str) -> dict:
        self._validate_fields(first_name, last_name, gender, phone, birth_date, region)

        if not await self.repo.exists_by_id(client_id):
            raise HTTPException(status_code=404, detail="Mijoz topilmadi")

        client = await self.repo.update(client_id, first_name, last_name, gender, phone, birth_date, region)
        if not client:
            raise HTTPException(status_code=500, detail="Yangilashda xato")
        return client

    async def delete_client(self, client_id: int) -> bool:
        if not await self.repo.exists_by_id(client_id):
            raise HTTPException(status_code=404, detail="Mijoz topilmadi")
        return await self.repo.delete(client_id)

    async def get_all_clients(self, page: int, page_size: int, search: str = "") -> dict:
        if page < 1 or page_size < 1 or page_size > 100:
            raise HTTPException(status_code=400, detail="Pagination parametrlari noto'g'ri")
        return await self.repo.get_all(page, page_size, search)

    async def get_all_by_protocol_id(self, page: int, page_size: int,
                                      protocol_id: int, search: str = "") -> dict:
        return await self.repo.get_all_by_protocol_id(page, page_size, protocol_id, search)
