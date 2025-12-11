// ============================================
// RUTAS DE ADMINISTRADOR
// ============================================

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const database = require('../database');

// Aplicar middleware de autenticación y admin a todas las rutas
router.use(authenticateToken);
router.use(isAdmin);

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

// GET /api/admin/products - Listar todos los productos
router.get('/products', (req, res) => {
    try {
        const products = database.productQueries.getAll.all();
        res.json(products);
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET /api/admin/products/:id - Obtener un producto
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

// POST /api/admin/products - Crear nuevo producto
router.post('/products', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
    body('categoria').notEmpty().withMessage('La categoría es requerida')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

        const result = database.productQueries.create.run(
            nombre,
            descripcion || '',
            precio,
            stock,
            categoria,
            imagen || null
        );

        console.log(`✅ Producto creado: ${nombre} (ID: ${result.lastInsertRowid})`);

        res.status(201).json({
            message: 'Producto creado exitosamente',
            productId: result.lastInsertRowid
        });

    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT /api/admin/products/:id - Actualizar producto
router.put('/products/:id', [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
    body('categoria').notEmpty().withMessage('La categoría es requerida')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, descripcion, precio, stock, categoria, imagen } = req.body;

        database.productQueries.update.run(
            nombre,
            descripcion || '',
            precio,
            stock,
            categoria,
            imagen || null,
            req.params.id
        );

        console.log(`✅ Producto actualizado: ${nombre} (ID: ${req.params.id})`);

        res.json({ message: 'Producto actualizado exitosamente' });

    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE /api/admin/products/:id - Eliminar producto
router.delete('/products/:id', (req, res) => {
    try {
        database.productQueries.delete.run(req.params.id);
        console.log(`✅ Producto eliminado (ID: ${req.params.id})`);
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// ============================================
// GESTIÓN DE PEDIDOS
// ============================================

// GET /api/admin/orders - Ver todos los pedidos
router.get('/orders', (req, res) => {
    try {
        const orders = database.orderQueries.getAll.all();

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

// GET /api/admin/orders/:id - Ver detalle de un pedido
router.get('/orders/:id', (req, res) => {
    try {
        const order = database.orderQueries.getById.get(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const items = database.orderItemQueries.getByOrderId.all(order.id);
        res.json({ ...order, items });
    } catch (error) {
        console.error('❌ Error al obtener pedido:', error);
        res.status(500).json({ error: 'Error al obtener pedido' });
    }
});

// PUT /api/admin/orders/:id/status - Cambiar estado de pedido
router.put('/orders/:id/status', [
    body('estado').isIn(['pendiente', 'despachado', 'entregado', 'cancelado']).withMessage('Estado inválido')
], (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { estado } = req.body;
        database.orderQueries.updateStatus.run(estado, req.params.id);

        console.log(`✅ Estado de pedido actualizado: ${req.params.id} → ${estado}`);

        res.json({ message: 'Estado actualizado exitosamente' });
    } catch (error) {
        console.error('❌ Error al actualizar estado:', error);
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
});

// ============================================
// GESTIÓN DE CLIENTES
// ============================================

// GET /api/admin/customers - Ver lista de clientes
router.get('/customers', (req, res) => {
    try {
        const customers = database.userQueries.getAll.all('cliente');
        res.json(customers);
    } catch (error) {
        console.error('❌ Error al obtener clientes:', error);
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
});

// ============================================
// GESTIÓN DE MENSAJES DE CONTACTO
// ============================================

// GET /api/admin/contacts - Ver mensajes de contacto
router.get('/contacts', (req, res) => {
    try {
        const messages = database.contactQueries.getAll.all();
        res.json(messages);
    } catch (error) {
        console.error('❌ Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

// PUT /api/admin/contacts/:id/read - Marcar mensaje como leído
router.put('/contacts/:id/read', (req, res) => {
    try {
        database.contactQueries.markAsRead.run(req.params.id);
        res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
        console.error('❌ Error al marcar mensaje:', error);
        res.status(500).json({ error: 'Error al marcar mensaje' });
    }
});

// ============================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================

// GET /api/admin/stats - Obtener estadísticas generales
router.get('/stats', (req, res) => {
    try {
        const stats = {
            totalProducts: database.db.prepare('SELECT COUNT(*) as count FROM products').get().count,
            totalOrders: database.db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
            pendingOrders: database.db.prepare('SELECT COUNT(*) as count FROM orders WHERE estado = ?').get('pendiente').count,
            totalCustomers: database.db.prepare('SELECT COUNT(*) as count FROM users WHERE rol = ?').get('cliente').count,
            unreadMessages: database.db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE leido = 0').get().count,
            totalRevenue: database.db.prepare('SELECT SUM(total) as total FROM orders WHERE estado != ?').get('cancelado').total || 0
        };

        res.json(stats);
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

module.exports = router;
