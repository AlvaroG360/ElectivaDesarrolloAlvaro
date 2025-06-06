const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('./db'); // Asegúrate de que db.js esté configurado correctamente

// Ruta para obtener todos los eventos
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Eventos'); // Reemplaza "Eventos" con el nombre de tu tabla
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener eventos:', err);
        res.status(500).send('Error al obtener eventos');
    }
});

// Ruta para obtener un evento específico por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Eventos WHERE id = @id'); // Reemplaza "Eventos" con el nombre de tu tabla

        if (result.recordset.length === 0) {
            return res.status(404).send('Evento no encontrado');
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error al obtener el evento:', err);
        res.status(500).send('Error al obtener el evento');
    }
});

module.exports = router;