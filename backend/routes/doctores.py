"""
routes/doctores.py — CRUD de doctores.
"""
from flask import Blueprint, request, jsonify
from db import query, execute_returning, execute

bp = Blueprint('doctores', __name__, url_prefix='/api/doctores')


@bp.route('', methods=['GET'])
def listar():
    rows = query("""
        SELECT d.*, e.nombre AS especialidad
        FROM doctores d
        LEFT JOIN especialidades e ON e.id = d.especialidad_id
        WHERE d.activo = TRUE
        ORDER BY d.apellido, d.nombre
    """)
    return jsonify(rows)


@bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    row = query("""
        SELECT d.*, e.nombre AS especialidad
        FROM doctores d
        LEFT JOIN especialidades e ON e.id = d.especialidad_id
        WHERE d.id = %s
    """, (id,), one=True)
    if not row:
        return jsonify({"error": "No encontrado"}), 404
    return jsonify(row)


@bp.route('', methods=['POST'])
def crear():
    data = request.get_json()
    row = execute_returning(
        """INSERT INTO doctores (nombre, apellido, especialidad_id, telefono, email)
           VALUES (%s, %s, %s, %s, %s) RETURNING *""",
        (data['nombre'], data['apellido'], data.get('especialidad_id'),
         data.get('telefono', ''), data.get('email', ''))
    )
    return jsonify(row), 201


@bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    execute(
        """UPDATE doctores
           SET nombre=%s, apellido=%s, especialidad_id=%s, telefono=%s, email=%s
           WHERE id=%s""",
        (data['nombre'], data['apellido'], data.get('especialidad_id'),
         data.get('telefono', ''), data.get('email', ''), id)
    )
    return jsonify({"msg": "Actualizado"})


@bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    execute("UPDATE doctores SET activo = FALSE WHERE id = %s", (id,))
    return jsonify({"msg": "Eliminado"})
