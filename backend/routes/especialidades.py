"""
routes/especialidades.py — CRUD de especialidades.
"""
from flask import Blueprint, request, jsonify
from db import query, execute_returning, execute

bp = Blueprint('especialidades', __name__, url_prefix='/api/especialidades')


@bp.route('', methods=['GET'])
def listar():
    rows = query("SELECT * FROM especialidades WHERE activo = TRUE ORDER BY nombre")
    return jsonify(rows)


@bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    row = query("SELECT * FROM especialidades WHERE id = %s", (id,), one=True)
    if not row:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify(row)


@bp.route('', methods=['POST'])
def crear():
    data = request.get_json()
    row = execute_returning(
        "INSERT INTO especialidades (nombre, descripcion) VALUES (%s, %s) RETURNING *",
        (data['nombre'], data.get('descripcion', ''))
    )
    return jsonify(row), 201


@bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    execute(
        "UPDATE especialidades SET nombre=%s, descripcion=%s WHERE id=%s",
        (data['nombre'], data.get('descripcion', ''), id)
    )
    return jsonify({"msg": "Actualizada"})


@bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    execute("UPDATE especialidades SET activo = FALSE WHERE id = %s", (id,))
    return jsonify({"msg": "Eliminada"})
