import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "Nevrocardiomed")
    DB_USER: str = os.getenv("DB_USER", "turnerko")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "2002")

    JWT_SECRET: str = os.getenv("JWT_SECRET", "nevrocardiomed_secret_key")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))

    AUTH_PEPPER: str = os.getenv("AUTH_PEPPER", "")


settings = Settings()
