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

module.exports = router;