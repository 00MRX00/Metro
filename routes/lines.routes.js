const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/lines', async (_, res) => {
    try {
        const allLines = await pool.query('SELECT * FROM lines');
        return res.status(200).json({ lines: allLines.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/lines',
    [
        check('name', 'Incorrect name. It\'s a required field').exists(),
        check('color', 'Incorrect color. It\'s a required field').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Incorrect data',
                    errors: errors.array()
                });
            }

            const { name, color } = req.body;
            const newLine = await pool.query('INSERT INTO lines (name, color) VALUES ($1, $2) RETURNING *', [name, color]);
            return res.status(201).json({ message: 'New line added', newLine: newLine.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/lines/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const lines = await pool.query('SELECT * FROM lines WHERE line_id = $1', [id]);
            if (lines.rows.length) {
                return res.status(200).json({ lines: lines.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no lines with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/lines/:id',
    [
        check('name', 'Incorrect name. It\'s a required field').exists(),
        check('color', 'Incorrect color. It\'s a required field').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Incorrect data',
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { name, color } = req.body;
            const oldLine = await pool.query('SELECT * FROM lines WHERE name = $1', [name]);
            if (oldLine.rows.length) {
                return res.status(400).json({ message: 'Line with the same name already exists' })
            }

            const line = await pool.query('UPDATE lines SET (name, color) = ($1, $2) WHERE line_id = $3 RETURNING *', [name, color, id]);

            if (line.rows.length) {
                return res.status(200).json({ message: 'Line updated', line: line.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no line with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/lines/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const line = await pool.query('DELETE FROM lines WHERE line_id = $1', [id]);
            if (line.rowCount) {
                return res.status(200).json({ message: 'Line was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no line with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;