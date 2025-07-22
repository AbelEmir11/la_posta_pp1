const { Sequelize } = require("sequelize");
require("dotenv").config(); // Cargar variables de entorno

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql", // ⚠️ Agregar esto es clave para evitar el error
  dialectOptions: {
    connectTimeout: 60000, // Aumenta el tiempo de espera en milisegundos
  },
  logging: console.log, // Mostrar logs de Sequelize en la consola
});

// Probar conexión
async function testDBConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos establecida correctamente.");
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:", error);
  }
}

testDBConnection();

module.exports = sequelize;

