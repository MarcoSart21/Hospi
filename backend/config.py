"""
config.py — Configuración centralizada.
"""
import os, secrets

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Config:
    SECRET_KEY   = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    DEBUG        = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


_configs = {
    'development': DevelopmentConfig,
    'production':  ProductionConfig,
}


def get_config():
    env = os.environ.get('FLASK_ENV', 'development')
    return _configs.get(env, DevelopmentConfig)
