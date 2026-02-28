from typing import Optional, List
import asyncpg


class UserRepository:
    def __init__(self, conn: asyncpg.Connection):
        self.conn = conn

    async def create(self, first_name: str, last_name: str, patronymic_name: str,
                     gender: str, password: str, phone: str, role: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            INSERT INTO users (first_name, last_name, patronymic, gender, password, phone, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, first_name, last_name, patronymic AS patronymic_name,
                      gender, phone, role,
                      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            """,
            first_name, last_name, patronymic_name, gender, password, phone, role
        )
        return dict(row) if row else None

    async def get_by_id(self, user_id: int) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, first_name, last_name, patronymic AS patronymic_name,
                   gender, phone, role,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM users WHERE id = $1
            """,
            user_id
        )
        return dict(row) if row else None

    async def get_by_phone(self, phone: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            SELECT id, first_name, last_name, patronymic AS patronymic_name,
                   gender, password, phone, role,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM users WHERE phone = $1
            """,
            phone
        )
        return dict(row) if row else None

    async def get_all(self, page: int, page_size: int) -> dict:
        offset = (page - 1) * page_size
        total = await self.conn.fetchval("SELECT COUNT(*) FROM users")
        rows = await self.conn.fetch(
            """
            SELECT id, first_name, last_name, patronymic AS patronymic_name,
                   gender, phone, role,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM users ORDER BY id ASC LIMIT $1 OFFSET $2
            """,
            page_size, offset
        )
        total_pages = (total + page_size - 1) // page_size
        return {
            "items": [dict(r) for r in rows],
            "total_count": total,
            "total_pages": total_pages,
            "current_page": page,
            "page_size": page_size,
            "has_next": page < total_pages,
            "has_previous": page > 1,
        }

    async def update(self, user_id: int, first_name: str, last_name: str, patronymic_name: str,
                     gender: str, password: str, phone: str, role: str) -> Optional[dict]:
        row = await self.conn.fetchrow(
            """
            UPDATE users SET first_name=$2, last_name=$3, patronymic=$4,
                gender=$5, password=$6, phone=$7, role=$8, updated_at=NOW()
            WHERE id=$1
            RETURNING id, first_name, last_name, patronymic AS patronymic_name,
                      gender, phone, role,
                      TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                      TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            """,
            user_id, first_name, last_name, patronymic_name, gender, password, phone, role
        )
        return dict(row) if row else None

    async def delete(self, user_id: int) -> bool:
        result = await self.conn.execute("DELETE FROM users WHERE id = $1", user_id)
        return result == "DELETE 1"

    async def exists_by_id(self, user_id: int) -> bool:
        return await self.conn.fetchval("SELECT EXISTS(SELECT 1 FROM users WHERE id=$1)", user_id)

    async def exists_by_phone(self, phone: str) -> bool:
        return await self.conn.fetchval("SELECT EXISTS(SELECT 1 FROM users WHERE phone=$1)", phone)

    async def get_by_role(self, role: str) -> List[dict]:
        rows = await self.conn.fetch(
            """
            SELECT id, first_name, last_name, patronymic AS patronymic_name,
                   gender, phone, role,
                   TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') AS created_at,
                   TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') AS updated_at
            FROM users WHERE role = $1 ORDER BY id
            """,
            role
        )
        return [dict(r) for r in rows]

    async def get_total_count(self) -> int:
        return await self.conn.fetchval("SELECT COUNT(*) FROM users")
