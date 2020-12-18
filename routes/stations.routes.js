const { Router } = require('express');
const pool = require('../db/db');
const router = Router();

router.get('/stations', async (_, res) => {
    try {
        const allStations = await pool.query(`
            SELECT station_id,s.name,lines.name as line 
            FROM stations as s
            INNER JOIN lines ON s.line = lines.line_id;
        `);
        return res.status(200).json({ stations: allStations.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.post('/stations', async (req, res) => {
        try {
            const { name, line } = req.body;
            await pool.query('INSERT INTO stations (name, line) VALUES ($1, $2)', [name, line]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(201).json({ message: 'New station added' })
    })

router.put('/stations/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name, line } = req.body;
            await pool.query('UPDATE stations SET (name, line) = ($1, $2) WHERE station_id = $3', [name, line, id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Station updated' })
    })

router.delete('/stations/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM stations WHERE station_id = $1', [id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Station was deleted' })
    })

module.exports = router;