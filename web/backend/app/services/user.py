import re
from typing import Optional
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user import UserRepository


class UserService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    @staticmethod
    def validate_phone(phone: str) -> bool:
        if not phone or len(phone) > 20:
            return False
        return bool(re.match(r"^\+?\d{9,20}$", phone))

    @staticmethod
    def validate_password(password: str) -> bool:
        return 6 <= len(password) <= 255

    def _validate_user_fields(self, first_name: str, last_name: str, patronymic_name: str,
                               gender: str, password: str, phone: str, role: str):
        if not first_name or len(first_name) > 20:
            raise HTTPException(status_code=400, detail="Ism xato (bo'sh yoki 20 ta belgidan ko'p)")
        if not last_name or len(last_name) > 20:
            raise HTTPException(status_code=400, detail="Familiya xato (bo'sh yoki 20 ta belgidan ko'p)")
        if not patronymic_name or len(patronymic_name) > 20:
            raise HTTPException(status_code=400, detail="Otasining ismi xato")
        if gender not in ("male", "female"):
            raise HTTPException(status_code=400, detail="Jins faqat 'male' yoki 'female' bo'lishi kerak")
        if not self.validate_password(password):
            raise HTTPException(status_code=400, detail="Parol kamida 6 ta belgi bo'lishi kerak")
        if not self.validate_phone(phone):
            raise HTTPException(status_code=400, detail="Telefon raqami noto'g'ri formatda")
        if role not in ("admin", "doctor"):
            raise HTTPException(status_code=400, detail="Role faqat 'admin' yoki 'doctor' bo'lishi kerak")

    async def create_user(self, first_name: str, last_name: str, patronymic_name: str,
                          gender: str, password: str, phone: str, role: str) -> dict:
        self._validate_user_fields(first_name, last_name, patronymic_name, gender, password, phone, role)

        if await self.repo.exists_by_phone(phone):
            raise HTTPException(status_code=409, detail="Bu telefon raqami allaqachon mavjud")

        hashed = hash_password(password, phone)
        user = await self.repo.create(first_name, last_name, patronymic_name, gender, hashed, phone, role)
        if not user:
            raise HTTPException(status_code=500, detail="Foydalanuvchi yaratishda xato")
        return user

    async def get_user_by_id(self, user_id: int) -> dict:
        user = await self.repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
        return user

    async def update_user(self, user_id: int, first_name: str, last_name: str,
                          patronymic_name: str, gender: str, password: str,
                          phone: str, role: str) -> dict:
        self._validate_user_fields(first_name, last_name, patronymic_name, gender, password, phone, role)

        if not await self.repo.exists_by_id(user_id):
            raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

        existing = await self.repo.get_by_phone(phone)
        if existing and existing["id"] != user_id:
            raise HTTPException(status_code=409, detail="Bu telefon raqami boshqa foydalanuvchiga tegishli")

        hashed = hash_password(password, phone)
        user = await self.repo.update(user_id, first_name, last_name, patronymic_name, gender, hashed, phone, role)
        if not user:
            raise HTTPException(status_code=500, detail="Yangilashda xato")
        return user

    async def delete_user(self, user_id: int) -> bool:
        if not await self.repo.exists_by_id(user_id):
            raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
        return await self.repo.delete(user_id)

    async def login(self, phone: str, password: str) -> dict:
        if not self.validate_phone(phone):
            raise HTTPException(status_code=400, detail="Telefon raqami noto'g'ri formatda")
        if not self.validate_password(password):
            raise HTTPException(status_code=400, detail="Parol kamida 6 ta belgi bo'lishi kerak")

        user = await self.repo.get_by_phone(phone)
        if not user:
            raise HTTPException(status_code=401, detail="Bunday telefon raqamli foydalanuvchi topilmadi")

        if not verify_password(password, phone, user["password"]):
            raise HTTPException(status_code=401, detail="Parol noto'g'ri")

        token_data = {"user_id": user["id"], "phone": user["phone"], "role": user["role"]}
        token = create_access_token(token_data)

        user_resp = {k: v for k, v in user.items() if k != "password"}
        return {"token": token, "user": user_resp}

    async def get_all_users(self, page: int, page_size: int) -> dict:
        if page < 1 or page_size < 1 or page_size > 100:
            raise HTTPException(status_code=400, detail="Pagination parametrlari noto'g'ri")
        return await self.repo.get_all(page, page_size)
