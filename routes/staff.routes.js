const { Router } = require('express');
const pool = require('../db/db');
const router = Router();

router.get('/staff', async (_, res) => {
    try {
        const allStaff = await pool.query('SELECT * FROM staff');
        return res.status(200).json({ staff: allStaff.rows })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

router.post('/staff', async (req, res) => {
    try {
        const { passport, phone, firstname, lastname, patronymic } = req.body;
        await pool.query(`
            INSERT INTO staff 
            (passport, phone, firstname, lastname, patronymic) 
            VALUES ($1, $2, $3, $4, $5);
            `, [passport, phone, firstname, lastname, patronymic]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(201).json({ message: 'New staff added' })
})

router.put('/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { passport, phone, firstname, lastname, patronymic } = req.body;
        await pool.query(`
                UPDATE staff SET (passport, phone, firstname, lastname, patronymic) = ($1, $2, $3, $4, $5) 
                WHERE staff_id = $6
                `, [passport, phone, firstname, lastname, patronymic, id]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(200).json({ message: 'Line updated' })
})

router.delete('/staff/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM staff WHERE staff_id = $1', [id]);
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
    return res.status(200).json({ message: 'Line was deleted' })
})

module.exports = router;