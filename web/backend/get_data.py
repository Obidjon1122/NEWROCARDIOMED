import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect(
            user='turnerko', password='2002',
            database='Nevrocardiomed', host='localhost'
        )
        
        tables = ['users', 'clients', 'protocols', 'protocol_forms', 'templates']
        for table in tables:
            exists = await conn.fetchval(
                "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
                table
            )
            print(f"Table {table} exists: {exists}")

        await conn.close()
    except Exception as e:
        print("Error:", e)

asyncio.run(main())
