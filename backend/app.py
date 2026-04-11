"""
app.py — API REST con Flask.
Punto de entrada del backend.
"""
try:
    from dotenv import load_dotenv
    load_dotenv(override=False)
except ImportError:
    pass

import datetime, decimal
from flask import Flask, jsonify
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
from config import get_config


class CustomJSON(DefaultJSONProvider):
    """Serializa date, time, datetime y Decimal de PostgreSQL."""
    def default(self, o):
        if isinstance(o, (datetime.date, datetime.datetime)):
            return o.isoformat()
        if isinstance(o, datetime.time):
            return o.strftime('%H:%M')
        if isinstance(o, datetime.timedelta):
            total = int(o.total_seconds())
            h, m = divmod(total // 60, 60)
            return f"{h:02d}:{m:02d}"
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super().default(o)


# ── Importar blueprints ────────────────────────────────────────────
from routes.auth           import bp as auth_bp
from routes.especialidades import bp as especialidades_bp
from routes.doctores       import bp as doctores_bp
from routes.pacientes      import bp as pacientes_bp
from routes.citas          import bp as citas_bp

cfg = get_config()

app = Flask(__name__)
app.json_provider_class = CustomJSON
app.json = CustomJSON(app)
app.config.from_object(cfg)

# ── CORS: permitir peticiones desde el frontend (otra EC2) ─────────
# CORS(app, origins=[cfg.FRONTEND_URL], supports_credentials=True)
CORS(app)


# ── Registrar blueprints ───────────────────────────────────────────
app.register_blueprint(auth_bp)
app.register_blueprint(especialidades_bp)
app.register_blueprint(doctores_bp)
app.register_blueprint(pacientes_bp)
app.register_blueprint(citas_bp)


# ── Health check ───────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "clinica-api"})


# ── Manejo de errores ──────────────────────────────────────────────
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Recurso no encontrado"}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Error interno del servidor"}), 500


if __name__ == '__main__':
    app.run(debug=False, port=5000, host='0.0.0.0')