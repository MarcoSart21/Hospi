"""
db.py — Pool de conexiones PostgreSQL.
"""
import os
import psycopg2
import psycopg2.extras


def get_connection():
    return psycopg2.connect(
        os.getenv("DATABASE_URL"),
        cursor_factory=psycopg2.extras.RealDictCursor,
    )


def query(sql, params=(), one=False):
    """Ejecuta SELECT y retorna lista de dicts (o uno solo si one=True)."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        return rows[0] if one and rows else rows if not one else None
    finally:
        conn.close()


def execute(sql, params=()):
    """Ejecuta INSERT/UPDATE/DELETE y retorna filas afectadas."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
            return cur.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def execute_returning(sql, params=()):
    """Ejecuta INSERT … RETURNING y retorna la fila insertada."""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            conn.commit()
            return row
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
