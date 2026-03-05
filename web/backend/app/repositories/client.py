from typing import Optional, List
import asyncpg


class ClientRepository:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def create(self, first_name: str, last_name: str, gender: str,
                     phone: str, birth_date: str, region: str) -> Optional[dict]:
        bd = birth_date if birth_date else None
        row = await self.conn.fetchrow(
            """
            INSERT INTO clients (first_name, last_name, gender, phone, birth_date, region)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, first_name, last_name, gender, phone,
                      TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            """,
            first_name, last_name, gender, phone, bd, region
        )
        return dict(row) if row else None

    async def get_by_id(self, client_id: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, first_name, last_name, gender, phone,
                   TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM clients WHERE id = $1
            """,
            client_id
        )
        return dict(row) if row else None

    async def get_by_phone(self, phone: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, first_name, last_name, gender, phone,
                   TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM clients WHERE phone = $1
            """,
            phone
        )
        return dict(row) if row else None

    async def get_all(self, page: int, page_size: int, search: str = "") -> dict:
        offset = (page - 1) * page_size

        if search:
            search_pattern = f"%{search}%"
            total = await self.conn.fetchval(
                "SELECT COUNT(*) FROM clients WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone ILIKE $1 OR TO_CHAR(birth_date, 'DD.MM.YYYY') ILIKE $1 OR TO_CHAR(birth_date, 'YYYY') ILIKE $1",
                search_pattern
            )
            rows = await self.conn.fetch(
                """
                SELECT id, first_name, last_name, gender, phone,
                       TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
                FROM clients
                WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR phone ILIKE $1 OR TO_CHAR(birth_date, 'DD.MM.YYYY') ILIKE $1 OR TO_CHAR(birth_date, 'YYYY') ILIKE $1
                ORDER BY id DESC LIMIT $2 OFFSET $3
                """,
                search_pattern, page_size, offset
            )
        else:
            total = await self.conn.fetchval("SELECT COUNT(*) FROM clients")
            rows = await self.conn.fetch(
                """
                SELECT id, first_name, last_name, gender, phone,
                       TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
                FROM clients ORDER BY id DESC LIMIT $1 OFFSET $2
                """,
                page_size, offset
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

    async def get_all_by_protocol_id(self, page: int, page_size: int,
                                     protocol_id: int, search: str = "") -> dict:
        offset = (page - 1) * page_size
        base_where = "pf.protocol_id = $1"
        params: list = [protocol_id]

        if search:
            search_pattern = f"%{search}%"
            params.append(search_pattern)
            base_where += f" AND (c.first_name ILIKE ${len(params)} OR c.last_name ILIKE ${len(params)} OR c.phone ILIKE ${len(params)})"

        total = await self.conn.fetchval(
            f"SELECT COUNT(DISTINCT c.id) FROM clients c JOIN protocol_forms pf ON pf.client_id = c.id WHERE {base_where}",
            *params
        )
        params.extend([page_size, offset])
        rows = await self.conn.fetch(
            f"""
            SELECT DISTINCT c.id, c.first_name, c.last_name, c.gender, c.phone,
                   TO_CHAR(c.birth_date, 'YYYY-MM-DD') AS birth_date, c.region,
                   TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(c.updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM clients c JOIN protocol_forms pf ON pf.client_id = c.id
            WHERE {base_where}
            ORDER BY c.id DESC LIMIT ${len(params)-1} OFFSET ${len(params)}
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

    async def update(self, client_id: int, first_name: str, last_name: str, gender: str,
                     phone: str, birth_date: str, region: str) -> Optional[dict]:
        bd = birth_date if birth_date else None
        row = await self.conn.fetchrow(
            """
            UPDATE clients SET first_name=$2, last_name=$3, gender=$4,
                phone=$5, birth_date=$6, region=$7, updated_at=NOW()
            WHERE id=$1
            RETURNING id, first_name, last_name, gender, phone,
                      TO_CHAR(birth_date, 'YYYY-MM-DD') AS birth_date, region,
                      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            """,
            client_id, first_name, last_name, gender, phone, bd, region
        )
        return dict(row) if row else None

    async def delete(self, client_id: int) -> bool:
        result = await self.conn.execute("DELETE FROM clients WHERE id = $1", client_id)
        return result == "DELETE 1"

    async def exists_by_id(self, client_id: int) -> bool:
        return await self.conn.fetchval("SELECT EXISTS(SELECT 1 FROM clients WHERE id=$1)", client_id)

    async def get_total_count(self) -> int:
        return await self.conn.fetchval("SELECT COUNT(*) FROM clients")
