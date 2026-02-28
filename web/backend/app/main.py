from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.database import get_pool, close_pool
from app.routers import auth, users, clients, protocols, templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()
    yield
    await close_pool()


app = FastAPI(
    title="NEVROCARDIOMED API",
    description="Tibbiy protokol boshqarish tizimi - REST API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(clients.router)
app.include_router(protocols.router)
app.include_router(templates.router)


@app.get("/")
async def root():
    return {"message": "NEVROCARDIOMED API ishlayapti", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
