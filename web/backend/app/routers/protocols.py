import json
from typing import Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from app.database import get_db
from app.repositories.protocol import ProtocolRepository
from app.repositories.client import ClientRepository
from app.repositories.user import UserRepository
from app.services.protocol import ProtocolService
from app.services.docx_generator import generate_protocol_docx
from app.core.auth import get_current_user

router = APIRouter(prefix="/api", tags=["protocols"])


class ProtocolFormCreate(BaseModel):
    client_id: int
    protocol_id: int
    protocol_form: Dict[str, Any]


class ProtocolPreviewDraft(BaseModel):
    protocol_id: int
    client_id: int
    form_data: Dict[str, Any]


@router.get("/protocols/doctor")
async def get_doctor_protocols(
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    return await service.get_all_by_doctor_id(current_user["id"])


@router.get("/protocols/{protocol_id}")
async def get_protocol(
    protocol_id: int,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    return await service.get_protocol_by_id(protocol_id)


@router.get("/protocol-forms/client/{client_id}/protocol/{protocol_id}")
async def get_forms_by_client_and_protocol(
    client_id: int,
    protocol_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    date: str = Query("", description="YYYY-MM-DD format"),
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    return await service.get_forms_by_client_and_protocol(
        client_id, protocol_id, page, page_size, date
    )


@router.get("/protocol-forms/client/{client_id}")
async def get_forms_by_client(
    client_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    return await service.get_forms_by_client_id(client_id, page, page_size)


@router.get("/protocol-forms/{form_id}/data")
async def get_form_data(
    form_id: int,
    client_id: int = Query(...),
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    return await service.get_form_data(form_id, client_id, current_user["id"])


@router.post("/protocol-forms/preview-draft")
async def preview_protocol_draft(
    body: ProtocolPreviewDraft,
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Saqlamay DOCX preview qaytaradi (form to'ldirilgandan keyin ko'rish uchun)"""
    import io
    from docx import Document as DocxDoc

    client_row = await conn.fetchrow(
        "SELECT id, first_name, last_name, gender, birth_date, phone, region FROM clients WHERE id = $1",
        body.client_id
    )
    if not client_row:
        raise HTTPException(status_code=404, detail="Bemor topilmadi")
    client = dict(client_row)

    doctor_row = await conn.fetchrow(
        "SELECT id, first_name, last_name, patronymic, phone, role FROM users WHERE id = $1",
        current_user["id"]
    )
    doctor = dict(doctor_row) if doctor_row else current_user
    if "patronymic" in doctor and "patronymic_name" not in doctor:
        doctor["patronymic_name"] = doctor["patronymic"]

    protocol_row = await conn.fetchrow(
        "SELECT title FROM protocols WHERE id = $1", body.protocol_id
    )
    protocol_title = protocol_row["title"] if protocol_row else ""

    import datetime
    created_at = datetime.date.today().isoformat()

    try:
        docx_bytes = generate_protocol_docx(
            protocol_id=body.protocol_id,
            protocol_title=protocol_title,
            form_data=body.form_data,
            client=client,
            doctor=doctor,
            created_at=created_at,
        )
        doc = DocxDoc(io.BytesIO(docx_bytes))
        paragraphs = []
        for p in doc.paragraphs:
            if not p.text.strip():
                continue
            bold = bool(p.runs) and all(r.bold for r in p.runs if r.text.strip())
            centered = p.alignment is not None and int(p.alignment) == 1
            paragraphs.append({"text": p.text, "bold": bold, "centered": centered})
    except Exception as e:
        return {"paragraphs": [], "error": str(e)}

    return {"paragraphs": paragraphs}


@router.post("/protocol-forms", status_code=201)
async def create_protocol_form(
    body: ProtocolFormCreate,
    conn=Depends(get_db),
    _=Depends(get_current_user),
):
    service = ProtocolService(ProtocolRepository(conn))
    await service.create_protocol_form(body.client_id, body.protocol_id, body.protocol_form)
    return {"success": True}


@router.get("/protocol-forms/{form_id}/preview")
async def preview_protocol_form(
    form_id: int,
    client_id: int = Query(...),
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Protokol hujjatini preview ko'rinishida qaytaradi (paragraflar + form_data)"""
    import io
    from docx import Document as DocxDoc

    row = await conn.fetchrow(
        """
        SELECT pf.protocol_form, pf.protocol_id, p.title AS protocol_title,
               TO_CHAR(pf.created_at, 'YYYY-MM-DD') AS created_at
        FROM protocol_forms pf
        JOIN protocols p ON pf.protocol_id = p.id
        WHERE pf.id = $1 AND pf.client_id = $2 AND p.doctor_id = $3
        """,
        form_id, client_id, current_user["id"]
    )
    if not row:
        raise HTTPException(status_code=404, detail="Protokol topilmadi")

    protocol_id = row["protocol_id"]
    protocol_title = row["protocol_title"] or ""
    created_at = row["created_at"] or ""

    form_data: Dict[str, Any] = {}
    if row["protocol_form"]:
        try:
            parsed = json.loads(row["protocol_form"])
            form_data = _flatten_json(parsed)
        except Exception:
            pass

    client_row = await conn.fetchrow(
        "SELECT id, first_name, last_name, gender, birth_date, phone, region FROM clients WHERE id = $1",
        client_id
    )
    if not client_row:
        raise HTTPException(status_code=404, detail="Bemor topilmadi")
    client = dict(client_row)

    doctor_row = await conn.fetchrow(
        "SELECT id, first_name, last_name, patronymic, phone, role FROM users WHERE id = $1",
        current_user["id"]
    )
    doctor = dict(doctor_row) if doctor_row else current_user
    if "patronymic" in doctor and "patronymic_name" not in doctor:
        doctor["patronymic_name"] = doctor["patronymic"]

    try:
        docx_bytes = generate_protocol_docx(
            protocol_id=protocol_id,
            protocol_title=protocol_title,
            form_data=form_data,
            client=client,
            doctor=doctor,
            created_at=created_at,
        )
        doc = DocxDoc(io.BytesIO(docx_bytes))
        paragraphs = []
        for p in doc.paragraphs:
            if not p.text.strip() and not p.text == "\t":
                continue
            bold = bool(p.runs) and all(r.bold for r in p.runs if r.text.strip())
            centered = p.alignment is not None and int(p.alignment) == 1
            paragraphs.append({"text": p.text, "bold": bold, "centered": centered})
    except Exception:
        paragraphs = []

    return {"paragraphs": paragraphs, "form_data": form_data, "protocol_id": protocol_id}


@router.get("/protocol-forms/{form_id}/download/docx")
async def download_protocol_docx(
    form_id: int,
    client_id: int = Query(...),
    conn=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Protokolni DOCX formatda yuklab olish"""
    # Form ma'lumotlarini olish
    proto_repo = ProtocolRepository(conn)
    row = await conn.fetchrow(
        """
        SELECT pf.protocol_form, pf.protocol_id, p.title AS protocol_title,
               TO_CHAR(pf.created_at, 'YYYY-MM-DD') AS created_at
        FROM protocol_forms pf
        JOIN protocols p ON pf.protocol_id = p.id
        WHERE pf.id = $1 AND pf.client_id = $2 AND p.doctor_id = $3
        """,
        form_id, client_id, current_user["id"]
    )
    if not row:
        raise HTTPException(status_code=404, detail="Protokol topilmadi")

    protocol_id = row["protocol_id"]
    protocol_title = row["protocol_title"] or ""
    created_at = row["created_at"] or ""

    # Form ma'lumotlarini parse qilish
    form_data: Dict[str, Any] = {}
    if row["protocol_form"]:
        try:
            parsed = json.loads(row["protocol_form"])
            form_data = _flatten_json(parsed)
        except Exception:
            pass

    # Bemor ma'lumotlarini olish
    client_row = await conn.fetchrow(
        """
        SELECT id, first_name, last_name, gender,
               birth_date, phone, region
        FROM clients WHERE id = $1
        """,
        client_id
    )
    if not client_row:
        raise HTTPException(status_code=404, detail="Bemor topilmadi")

    client = dict(client_row)

    # Doktor ma'lumotlari
    doctor_row = await conn.fetchrow(
        """
        SELECT id, first_name, last_name, patronymic, phone, role
        FROM users WHERE id = $1
        """,
        current_user["id"]
    )
    doctor = dict(doctor_row) if doctor_row else current_user
    # patronymic_name ni ko'chirish (agar mavjud bo'lsa)
    if "patronymic" in doctor and "patronymic_name" not in doctor:
        doctor["patronymic_name"] = doctor["patronymic"]

    # DOCX generatsiya
    docx_bytes = generate_protocol_docx(
        protocol_id=protocol_id,
        protocol_title=protocol_title,
        form_data=form_data,
        client=client,
        doctor=doctor,
        created_at=created_at,
    )

    # Fayl nomi
    client_name = f"{client.get('last_name', '')}_{client.get('first_name', '')}"
    filename = f"protocol_{protocol_id}_{client_name}_{created_at}.docx"
    filename = filename.replace(" ", "_")

    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(docx_bytes)),
        },
    )


def _flatten_json(obj: Any, prefix: str = "") -> dict:
    """JSON ni yassi dict ga aylantirish"""
    result = {}
    if isinstance(obj, dict):
        for key, value in obj.items():
            full_key = f"{prefix}_{key}" if prefix else key
            if isinstance(value, dict):
                result.update(_flatten_json(value, full_key))
            elif isinstance(value, list):
                for i, item in enumerate(value):
                    result.update(_flatten_json(item, f"{full_key}_{i}"))
            else:
                result[full_key] = str(value) if value is not None else ""
    else:
        result[prefix] = str(obj) if obj is not None else ""
    return result
