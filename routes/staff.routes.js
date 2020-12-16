const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/staff', async (_, res) => {
    try {
        const allStaff = await pool.query('SELECT * FROM staff');
        return res.status(200).json({ staff: allStaff.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/staff',
    [
        check('passport', 'Incorrect passport. It must be 10 symbols long').custom(value => {
            return value.length === 10;
        }),
        check('phone', 'Incorrect phone. It must be 10 symbols long')
            .exists()
            .withMessage('Incorrect passport. It\'s a required field')
            .bail()
            .custom(value => {
                return value.length === 10;
            }),
        check('firstname', 'Incorrect firstname. It\'s a required field').exists(),
        check('lastname', 'Incorrect lastname. It\'s a required field').exists(),
        check('patronymic', 'Incorrect patronymic. It\'s a required field').exists()
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

            const { passport, phone, firstname, lastname, patronymic } = req.body;
            const newStaff = await pool.query('INSERT INTO staff (passport, phone, firstname, lastname, patronymic) VALUES ($1, $2, $3, $4, $5) RETURNING *', [passport, phone, firstname, lastname, patronymic]);
            return res.status(201).json({ message: 'New staff added', newStaff: newStaff.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/staff/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const staff = await pool.query('SELECT * FROM staff WHERE staff_id = $1', [id]);
            if (staff.rows.length) {
                return res.status(200).json({ staff: staff.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no staff with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/staff/:id',
    [
        check('passport', 'Incorrect passport. It must be 10 symbols long').custom(value => {
            return value.length === 10;
        }),
        check('phone', 'Incorrect phone. It must be 10 symbols long')
            .exists()
            .withMessage('Incorrect phone. It\'s a required field')
            .bail()
            .custom(value => {
                return value.length === 10;
            }),
        check('firstname', 'Incorrect firstname. It\'s a required field').exists(),
        check('lastname', 'Incorrect lastname. It\'s a required field').exists(),
        check('patronymic', 'Incorrect patronymic. It\'s a required field').exists()
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
            const { passport, phone, firstname, lastname, patronymic } = req.body;
            const oldStaff = await pool.query('SELECT * FROM staff WHERE phone = $1 and staff_id != $2', [phone, id]);
            if (oldStaff.rows.length) {
                return res.status(400).json({ message: 'Staff with the same phone already exists' })
            }

            const staff = await pool.query('UPDATE staff SET (passport, phone, firstname, lastname, patronymic) = ($1, $2, $3, $4) WHERE staff_id = $5 RETURNING *', [passport, phone, firstname, lastname, patronymic, id]);

            if (staff.rows.length) {
                return res.status(200).json({ message: 'Staff updated', staff: staff.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no staff with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/staff/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const staff = await pool.query('DELETE FROM staff WHERE staff_id = $1', [id]);
            if (staff.rowCount) {
                return res.status(200).json({ message: 'Staff was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no staff with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;