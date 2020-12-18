const { Router } = require('express');
const pool = require('../db/db');
const router = Router();

router.get('/lines', async (_, res) => {
        try {
            const allLines = await pool.query('SELECT * FROM lines');
            return res.status(200).json({ lines: allLines.rows })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    })

router.post('/lines', async (req, res) => {
        try {
            const { name, color } = req.body;
            await pool.query('INSERT INTO lines (name, color) VALUES ($1, $2)', [name, color]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(201).json({ message: 'New line added' })
    })

router.put('/lines/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { name,color } = req.body;
            await pool.query('UPDATE lines SET name = $1,color = $2 WHERE line_id = $3', [name,color,id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Line updated' })
    })

router.delete('/lines/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM lines WHERE line_id = $1', [id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Line was deleted' })
    })

module.exports = router;