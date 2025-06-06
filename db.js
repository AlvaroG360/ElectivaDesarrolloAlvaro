const sql = require('mssql');

// Configuración de la conexión
const config = {
    user: 'DesarrolloWeb', // usuario de SQL Server
    password: 'DesarrolloWeb123', // contraseña
    server: 'localhost', // Cambiar si el servidor no está en localhost
    database: 'DesarrolloWeb', // nombre de tu base de datos
    options: {
        encrypt: true, 
        trustServerCertificate: true // Requerido para conexiones locales
    }
};

// Crear una conexión
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Conexión a SQL Server establecida');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a SQL Server:', err);
        throw err;
    });

module.exports = {
    sql,
    poolPromise
};