const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/stationcrossings', async (_, res) => {
    try {
        const allStationCrossings = await pool.query('SELECT * FROM station_crossings');
        return res.status(200).json({ stationCrossings: allStationCrossings.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/stationcrossings',
    [
        check('station1', 'Incorrect station1. station1 and station2 must be different.')
            .exists()
            .withMessage('Incorrect station1 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            })
            .withMessage('Incorrect station1. Station with such id doesn\'t exist..')
            .bail()
            .custom(async (value, { req }) => {
                if (value === req.body.station2) {
                    return Promise.reject();
                }
            }),
        check('station2', 'Incorrect station2 field. The same station crossing already exists.')
            .exists()
            .withMessage('Incorrect station2 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            })
            .withMessage('Incorrect station1 field. Station with such id doesn\'t exist.')
            .bail()
            .custom(async (value, { req }) => {
                const stCr = await pool.query('SELECT * FROM station_crossings WHERE station1 = $1 and station2 = $2 or station1 = $2 and station2 = $1', [req.body.station1, value]);
                if (stCr.rowCount) {
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

            const { station1, station2 } = req.body;
            const newStationCrossings = await pool.query('INSERT INTO station_crossings (station1, station2) VALUES ($1, $2) RETURNING *', [station1, station2]);
            return res.status(201).json({ message: 'New stationCrossing added', newStationCrossings: newStationCrossings.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/stationcrossings/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const stationCrossings = await pool.query('SELECT * FROM station_crossings WHERE station1 = $1 or station2 = $1', [id]);
            if (stationCrossings.rowCount) {
                return res.status(200).json({ stationCrossings: stationCrossings.rows })
            }
            return res.status(400).json({ message: 'There\'s no stationCrossings with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/stationcrossings',
    [
        check('oldStation1', 'Incorrect oldStation1. Station with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect oldStation1 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('oldStation2', 'Incorrect oldStation2 field. Station with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect oldStation2 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('station1', 'Incorrect station1 field. Station with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect station1 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('station2', 'Incorrect station2 field. The same station crossing already exists.')
            .exists()
            .withMessage('Incorrect station2 field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            })
            .withMessage('Incorrect station2 field. Station with such id doesn\'t exist.')
            .bail()
            .custom(async (value, { req }) => {
                const stCr = await pool.query('SELECT * FROM station_crossings WHERE station1 = $1 and station2 = $2 or station1 = $2 and station2 = $1', [req.body.station1, value]);
                if (stCr.rowCount) {
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

            const { station1, station2, oldStation1, oldStation2 } = req.body;

            const station = await pool.query('UPDATE station_crossings SET (station1, station2) = ($1, $2) WHERE station1 = $3 and station2 = $4 or station1 = $4 and station2 = $3 RETURNING *', [station1, station2, oldStation1, oldStation2]);

            if (station.rowCount) {
                return res.status(200).json({ message: 'StationCrossings updated', station: station.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no stationCrossing with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/stationcrossings/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const station = await pool.query('DELETE FROM station_crossings WHERE station1 = $1 or station2 = $1', [id]);
            if (station.rowCount) {
                return res.status(200).json({ message: 'StationCrossings was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no stationCrossing with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/stationcrossings',
    [
        check('station1', 'Incorrect station1. It\'s a required field.')
            .exists(),
        check('station2', 'Incorrect station2 field. It\'s a required field.')
            .exists()
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

            const { station1, station2 } = req.body;

            const station = await pool.query('DELETE FROM station_crossings WHERE station1 = $1 and station2 = $2 or station1 = $2 and station2 = $1', [station1, station2]);
            if (station.rowCount) {
                return res.status(200).json({ message: 'StationCrossings was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no stationCrossing with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;