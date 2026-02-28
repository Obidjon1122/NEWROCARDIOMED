from pydantic import BaseModel
from typing import Optional, Dict, List, Any


class ProtocolBase(BaseModel):
    title: str
    doctor_id: int


class ProtocolResponse(ProtocolBase):
    id: int
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class ProtocolFormItem(BaseModel):
    protocol_form_id: int
    protocol_id: int
    protocol_title: str
    created_at: str


class ProtocolFormCreate(BaseModel):
    client_id: int
    protocol_id: int
    protocol_form: Dict[str, Any]


class ProtocolFormData(BaseModel):
    data: Dict[str, str]


class ProtocolFormsResponse(BaseModel):
    items: List[ProtocolFormItem]
    total_count: int
    total_pages: int
    current_page: int
    page_size: int
    has_next: bool
    has_previous: bool


class ProtocolDashboardItem(BaseModel):
    protocol_id: int
    protocol_title: str


class ProtocolDashboardResponse(BaseModel):
    items: List[ProtocolDashboardItem]
