from pydantic import BaseModel
from typing import Optional, List


class TemplateFieldBase(BaseModel):
    field_name: str
    field_label: str
    field_type: str = "text"
    field_order: int = 0
    default_values: Optional[List[str]] = None
    is_required: bool = False
    row_position: int = 0
    column_position: int = 0


class TemplateFieldResponse(TemplateFieldBase):
    id: int
    template_id: int

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    title: str
    description: Optional[str] = None
    html_template: Optional[str] = None
    fields: Optional[List[TemplateFieldBase]] = None


class TemplateResponse(BaseModel):
    id: int
    doctor_id: int
    title: str
    description: Optional[str] = None
    html_template: Optional[str] = None
    fields: List[TemplateFieldResponse] = []
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
