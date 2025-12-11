// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const database = require('../database');
const { authenticateToken, generateToken } = require('../middleware/auth');

// ============================================
// POST /api/auth/register - Registro de cliente
// ============================================

router.post('/register', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono').optional().trim(),
    body('direccion').optional().trim()
], async (req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, password, telefono, direccion } = req.body;

        // Verificar si el email ya existe
        const existingUser = database.userQueries.findByEmail.get(email);
        if (existingUser) {
            return res.status(400).json({
                error: 'Email ya registrado',
                message: 'Este email ya está en uso'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const result = database.userQueries.create.run(
            nombre,
            email,
            hashedPassword,
            telefono || null,
            direccion || null,
            'cliente'
        );

        console.log(`✅ Nuevo cliente registrado: ${email}`);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({
            error: 'Error al registrar usuario',
            message: error.message
        });
    }
});

// ============================================
// POST /api/auth/login - Login (admin y clientes)
// ============================================

router.post('/login', [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
], async (req, res) => {
    try {
        // Validar errores
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const user = database.userQueries.findByEmail.get(email);
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                message: 'Email o contraseña incorrectos'
            });
        }

        // Generar token
        const token = generateToken(user);

        console.log(`✅ Login exitoso: ${email} (${user.rol})`);

        // Enviar respuesta (sin incluir password)
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            error: 'Error al iniciar sesión',
            message: error.message
        });
    }
});

// ============================================
// GET /api/auth/me - Obtener usuario actual
// ============================================

router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = database.userQueries.findById.get(req.user.id);

        if (!user) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        // Enviar respuesta sin password
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);

    } catch (error) {
        console.error('❌ Error al obtener usuario:', error);
        res.status(500).json({
            error: 'Error al obtener datos del usuario',
            message: error.message
        });
    }
});

// ============================================
// PUT /api/auth/change-password - Cambiar contraseña
// ============================================

router.put('/change-password', [
    authenticateToken,
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const user = database.userQueries.findById.get(req.user.id);

        // Verificar contraseña actual
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Contraseña incorrecta',
                message: 'La contraseña actual no es correcta'
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar contraseña
        database.userQueries.updatePassword.run(hashedPassword, req.user.id);

        console.log(`✅ Contraseña cambiada para usuario: ${user.email}`);

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('❌ Error al cambiar contraseña:', error);
        res.status(500).json({
            error: 'Error al cambiar contraseña',
            message: error.message
        });
    }
});

// ============================================
// POST /api/auth/logout - Logout
// ============================================

router.post('/logout', authenticateToken, (req, res) => {
    // En JWT, el logout se maneja en el cliente eliminando el token
    // Aquí solo confirmamos la acción
    console.log(`✅ Logout: ${req.user.email}`);
    res.json({ message: 'Logout exitoso' });
});

module.exports = router;
