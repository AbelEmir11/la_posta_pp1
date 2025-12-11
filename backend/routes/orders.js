// ============================================
// RUTAS DE PEDIDOS (CLIENTES)
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const database = require('../database');

// ============================================
// POST /api/orders - Crear nuevo pedido
// ============================================

router.post('/', [
    authenticateToken,
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
    body('nombre_cliente').notEmpty().withMessage('El nombre es requerido'),
    body('email_cliente').isEmail().withMessage('Email inválido'),
    body('telefono_cliente').notEmpty().withMessage('El teléfono es requerido'),
    body('direccion_cliente').notEmpty().withMessage('La dirección es requerida')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { items, nombre_cliente, email_cliente, telefono_cliente, direccion_cliente, mercadopago_id, mercadopago_status, comprobante, comprobante_nombre } = req.body;
        const user = req.user;

        // Calcular total
        let total = 0;
        for (const item of items) {
            total += item.precio * item.cantidad;
        }

        // Crear pedido en una transacción
        const createOrder = database.db.transaction(() => {
            // Insertar pedido
            const orderResult = database.orderQueries.create.run(
                user.id,
                total,
                'pendiente',
                nombre_cliente,
                email_cliente,
                telefono_cliente,
                direccion_cliente,
                mercadopago_id || null,
                mercadopago_status || 'pending',
                comprobante || null,
                comprobante_nombre || null
            );

            const orderId = orderResult.lastInsertRowid;

            // Insertar items del pedido y actualizar stock
            for (const item of items) {
                // Insertar item
                database.orderItemQueries.create.run(
                    orderId,
                    item.product_id,
                    item.nombre_producto,
                    item.precio,
                    item.cantidad,
                    item.precio * item.cantidad
                );

                // Actualizar stock del producto
                database.productQueries.updateStock.run(item.cantidad, item.product_id);
            }

            return orderId;
        });

        const orderId = createOrder();

        console.log(`✅ Pedido creado: #${orderId} - Cliente: ${email_cliente} - Total: $${total}`);

        res.status(201).json({
            message: 'Pedido creado exitosamente',
            orderId: orderId
        });

    } catch (error) {
        console.error('❌ Error al crear pedido:', error);
        res.status(500).json({
            error: 'Error al crear pedido',
            message: error.message
        });
    }
});

// ============================================
// GET /api/orders/my-orders - Ver pedidos del cliente actual
// ============================================

router.get('/my-orders', authenticateToken, (req, res) => {
    try {
        const orders = database.orderQueries.getByUserId.all(req.user.id);

        // Obtener items de cada pedido
        const ordersWithItems = orders.map(order => {
            const items = database.orderItemQueries.getByOrderId.all(order.id);
            return { ...order, items };
        });

        res.json(ordersWithItems);
    } catch (error) {
        console.error('❌ Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
});

// ============================================
// GET /api/orders/:id - Ver detalle de un pedido específico
// ============================================

router.get('/:id', authenticateToken, (req, res) => {
    try {
        const order = database.orderQueries.getById.get(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Verificar que el pedido pertenece al usuario (o es admin)
        if (order.user_id !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'No tienes permiso para ver este pedido' });
        }

        const items = database.orderItemQueries.getByOrderId.all(order.id);
        res.json({ ...order, items });
    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
});

module.exports = router;


