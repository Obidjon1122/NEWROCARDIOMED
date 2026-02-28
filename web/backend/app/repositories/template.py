from typing import Optional, List
import asyncpg


class TemplateRepository:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def create(self, doctor_id: int, title: str, description: str,
                     html_template: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            INSERT INTO protocol_templates (doctor_id, title, description, html_template)
            VALUES ($1, $2, $3, $4)
            RETURNING id, doctor_id, title, description, html_template,
                      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
            """,
            doctor_id, title, description, html_template
        )
        return dict(row) if row else None

    async def add_field(self, template_id: int, field_name: str, field_label: str,
                        field_type: str, field_order: int, default_values: List[str],
                        is_required: bool, row_position: int, column_position: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            INSERT INTO template_fields
                (template_id, field_name, field_label, field_type, field_order,
                 default_values, is_required, row_position, column_position)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, template_id, field_name, field_label, field_type,
                      field_order, default_values, is_required, row_position, column_position
            """,
            template_id, field_name, field_label, field_type, field_order,
            default_values, is_required, row_position, column_position
        )
        return dict(row) if row else None

    async def get_by_id(self, template_id: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, doctor_id, title, description, html_template,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
            FROM protocol_templates WHERE id = $1
            """,
            template_id
        )
        if not row:
            return None
        template = dict(row)
        template["fields"] = await self._get_fields(template_id)
        return template

    async def get_all_by_doctor_id(self, doctor_id: int) -> List[dict]:
        rows = await self.conn.fetch(
            """
            SELECT id, doctor_id, title, description, html_template,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at
            FROM protocol_templates WHERE doctor_id = $1 ORDER BY id
            """,
            doctor_id
        )
        result = []
        for row in rows:
            t = dict(row)
            t["fields"] = await self._get_fields(t["id"])
            result.append(t)
        return result

    async def _get_fields(self, template_id: int) -> List[dict]:
        rows = await self.conn.fetch(
            """
            SELECT id, template_id, field_name, field_label, field_type,
                   field_order, default_values, is_required, row_position, column_position
            FROM template_fields WHERE template_id = $1
            ORDER BY field_order ASC
            """,
            template_id
        )
        return [dict(r) for r in rows]

    async def update_html_template(self, template_id: int, html_template: str) -> bool:
        result = await self.conn.execute(
            "UPDATE protocol_templates SET html_template=$2 WHERE id=$1",
            template_id, html_template
        )
        return result == "UPDATE 1"

    async def delete(self, template_id: int) -> bool:
        result = await self.conn.execute(
            "DELETE FROM protocol_templates WHERE id=$1", template_id
        )
        return result == "DELETE 1"

    async def exists_by_id(self, template_id: int) -> bool:
        return await self.conn.fetchval(
            "SELECT EXISTS(SELECT 1 FROM protocol_templates WHERE id=$1)", template_id
        )
