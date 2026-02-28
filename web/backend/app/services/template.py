from typing import List, Optional
from fastapi import HTTPException

from app.repositories.template import TemplateRepository


class TemplateService:
    def __init__(self, repo: TemplateRepository):
        self.repo = repo

    async def create_template(self, doctor_id: int, title: str, description: str,
                              html_template: str, fields: list) -> dict:
        if not title:
            raise HTTPException(status_code=400, detail="Shablon nomi kiritilmagan")

        template = await self.repo.create(doctor_id, title, description, html_template)
        if not template:
            raise HTTPException(status_code=500, detail="Shablon yaratishda xato")

        for field in (fields or []):
            await self.repo.add_field(
                template_id=template["id"],
                field_name=field.get("field_name", ""),
                field_label=field.get("field_label", ""),
                field_type=field.get("field_type", "text"),
                field_order=field.get("field_order", 0),
                default_values=field.get("default_values") or [],
                is_required=field.get("is_required", False),
                row_position=field.get("row_position", 0),
                column_position=field.get("column_position", 0),
            )

        return await self.repo.get_by_id(template["id"])

    async def get_template(self, template_id: int) -> dict:
        template = await self.repo.get_by_id(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Shablon topilmadi")
        return template

    async def get_all_by_doctor(self, doctor_id: int) -> list:
        return await self.repo.get_all_by_doctor_id(doctor_id)

    async def delete_template(self, template_id: int, doctor_id: int) -> bool:
        template = await self.repo.get_by_id(template_id)
        if not template:
            raise HTTPException(status_code=404, detail="Shablon topilmadi")
        if template["doctor_id"] != doctor_id:
            raise HTTPException(status_code=403, detail="Bu shablonni o'chirishga ruxsat yo'q")
        return await self.repo.delete(template_id)

    async def update_html_template(self, template_id: int, html_template: str) -> bool:
        if not await self.repo.exists_by_id(template_id):
            raise HTTPException(status_code=404, detail="Shablon topilmadi")
        return await self.repo.update_html_template(template_id, html_template)
