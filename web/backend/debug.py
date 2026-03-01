import asyncio
import asyncpg
import json

async def main():
    try:
        conn = await asyncpg.connect(
            user='turnerko', password='2002',
            database='Nevrocardiomed', host='localhost'
        )
        row = await conn.fetchrow('SELECT id, protocol_form FROM protocol_forms WHERE protocol_id=1 ORDER BY id DESC LIMIT 1')
        if row:
            print("Form ID:", row['id'])
            form_str = row['protocol_form']
            print("Raw string in DB:", form_str)
            try:
                parsed = json.loads(form_str)
                print("Keys:", list(parsed.keys()))
            except Exception as e:
                print("JSON parse error:", e)
        else:
            print("No protocol form found")
        await conn.close()
    except Exception as e:
        print("DB Error:", e)

asyncio.run(main())
