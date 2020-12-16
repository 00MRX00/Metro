const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const pool = require('../db/db');
const router = Router();

router.get('/tickets', async (_, res) => {
    try {
        const allTickets = await pool.query('SELECT * FROM tickets');
        return res.status(200).json({ tickets: allTickets.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
    }
})

router.post(
    '/tickets',
    [
        check('tripsCount', 'Incorrect tripsCount field. Min trips count: 0, Max trips count: 200.')
            .exists()
            .withMessage('Incorrect tripsCount. It\'s a required field')
            .bail()
            .isLength({ min: 0, max: 200 }),
        check('balance', 'Incorrect balance. Min balance: 0, Max balance: 999999.')
            .exists()
            .withMessage('Incorrect balance field. It\'s a required field')
            .bail()
            .isLength({ min: 0, max: 999999 }),
        check('fitTo', 'Incorrect fitTo field. Min fitTo: current date, Max fitTo: current date + 1 year.')
            .exists()
            .withMessage('Incorrect fitTo. It\'s a required field')
            .bail()
            .custom(value => {
                return new Date(value) >= new Date() && new Date(value) <= (new Date).setFullYear((new Date()).getFullYear() + 1)
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

            const { tripsCount, balance, fitTo } = req.body;
            const newTicket = await pool.query('INSERT INTO tickets (trips_count, balance, fit_to) VALUES ($1, $2, $3) RETURNING *', [tripsCount, balance, fitTo]);
            return res.status(201).json({ message: 'New ticket added', newTicket: newTicket.rows[0] })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.get(
    '/tickets/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const tickets = await pool.query('SELECT * FROM tickets WHERE ticket_id = $1', [id]);
            if (tickets.rows.length) {
                return res.status(200).json({ tickets: tickets.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no tickets with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.put(
    '/tickets/:id',
    [
        check('tripsCount', 'Incorrect tripsCount field. Min trips count: 0, Max trips count: 200.')
            .exists()
            .withMessage('Incorrect tripsCount. It\'s a required field')
            .bail()
            .isLength({ min: 0, max: 200 }),
        check('balance', 'Incorrect balance. Min balance: 0, Max balance: 999999.')
            .exists()
            .withMessage('Incorrect balance field. It\'s a required field')
            .bail()
            .isLength({ min: 0, max: 999999 }),
        check('fitTo', 'Incorrect fitTo field. Min fitTo: current date, Max fitTo: current date + 1 year.')
            .exists()
            .withMessage('Incorrect fitTo. It\'s a required field')
            .bail()
            .custom(value => {
                return new Date(value) >= new Date() && new Date(value) <= (new Date).setFullYear((new Date()).getFullYear() + 1)
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
            const { tripsCount, balance, fitTo } = req.body;

            const ticket = await pool.query('UPDATE tickets SET (trips_count, balance, fit_to) = ($1, $2, $3) WHERE ticket_id = $4 RETURNING *', [tripsCount, balance, fitTo, id]);

            if (ticket.rows.length) {
                return res.status(200).json({ message: 'Ticket updated', ticket: ticket.rows[0] })
            }
            return res.status(400).json({ message: 'There\'s no ticket with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

router.delete(
    '/tickets/:id',
    async (req, res) => {
        try {
            const { id } = req.params;

            const ticket = await pool.query('DELETE FROM tickets WHERE ticket_id = $1', [id]);
            if (ticket.rowCount) {
                return res.status(200).json({ message: 'Ticket was deleted' })
            }
            return res.status(400).json({ message: 'There\'s no ticket with such id' })
        } catch (e) {
            return res.status(500).json({ message: e.message || 'Something went wrong, please, try again' })
        }
    })

module.exports = router;