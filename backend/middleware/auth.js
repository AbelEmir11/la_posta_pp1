// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================

const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción debe estar en .env)
const JWT_SECRET = process.env.JWT_SECRET || 'la_posta_campesina_secret_key_2025';

// ============================================
// Middleware: Verificar Token JWT
// ============================================

function authenticateToken(req, res, next) {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({
            error: 'Acceso denegado',
            message: 'No se proporcionó un token de autenticación'
        });
    }

    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                error: 'Token inválido',
                message: 'El token proporcionado no es válido o ha expirado'
            });
        }

        // Agregar información del usuario al request
        req.user = user;
        next();
    });
}

// ============================================
// Middleware: Verificar rol de Administrador
// ============================================

function isAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'No autenticado',
            message: 'Debes iniciar sesión primero'
        });
    }

    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'No tienes permisos de administrador'
        });
    }

    next();
}

// ============================================
// Middleware: Verificar rol de Cliente
// ============================================

function isClient(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'No autenticado',
            message: 'Debes iniciar sesión primero'
        });
    }

    if (req.user.rol !== 'cliente' && req.user.rol !== 'admin') {
        return res.status(403).json({
            error: 'Acceso denegado',
            message: 'No tienes permisos de cliente'
        });
    }

    next();
}

// ============================================
// Función: Generar Token JWT
// ============================================

function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol
    };

    // Token válido por 7 días
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// ============================================
// Exportar
// ============================================

module.exports = {
    authenticateToken,
    isAdmin,
    isClient,
    generateToken,
    JWT_SECRET
};
