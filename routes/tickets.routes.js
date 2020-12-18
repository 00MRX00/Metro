const { Router } = require('express');
const pool = require('../db/db');
const router = Router();


router.get('/tickets', async (_, res) => {
    try {
        const allTickets = await pool.query('SELECT ticket_id, trips_count, balance, TO_CHAR(fit_to, \'dd-mm-yyyy\') as fit_to FROM tickets');
        return res.status(200).json({ tickets: allTickets.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.post('/tickets', async (req, res) => {
        try {
            const { trips_count, balance} = req.body;
            await pool.query(`
                INSERT INTO tickets 
                (trips_count, balance, fit_to) 
                VALUES ($1, $2, NOW() + INTERVAL '6' MONTH);
                `, [trips_count, balance]);
            return res.status(201).json({ message: 'New ticket added' })
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    })

router.put('/tickets/:id', async (req, res) => {
        try {
            const { id } = req.params;
            const { trips_count, balance, fit_to } = req.body;
            await pool.query('UPDATE tickets SET (trips_count, balance, fit_to) = ($1, $2, $3) WHERE ticket_id = $4', [trips_count, balance, fit_to, id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Ticket updated' })
    })

router.delete('/tickets/:id', async (req, res) => {
        try {
            const { id } = req.params;
            await pool.query('DELETE FROM tickets WHERE ticket_id = $1', [id]);
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
        return res.status(200).json({ message: 'Ticket was deleted' })
    })

module.exports = router;