// filepath: c:\Proyecto Desarrollo Web\server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { poolPromise, sql } = require('./db'); // Importar la conexión a la base de datos
const eventosRoutes = require('./evento');
const app = express();
const port = 3000;

// Middleware para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para el archivo index.html
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para el archivo register.html
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// Ruta para el archivo login.html
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Ruta para el archivo perfil.html
app.get('/perfil.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'perfil.html'));
});

// Ruta para manejar el registro
/*app.post('/register', async (req, res) => {
    try {
        const { nombre_completo, nombre_usuario, tipo_documento, numero_documento, correo, contrasena, telefono } = req.body;

        // Conexión a la base de datos
        const pool = await poolPromise;
        await pool.request()
            .input('nombre_completo', sql.NVarChar, nombre_completo)
            .input('nombre_usuario', sql.NVarChar, nombre_usuario)
            .input('tipo_documento', sql.NVarChar, tipo_documento)
            .input('numero_documento', sql.NVarChar, numero_documento)
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, contrasena)
            .input('telefono', sql.NVarChar, telefono)
            .query(`
                INSERT INTO users (fullName, username, documentType, documentNumber, email, password, phone)
                VALUES (@nombre_completo, @nombre_usuario, @tipo_documento, @numero_documento, @correo, @contrasena, @telefono)
            `);

        res.send('Registro exitoso');
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).send('Error al registrar usuario');
    }
});*/

app.post('/register', async (req, res) => {
    try {
        const { nombre_completo, nombre_usuario, tipo_documento, numero_documento, correo, contrasena, telefono } = req.body;

        // Validar correo electrónico
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            return res.status(400).send("Correo electrónico inválido.");
        }

        // Validar contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(contrasena)) {
            return res.status(400).send("Contraseña inválida.");
        }

        const pool = await poolPromise;

        // Verificar si el correo o nombre de usuario ya existe
        const checkUser = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .input('nombre_usuario', sql.NVarChar, nombre_usuario)
            .query(`
                SELECT * FROM users 
                WHERE email = @correo OR username = @nombre_usuario
            `);

        if (checkUser.recordset.length > 0) {
            return res.status(409).send("El correo o nombre de usuario ya están registrados.");
        }

        // Insertar nuevo usuario
        await pool.request()
            .input('nombre_completo', sql.NVarChar, nombre_completo)
            .input('nombre_usuario', sql.NVarChar, nombre_usuario)
            .input('tipo_documento', sql.NVarChar, tipo_documento)
            .input('numero_documento', sql.NVarChar, numero_documento)
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, contrasena)
            .input('telefono', sql.NVarChar, telefono)
            .query(`
                INSERT INTO users (fullName, username, documentType, documentNumber, email, password, phone)
                VALUES (@nombre_completo, @nombre_usuario, @tipo_documento, @numero_documento, @correo, @contrasena, @telefono)
            `);

        res.send("Registro exitoso");
    } catch (err) {
        console.error("Error al registrar usuario:", err);
        res.status(500).send("Error interno del servidor");
    }
});

app.post('/login', async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input('correo', sql.NVarChar, correo)
            .input('contrasena', sql.NVarChar, contrasena)
            .query(`
                SELECT * FROM users 
                WHERE email = @correo AND password = @contrasena
            `);

        if (result.recordset.length === 0) {
            return res.status(401).send("Correo o contraseña incorrectos.");
        }

        const usuario = result.recordset[0];

        // Enviar info del usuario como JSON
        res.json({
            id: usuario.id,
            nombre: usuario.fullName,
            correo: usuario.email,
            usuario: usuario.username,
            telefono: usuario.phone
        });
    } catch (err) {
        console.error("Error en login:", err);
        res.status(500).send("Error interno del servidor");
    }
});

// Ruta para obtener datos de la base de datos
app.use('/api/eventos', eventosRoutes);

// Ruta para obtener los detalles de un evento específico
app.get('/api/eventos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Eventos WHERE id = @id'); // Reemplaza con tu tabla y columnas

        if (result.recordset.length === 0) {
            return res.status(404).send('Evento no encontrado');
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error al obtener el evento:', err);
        res.status(500).send('Error al obtener el evento');
    }
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});