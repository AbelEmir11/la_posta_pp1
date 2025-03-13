const Product = require('../models/productModels');


// Insertar múltiples productos a la vez
exports.bulkInsertProducts = async (req, res) => {
  try {
    console.log("Body recibido:", req.body); 
    const productos = req.body; // Array de productos [{nombre, descripcion, precio, etc.}]
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ mensaje: "El array de productos está vacío o es inválido" });
    }

    const nuevosProductos = await Product.bulkCreate(productos);
    res.status(201).json({ mensaje: "Productos insertados correctamente", productos: nuevosProductos });
  } catch (error) {
    console.error("Error al insertar productos:", error);
    res.status(500).json({ error: "Error al insertar productos" });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener todos los productos

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar un producto
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        await product.update(req.body);
        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        await product.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};