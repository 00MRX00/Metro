const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/lostthings', async (_, res) => {
    try {
        const lostThings = await pool.query('SELECT * FROM lost_things');
        return res.status(200).json({ lostThings: lostThings.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/lostthings',
    [
        check('staff', 'Incorrect staff. Staff with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect staff field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM staff WHERE staff_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('station', 'Incorrect station. Staff with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect station field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('title', 'Incorrect title field. Lost thing with such title already exists')
            .exists()
            .bail()
            .isLength({ min: 3, max: 255 })
            .withMessage('Incorrect title field. Title must be min: 3 and max: 255 symbols long.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM lost_things WHERE title = $1', [value]);
                if (st.rowCount) {
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

            const { title, staff, station } = req.body;
            const newStationCrossings = await pool.query('INSERT INTO lost_things (title, staff_found, station_found) VALUES ($1, $2, $3) RETURNING *', [title, staff, station]);
            return res.status(201).json({ message: 'New stationCrossing added', newStationCrossings: newStationCrossings.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/lostthing/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const lostThing = await pool.query('SELECT * FROM lost_things WHERE thing_id = $1', [id]);
            if (lostThing.rowCount) {
                return res.status(200).json({ lostThing: lostThing.rows })
            }
            return res.status(400).json({ message: 'There\'s no lostThing with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/lostthings/:id',
    [
        check('staff', 'Incorrect staff. Staff with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect staff field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM staff WHERE staff_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('station', 'Incorrect station. Staff with such id doesn\'t exist..')
            .exists()
            .withMessage('Incorrect station field. It\'s a required field.')
            .bail()
            .custom(async value => {
                const st = await pool.query('SELECT * FROM stations WHERE station_id = $1', [value]);
                if (!st.rowCount) {
                    return Promise.reject();
                }
            }),
        check('title', 'Incorrect title field. Lost thing with such title already exists')
            .exists()
            .bail()
            .isLength({ min: 3, max: 255 })
            .withMessage('Incorrect title field. Title must be min: 3 and max: 255 symbols long.')
            .bail()
            .custom(async (value, { req }) => {
                const st = await pool.query('SELECT * FROM lost_things WHERE title = $1 and thing_id != $2', [value, req.params.id]);
                if (st.rowCount) {
                    return Promise.reject();
                }
            }),
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

            const { title, staff, station } = req.body;

            const lostThing = await pool.query('UPDATE lost_things SET (title, staff_found, station_found) = ($1, $2, $3) WHERE thing_id = $4 RETURNING *', [title, staff, station, id]);

            if (lostThing.rowCount) {
                return res.status(200).json({ message: 'StationCrossings updated', lostThing: lostThing.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no lostThing with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/lostthings/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const lostThings = await pool.query('DELETE FROM lost_things WHERE thing_id = $1', [id]);
            if (lostThings.rowCount) {
                return res.status(200).json({ message: 'StationCrossings was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no lostThings with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;