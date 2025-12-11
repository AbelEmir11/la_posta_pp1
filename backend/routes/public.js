// ============================================
// RUTAS PÚBLICAS (PRODUCTOS Y CONTACTO)
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const database = require('../database');

// ============================================
// GET /api/products - Obtener todos los productos (público)
// ============================================

router.get('/products', (req, res) => {
    try {
        const { categoria } = req.query;

        let products;
        if (categoria) {
            products = database.productQueries.getByCategory.all(categoria);
        } else {
            products = database.productQueries.getAll.all();
        }

        res.json(products);
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// ============================================
// GET /api/products/:id - Obtener un producto (público)
// ============================================

router.get('/products/:id', (req, res) => {
    try {
        const product = database.productQueries.getById.get(req.params.id);

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
    } catch (error) {
        console.error('❌ Error al obtener producto:', error);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

// ============================================
// POST /api/contact - Enviar mensaje de contacto (público)
// ============================================

router.post('/contact', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('mensaje').trim().notEmpty().withMessage('El mensaje es requerido')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, email, mensaje } = req.body;

        const result = database.contactQueries.create.run(nombre, email, mensaje);

        console.log(`📧 Nuevo mensaje de contacto: ${nombre} (${email})`);

        res.status(201).json({
            message: 'Mensaje enviado exitosamente',
            messageId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('❌ Error al enviar mensaje:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

module.exports = router;


