# NEVROCARDIOMED — Windows'da ishga tushirish qo'llanmasi

## Loyiha tuzilishi

```
NEWROCARDIOMED/
├── web/
│   ├── backend/          ← FastAPI (Python) — API server, port 8000
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── core/config.py    ← DB va JWT sozlamalari
│   │       ├── database.py       ← PostgreSQL ulanish
│   │       ├── routers/          ← API yo'llari (auth, clients, protocols...)
│   │       ├── repositories/     ← DB so'rovlari
│   │       └── services/
│   │           └── docx_generator.py  ← Word fayl yaratish
│   └── frontend/         ← React + Vite (TypeScript) — UI, port 5173
│       ├── package.json
│       ├── vite.config.ts        ← /api → localhost:8000 proxy
│       └── src/
└── protocoles/           ← DOCX shablon fayllar (14 ta .docx)
```

---

## 1-qadam: Dasturlarni o'rnatish

### 1.1 Python 3.12
- https://www.python.org/downloads/ sahifasidan yuklab oling
- O'rnatish vaqtida **"Add Python to PATH"** katagini belgilang
- Tekshirish: `python --version`

### 1.2 Node.js 20+
- https://nodejs.org/ sahifasidan **LTS** versiyasini yuklab oling
- Tekshirish: `node --version` va `npm --version`

