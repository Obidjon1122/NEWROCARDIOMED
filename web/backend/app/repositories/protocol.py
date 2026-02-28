from typing import Optional, Dict, Any
import asyncpg
import json


class ProtocolRepository:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def get_by_id(self, protocol_id: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, title, doctor_id,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM protocols WHERE id = $1
            """,
            protocol_id
        )
        return dict(row) if row else None

    async def get_all_by_doctor_id(self, doctor_id: int) -> list:
        rows = await self.conn.fetch(
            "SELECT id AS protocol_id, title AS protocol_title FROM protocols WHERE doctor_id = $1 ORDER BY id",
            doctor_id
        )
        return [dict(r) for r in rows]

    async def get_forms_by_client_id(self, client_id: int, page: int, page_size: int) -> dict:
        offset = (page - 1) * page_size
        total = await self.conn.fetchval(
            "SELECT COUNT(*) FROM protocol_forms WHERE client_id = $1", client_id
        )
        rows = await self.conn.fetch(
            """
            SELECT pf.id AS protocol_form_id, pf.protocol_id,
                   p.title AS protocol_title,
                   TO_CHAR(pf.created_at, 'YYYY-MM-DD') AS created_at
            FROM protocol_forms pf
            JOIN protocols p ON pf.protocol_id = p.id
            WHERE pf.client_id = $1
            ORDER BY pf.id DESC LIMIT $2 OFFSET $3
            """,
            client_id, page_size, offset
        )
        total_pages = max(1, (total + page_size - 1) // page_size)
        return {
            "items": [dict(r) for r in rows],
            "total_count": total,
            "total_pages": total_pages,
            "current_page": page,
            "page_size": page_size,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }

    async def get_forms_by_client_and_protocol(self, client_id: int, protocol_id: int,
                                                page: int, page_size: int,
                                                date: str = "") -> dict:
        offset = (page - 1) * page_size
        params: list = [client_id, protocol_id]

        count_query = "SELECT COUNT(*) FROM protocol_forms WHERE client_id = $1 AND protocol_id = $2"
        main_where = "pf.client_id = $1 AND pf.protocol_id = $2"

        if date:
            params.append(date)
            extra = f" AND pf.created_at >= $3::date AND pf.created_at < ($3::date + INTERVAL '1 day')"
            count_query += extra.replace("pf.", "")
            main_where += extra

        total = await self.conn.fetchval(count_query, *params)

        params.extend([page_size, offset])
        rows = await self.conn.fetch(
            f"""
            SELECT pf.id AS protocol_form_id, pf.protocol_id,
                   p.title AS protocol_title,
                   TO_CHAR(pf.created_at, 'YYYY-MM-DD') AS created_at
            FROM protocol_forms pf
            JOIN protocols p ON pf.protocol_id = p.id
            WHERE {main_where}
            ORDER BY pf.id DESC LIMIT ${len(params)-1} OFFSET ${len(params)}
            """,
            *params
        )
        total_pages = max(1, (total + page_size - 1) // page_size)
        return {
            "items": [dict(r) for r in rows],
            "total_count": total,
            "total_pages": total_pages,
            "current_page": page,
            "page_size": page_size,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }

    async def get_form_data(self, protocol_form_id: int, client_id: int, doctor_id: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT pf.protocol_form, TO_CHAR(pf.created_at, 'YYYY-MM-DD') AS created_at
            FROM protocol_forms pf
            JOIN protocols p ON pf.protocol_id = p.id
            WHERE pf.id = $1 AND pf.client_id = $2 AND p.doctor_id = $3
            """,
            protocol_form_id, client_id, doctor_id
        )
        if not row:
            return None

        data = {}
        if row["protocol_form"]:
            try:
                parsed = json.loads(row["protocol_form"])
                data = _flatten_json(parsed)
            except Exception:
                pass
        data["date"] = row["created_at"] or ""
        return data

    async def create_protocol_form(self, client_id: int, protocol_id: int,
                                   protocol_form: Dict[str, Any]) -> bool:
        form_json = json.dumps(protocol_form, ensure_ascii=False)
        await self.conn.execute(
            """
            INSERT INTO protocol_forms (client_id, protocol_id, protocol_form)
            VALUES ($1, $2, $3::jsonb)
            """,
            client_id, protocol_id, form_json
        )
        return True

    async def exists_by_id(self, protocol_id: int) -> bool:
        return await self.conn.fetchval(
            "SELECT EXISTS(SELECT 1 FROM protocols WHERE id=$1)", protocol_id
        )


def _flatten_json(obj: Any, prefix: str = "") -> dict:
    """C++ parseProtocolForm() ni Python'da takrorlash"""
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
