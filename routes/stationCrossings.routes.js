const { Router } = require('express');
const pool = require('../db/db');
const router = Router();

router.get('/stationcrossings', async (_, res) => {
    try {
        const allStationCrossings = await pool.query(`
            SELECT s.name as station1, ss.name as station2 FROM station_crossings as sc
            INNER JOIN stations as s ON sc.station1 = s.station_id
            INNER JOIN stations as ss ON sc.station2 = ss.station_id
        `);
        return res.status(200).json({ stationCrossings: allStationCrossings.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.post('/stationcrossings', async (req, res) => {
    try {
        const { station1, station2 } = req.body;
        await pool.query('SELECT checkstcross($1, $2);', [station1, station2]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(201).json({ message: 'New stationCrossing added' })
})

router.put('/stationcrossings', async (req, res) => {
    try {
        const { station1, station2, oldStation1, oldStation2 } = req.body;
        await pool.query(`
                UPDATE station_crossings 
                SET (station1, station2) = ($1, $2) 
                WHERE station1 = $3 AND station2 = $4 OR station1 = $4 AND station2 = $3`, [station1, station2, oldStation1, oldStation2]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(200).json({ message: 'StationCrossings updated' })
})

router.delete('/stationcrossings', async (req, res) => {
    try {
        const { station1, station2 } = req.body;
        await pool.query('DELETE FROM station_crossings WHERE station1 = $1 AND station2 = $2 OR station1 = $2 AND station2 = $1', [station1, station2]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(200).json({ message: 'StationCrossings was deleted' })
})

module.exports = router;