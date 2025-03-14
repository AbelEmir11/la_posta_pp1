const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Asegúrate de que esta ruta sea correcta

const Product = sequelize.define('Product', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING
    },
    categoria_1: {
        type: DataTypes.STRING,
        field: 'categoria_1'
    }
}, {
    tableName: 'productos', // Nombre de la tabla en la base de datos
    timestamps: false // Si no usas los campos createdAt y updatedAt
});

module.exports = Product;
