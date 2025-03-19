const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Pedido = sequelize.define("Pedido", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    direccion: { type: DataTypes.STRING, allowNull: false },
    metodo_pago: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    telefono: { type: DataTypes.STRING, allowNull: false },
    productos: { type: DataTypes.TEXT, allowNull: false } // JSON con los productos comprados
},
{
    tableName: "pedidos",
    timestamps: false
}
);

module.exports = Pedido;
