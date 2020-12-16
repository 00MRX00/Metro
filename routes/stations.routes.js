const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/stations', async (_, res) => {
    try {
        const allStations = await pool.query('SELECT * FROM stations');
        return res.status(200).json({ stations: allStations.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/stations',
    [
        check('name', 'Incorrect name. Station with the same already exists.')
            .exists()
            .withMessage('Incorrect name. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE name = $1', [value]);
                if (st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('line', 'Incorrect line. Line with such id doesn\'t exists.')
            .exists()
            .withMessage('Incorrect line. It\'s a required field.')
            .bail()
            .custom(async value => {
                const ln = await pool.query('SELECT * FROM lines WHERE line_id = $1', [value]);
                if (!ln.rowCount) {
                    return Promise.reject();
                }
            })
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

            const { name, line } = req.body;
            const newStation = await pool.query('INSERT INTO stations (name, line) VALUES ($1, $2) RETURNING *', [name, line]);
            return res.status(201).json({ message: 'New station added', newStation: newStation.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/stations/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const stations = await pool.query('SELECT * FROM stations WHERE station_id = $1', [id]);
            if (stations.rowCount) {
                return res.status(200).json({ stations: stations.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no stations with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/stations/:id',
    [
        check('name', 'Incorrect name. Station with the same already exists.')
            .exists()
            .withMessage('Incorrect name. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE name = $1', [value]);
                if (st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('line', 'Incorrect line. Line with such id doesn\'t exists.')
            .exists()
            .withMessage('Incorrect line. It\'s a required field.')
            .bail()
            .custom(async value => {
                const ln = await pool.query('SELECT * FROM lines WHERE line_id = $1', [value]);
                if (!ln.rowCount) {
                    return Promise.reject();
                }
            })
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
            const { name, line } = req.body;

            const station = await pool.query('UPDATE stations SET (name, line) = ($1, $2) WHERE station_id = $3 RETURNING *', [name, line, id]);

            if (station.rowCount) {
                return res.status(200).json({ message: 'Station updated', station: station.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no station with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/stations/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const station = await pool.query('DELETE FROM stations WHERE station_id = $1', [id]);
            if (station.rowCount) {
                return res.status(200).json({ message: 'Station was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no station with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;