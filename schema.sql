-- =====================================================
-- Schema: Clínica Médica — PostgreSQL
-- =====================================================

CREATE TABLE IF NOT EXISTS especialidades (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo      BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctores (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    especialidad_id INTEGER REFERENCES especialidades(id),
    telefono        VARCHAR(20),
    email           VARCHAR(150) UNIQUE,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pacientes (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE,
    telefono        VARCHAR(20),
    email           VARCHAR(150),
    direccion       TEXT,
    activo          BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
    id          SERIAL PRIMARY KEY,
    paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
    doctor_id   INTEGER NOT NULL REFERENCES doctores(id),
    fecha       DATE    NOT NULL,
    hora        TIME    NOT NULL,
    motivo      TEXT,
    estado      VARCHAR(20) DEFAULT 'pendiente'
                CHECK (estado IN ('pendiente','confirmada','cancelada','completada')),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Datos de ejemplo ──────────────────────────────────────────────
INSERT INTO especialidades (nombre, descripcion) VALUES
    ('Medicina General', 'Atención primaria y preventiva'),
    ('Pediatría',        'Salud infantil y adolescente'),
    ('Cardiología',      'Enfermedades del corazón'),
    ('Dermatología',     'Enfermedades de la piel')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO doctores (nombre, apellido, especialidad_id, telefono, email) VALUES
    ('Carlos',  'García',   1, '961-111-2222', 'carlos.garcia@clinica.com'),
    ('María',   'López',    2, '961-333-4444', 'maria.lopez@clinica.com'),
    ('Roberto', 'Martínez', 3, '961-555-6666', 'roberto.martinez@clinica.com')
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (nombre, apellido, fecha_nacimiento, telefono, email) VALUES
    ('Ana',    'Hernández', '1990-05-15', '961-100-0001', 'ana.h@mail.com'),
    ('Pedro',  'Ruiz',      '1985-08-22', '961-100-0002', 'pedro.r@mail.com'),
    ('Lucía',  'Díaz',      '2000-01-10', '961-100-0003', 'lucia.d@mail.com')
ON CONFLICT DO NOTHING;

-- ── Tabla de usuarios para autenticación ──────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(80)  NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,   -- bcrypt hash
    nombre      VARCHAR(100),
    rol         VARCHAR(20)  DEFAULT 'admin'
                CHECK (rol IN ('admin', 'recepcion')),
    activo      BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT NOW()
);

-- Usuario por defecto: admin / admin123  (cambiar en producción)
INSERT INTO usuarios (username, password, nombre, rol) VALUES
    ('admin', '$2b$12$KIXzaM3aP5sV2Rc1G6LVGe7tFJt/5QQgEflJ5QLXnEJkQOL6xD6bW', 'Administrador', 'admin')
ON CONFLICT (username) DO NOTHING;
