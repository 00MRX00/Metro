const { Router } = require('express');
const pool = require('../db/db');
const router = Router();

router.get('/lostthings', async (_, res) => {
    try {
        const lostThings = await pool.query(`
        SELECT thing_id,title,staff_found,s.name AS station_found 
        FROM lost_things AS lt
        INNER JOIN stations AS s ON lt.station_found = s.station_id;
        `);
        return res.status(200).json({ lostThings: lostThings.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.post('/lostthings', async (req, res) => {
    try {
        const { title, staff_found, station_found } = req.body;
        await pool.query('INSERT INTO lost_things (title, staff_found, station_found) VALUES ($1, $2, $3)', [title, staff_found, station_found]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(201).json({ message: 'New lost thing added' })
})

router.put('/lostthings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, staff_found, station_found } = req.body;
        await pool.query('UPDATE lost_things SET (title, staff_found, station_found) = ($1, $2, $3) WHERE thing_id = $4', [title, staff_found, station_found, id]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(200).json({ message: 'Lost thing updated' })
})

router.delete(
    '/lostthings/:id',
    async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM lost_things WHERE thing_id = $1', [id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Lost thing was deleted' })
    })

module.exports = router;