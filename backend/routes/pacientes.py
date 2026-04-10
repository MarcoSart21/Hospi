"""
routes/pacientes.py — CRUD de pacientes.
"""
from flask import Blueprint, request, jsonify
from db import query, execute_returning, execute

bp = Blueprint('pacientes', __name__, url_prefix='/api/pacientes')


@bp.route('', methods=['GET'])
def listar():
    rows = query("SELECT * FROM pacientes WHERE activo = TRUE ORDER BY apellido, nombre")
    return jsonify(rows)


@bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    row = query("SELECT * FROM pacientes WHERE id = %s", (id,), one=True)
    if not row:
        return jsonify({"error": "No encontrado"}), 404
    return jsonify(row)


@bp.route('', methods=['POST'])
def crear():
    data = request.get_json()
    row = execute_returning(
        """INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, telefono, email, direccion)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
        (data['nombre'], data['apellido'], data.get('fecha_nacimiento'),
         data.get('telefono', ''), data.get('email', ''), data.get('direccion', ''))
    )
    return jsonify(row), 201


@bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    execute(
        """UPDATE pacientes
           SET nombre=%s, apellido=%s, fecha_nacimiento=%s,
               telefono=%s, email=%s, direccion=%s
           WHERE id=%s""",
        (data['nombre'], data['apellido'], data.get('fecha_nacimiento'),
         data.get('telefono', ''), data.get('email', ''), data.get('direccion', ''), id)
    )
    return jsonify({"msg": "Actualizado"})


@bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    execute("UPDATE pacientes SET activo = FALSE WHERE id = %s", (id,))
    return jsonify({"msg": "Eliminado"})
