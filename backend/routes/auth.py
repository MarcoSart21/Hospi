"""
routes/auth.py — Endpoints de autenticación con JWT.
"""
import os
import datetime
import jwt
import bcrypt
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from db import get_connection

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _secret():
    return current_app.config.get('SECRET_KEY', 'dev-secret')


def token_required(f):
    """Decorador que protege rutas verificando el JWT en el header Authorization."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Token requerido'}), 401
        token = auth_header.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, _secret(), algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated


@bp.route('/login', methods=['POST'])
def login():
    """Recibe {username, password} y devuelve un JWT si las credenciales son válidas."""
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not username or not password:
        return jsonify({'error': 'Usuario y contraseña requeridos'}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, password, nombre, rol FROM usuarios WHERE username = %s AND activo = TRUE",
        (username,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    # Verificar contraseña con bcrypt
    if not bcrypt.checkpw(password.encode(), row['password'].encode()):
        return jsonify({'error': 'Credenciales incorrectas'}), 401

    # Generar token JWT válido por 8 horas
    exp = datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    payload = {
        'sub':      row['id'],
        'username': row['username'],
        'nombre':   row['nombre'],
        'rol':      row['rol'],
        'exp':      exp,
    }
    token = jwt.encode(payload, _secret(), algorithm='HS256')

    return jsonify({
        'token': token,
        'user': {
            'id':       row['id'],
            'username': row['username'],
            'nombre':   row['nombre'],
            'rol':      row['rol'],
        }
    })


@bp.route('/me', methods=['GET'])
@token_required
def me():
    """Devuelve la info del usuario autenticado."""
    return jsonify({'user': request.current_user})


@bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """El logout se maneja en el cliente eliminando el token."""
    return jsonify({'message': 'Sesión cerrada'})
