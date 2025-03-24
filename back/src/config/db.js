const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'la_posta', // Nombre de la base de datos
    process.env.DB_USER || 'root',     // Usuario de la base de datos
    process.env.DB_PASSWORD || 'admin',// Contraseña de la base de datos
    {
        host: process.env.DB_HOST || 'localhost', // Dirección del host
        dialect: 'mysql',  // Usamos MySQL
        logging: false, // Para mostrar las consultas SQL que se realizan
    }
);

// Testeamos la conexión con la base de datos
sequelize.authenticate()
    .then(() => {
        console.log('Conexión exitosa a la base de datos');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos:', error);
    });

module.exports = sequelize;  // Exportamos la instancia de Sequelize
