"""
routes/citas.py — CRUD de citas médicas.
"""
from flask import Blueprint, request, jsonify
from db import query, execute_returning, execute

bp = Blueprint('citas', __name__, url_prefix='/api/citas')


@bp.route('', methods=['GET'])
def listar():
    rows = query("""
        SELECT c.*,
               p.nombre || ' ' || p.apellido AS paciente,
               d.nombre || ' ' || d.apellido AS doctor
        FROM citas c
        JOIN pacientes p ON p.id = c.paciente_id
        JOIN doctores  d ON d.id = c.doctor_id
        ORDER BY c.fecha DESC, c.hora DESC
    """)
    return jsonify(rows)


@bp.route('/<int:id>', methods=['GET'])
def obtener(id):
    row = query("""
        SELECT c.*,
               p.nombre || ' ' || p.apellido AS paciente,
               d.nombre || ' ' || d.apellido AS doctor
        FROM citas c
        JOIN pacientes p ON p.id = c.paciente_id
        JOIN doctores  d ON d.id = c.doctor_id
        WHERE c.id = %s
    """, (id,), one=True)
    if not row:
        return jsonify({"error": "No encontrada"}), 404
    return jsonify(row)


@bp.route('', methods=['POST'])
def crear():
    data = request.get_json()
    row = execute_returning(
        """INSERT INTO citas (paciente_id, doctor_id, fecha, hora, motivo, estado)
           VALUES (%s, %s, %s, %s, %s, %s) RETURNING *""",
        (data['paciente_id'], data['doctor_id'], data['fecha'],
         data['hora'], data.get('motivo', ''), data.get('estado', 'pendiente'))
    )
    return jsonify(row), 201


@bp.route('/<int:id>', methods=['PUT'])
def actualizar(id):
    data = request.get_json()
    execute(
        """UPDATE citas
           SET paciente_id=%s, doctor_id=%s, fecha=%s, hora=%s,
               motivo=%s, estado=%s
           WHERE id=%s""",
        (data['paciente_id'], data['doctor_id'], data['fecha'],
         data['hora'], data.get('motivo', ''), data.get('estado', 'pendiente'), id)
    )
    return jsonify({"msg": "Actualizada"})


@bp.route('/<int:id>', methods=['DELETE'])
def eliminar(id):
    execute("DELETE FROM citas WHERE id = %s", (id,))
    return jsonify({"msg": "Eliminada"})


@bp.route('/stats', methods=['GET'])
def estadisticas():
    """Estadísticas para el dashboard."""
    from db import get_connection
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS total FROM pacientes WHERE activo = TRUE")
            pacientes = cur.fetchone()['total']

            cur.execute("SELECT COUNT(*) AS total FROM doctores WHERE activo = TRUE")
            doctores = cur.fetchone()['total']

            cur.execute("SELECT COUNT(*) AS total FROM citas WHERE estado = 'pendiente'")
            pendientes = cur.fetchone()['total']

            cur.execute("SELECT COUNT(*) AS total FROM citas WHERE fecha = CURRENT_DATE")
            hoy = cur.fetchone()['total']

        return jsonify({
            "pacientes": pacientes,
            "doctores": doctores,
            "citas_pendientes": pendientes,
            "citas_hoy": hoy
        })
    finally:
        conn.close()
