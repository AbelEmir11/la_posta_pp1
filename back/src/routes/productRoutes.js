// src/routes/productRoutes.js

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const {obtenerProductos, crearPedido } = require('../controllers/productController');

// Rutas para productos
router.get('/productos', ProductController.obtenerProductos );
router.post('/', ProductController.crearPedido );
router.get('/productos',ProductController.obtenerProductos);
router.post('/crear', ProductController.crearPedido);
router.post('/bulk-insert', ProductController.bulkInsertProducts);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.get('/test-db', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ message: 'Conexión a la base de datos exitosa 🚀' });
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar a la base de datos', details: error.message });
    }
});

module.exports = router;