### 1.3 PostgreSQL 16
- https://www.postgresql.org/download/windows/ sahifasidan yuklab oling
- O'rnatish vaqtida:
  - Parol: `2002` (yoki xohlaganingizni, lekin keyinchalik .env da ko'rsating)
  - Port: `5432` (standart)
  - pgAdmin ham o'rnatilsin — katagini qoldiring

---

## 2-qadam: PostgreSQL ma'lumotlar bazasini sozlash

pgAdmin ni oching YOKI **SQL Shell (psql)** dan foydalaning.

### 2.1 Foydalanuvchi va baza yaratish

pgAdmin da yangi Query Tool oching va quyidagini ishga tushiring:

```sql
-- Foydalanuvchi yaratish
CREATE USER turnerko WITH PASSWORD '2002';

-- Baza yaratish
CREATE DATABASE "Nevrocardiomed" OWNER turnerko;

-- Ruxsat berish
GRANT ALL PRIVILEGES ON DATABASE "Nevrocardiomed" TO turnerko;
```

### 2.2 Jadvallarni yaratish

`Nevrocardiomed` bazasiga ulanib (pgAdmin da: Databases → Nevrocardiomed → Query Tool), quyidagini ishga tushiring:

```sql
-- Foydalanuvchilar jadvali (shifokorlar)
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    patronymic  VARCHAR(100) DEFAULT '',
    gender      VARCHAR(10)  DEFAULT '',
    password    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  UNIQUE NOT NULL,
    role        VARCHAR(20)  DEFAULT 'doctor',
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- Bemorlar jadvali
CREATE TABLE IF NOT EXISTS clients (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    patronymic  VARCHAR(100) DEFAULT '',
    gender      VARCHAR(10)  DEFAULT '',
    phone       VARCHAR(20)  DEFAULT '',
    birth_date  DATE,
    region      VARCHAR(100) DEFAULT '',
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

-- Agar mavjud bazada patronymic ustuni yo'q bo'lsa:
-- ALTER TABLE clients ADD COLUMN patronymic VARCHAR(100) DEFAULT '';

-- Protokollar jadvali
CREATE TABLE IF NOT EXISTS protocols (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    doctor_id   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- Protokol shakllari jadvali (bemorga to'ldirilgan ma'lumotlar)
CREATE TABLE IF NOT EXISTS protocol_forms (
    id              SERIAL PRIMARY KEY,
    client_id       INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    protocol_id     INTEGER REFERENCES protocols(id) ON DELETE CASCADE,
    protocol_form   JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Jadval ruxsatlarini berish
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO turnerko;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO turnerko;
```

### 2.3 Birinchi shifokorni (admin) qo'shish

Shifokorni dastur orqali qo'shish mumkin, lekin tezroq yo'li — to'g'ridan SQL:

> **Muhim:** parol `passlib` + bcrypt bilan hash qilinadi.
> Shuning uchun birinchi foydalanuvchini API orqali yarating (backend ishga tushgandan keyin).
> Backend docs: http://localhost:8000/docs → `/api/users` POST

---

## 3-qadam: Backend sozlash

### 3.1 Papkaga o'tish
```
cd C:\...\NEWROCARDIOMED\web\backend
```

### 3.2 Virtual muhit yaratish
```
python -m venv venv
venv\Scripts\activate
```

### 3.3 Kutubxonalarni o'rnatish
```
pip install -r requirements.txt
```

### 3.4 `.env` fayl yaratish

`web\backend\.env` faylini yarating (Notepad yoki VSCode bilan):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Nevrocardiomed
DB_USER=turnerko
DB_PASSWORD=2002

JWT_SECRET=nevrocardiomed_secret_key_o'zgartiring
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=480

AUTH_PEPPER=
```

> Agar PostgreSQL o'rnatishda boshqa parol qo'ygan bo'lsangiz, `DB_PASSWORD` ni o'zgartiring.

---

## 4-qadam: Frontend sozlash

### 4.1 Papkaga o'tish
```
cd C:\...\NEWROCARDIOMED\web\frontend
```

### 4.2 Paketlarni o'rnatish
```
npm install
```

---

## 5-qadam: DOCX shablon fayllarini joylashtirish

`docx_generator.py` quyidagi yo'lda shablon fayllarni qidiradi:
```
NEWROCARDIOMED\protocoles\
```

Bu papkada quyidagi 14 ta `.docx` fayl bo'lishi shart:
```
Печень нов..docx
Почки нов..docx
Щитовидная железа..docx
Поджелудочная новый.docx
Селезёнка новый.docx
Простата новый.docx
Молочные железы новый.docx
Мошонка новый.docx
Малый таз новый.docx
Надпочечники новый.docx
Коленный сустав новый.docx
Первый ориместр новый.docx
Плод новый.docx
Сердцебиение.docx
```

> Agar bu papka mavjud bo'lsa — hech narsa qilmang. Agar yo'q bo'lsa — eski kompyuterdan ko'chiring.

---

## 6-qadam: Ishga tushirish

### Variant A — 2 ta CMD oynasi ochib (ishlab chiqish rejimi)

**1-oyna — Backend:**
```cmd
cd C:\...\NEWROCARDIOMED\web\backend
venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**2-oyna — Frontend:**
```cmd
cd C:\...\NEWROCARDIOMED\web\frontend
npm run dev
```

Brauzerda oching: **http://localhost:5173**

---

### Variant B — Avtomatik ishga tushiruvchi `.bat` fayllar

**`start_backend.bat`** — `web\backend\` papkasida yarating:
```bat
@echo off
cd /d "%~dp0"
call venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
```

**`start_frontend.bat`** — `web\frontend\` papkasida yarating:
```bat
@echo off
cd /d "%~dp0"
npm run dev
pause
```

Ikkalasini **ikki marta bosib** ishga tushiring — brauzerda http://localhost:5173 ni oching.

---

## 7-qadam: Birinchi foydalanuvchi yaratish

Backend ishga tushgandan keyin:

1. http://localhost:8000/docs sahifasini oching
2. `/api/users` → **POST** → **Try it out**
3. Quyidagini kiriting:
```json
{
  "first_name": "Admin",
  "last_name": "Admin",
  "patronymic_name": "",
  "gender": "male",
  "password": "sizning_parolingiz",
  "phone": "+998901234567",
  "role": "admin"
}
```
4. **Execute** bosing

Shundan keyin http://localhost:5173 da bu telefon va parol bilan kiring.

---

## Xatolar va yechimlari

| Xato | Yechim |
|------|--------|
| `asyncpg.InvalidPasswordError` | `.env` dagi `DB_PASSWORD` ni tekshiring |
| `asyncpg.InvalidCatalogNameError` | PostgreSQL da `Nevrocardiomed` bazasi yaratilganini tekshiring |
| `ModuleNotFoundError` | `venv\Scripts\activate` qilib, `pip install -r requirements.txt` qaytadan |
| `npm run dev` ishlamaydi | `npm install` qaytadan ishlating |
| Port 8000 band | Boshqa dastur ishlatayapti — CMD da `netstat -ano | findstr :8000` |
| DOCX yuklanmaydi | `NEWROCARDIOMED\protocoles\` papkasidagi fayl nomlari to'g'riligini tekshiring |
| CORS xatosi | Backend `http://localhost:5173` dan so'rov qabul qiladi — boshqa portda ishga tushirmang |

---

## Texnik ma'lumotlar

| Komponent | Texnologiya | Port |
|-----------|-------------|------|
| Backend API | FastAPI + uvicorn | 8000 |
| Frontend | React 19 + Vite | 5173 |
| Ma'lumotlar bazasi | PostgreSQL 16 | 5432 |
| Auth | JWT (8 soat) | — |
| Word fayl | python-docx | — |
| Frontend → Backend | Vite proxy `/api` → `localhost:8000` | — |
