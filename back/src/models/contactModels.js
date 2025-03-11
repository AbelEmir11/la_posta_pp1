const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Contacto = sequelize.define("contacto", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, {
    tableName: "contacto",
    timestamps: false
});

module.exports = Contacto;
