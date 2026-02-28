from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.database import get_db
from app.repositories.template import TemplateRepository
from app.services.template import TemplateService
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/templates", tags=["templates"])


class TemplateFieldBody(BaseModel):
    field_name: str
    field_label: str
    field_type: str = "text"
    field_order: int = 0
    default_values: Optional[List[str]] = None
    is_required: bool = False
    row_position: int = 0
    column_position: int = 0


class TemplateCreateBody(BaseModel):
    title: str
    description: Optional[str] = ""
    html_template: Optional[str] = ""
    fields: Optional[List[TemplateFieldBody]] = None


class HtmlUpdateBody(BaseModel):
    html_template: str


@router.get("")
async def get_templates(
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = TemplateService(TemplateRepository(conn))
    return await service.get_all_by_doctor(current_user["id"])


@router.post("", status_code=201)
async def create_template(
    body: TemplateCreateBody,
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = TemplateService(TemplateRepository(conn))
    fields = [f.model_dump() for f in (body.fields or [])]
    return await service.create_template(
        current_user["id"], body.title, body.description or "",
        body.html_template or "", fields
    )


@router.get("/{template_id}")
async def get_template(
    template_id: int,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = TemplateService(TemplateRepository(conn))
    return await service.get_template(template_id)


@router.patch("/{template_id}/html")
async def update_html(
    template_id: int,
    body: HtmlUpdateBody,
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = TemplateService(TemplateRepository(conn))
    await service.update_html_template(template_id, body.html_template)
    return {"success": True}


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: int,
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = TemplateService(TemplateRepository(conn))
    await service.delete_template(template_id, current_user["id"])
