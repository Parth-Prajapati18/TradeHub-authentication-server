const express = require('express');
const router = express.Router();
const pool = require('../../config/db');

router.get('/', async (req, res) => {
    const userId = req.body.userId;  
    
    if (!userId) {
        return res.status(400).send({ message: 'UserId is required' });
    }

    try {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query('SELECT * FROM Users WHERE UserID = ?', [userId]);
            if (rows.length === 0) {
                return res.status(404).send({ message: 'User not found' });
            }

            const user = rows[0];
            res.json(user);
        } finally {
            connection.release(); // Ensure the connection is released in case of success or error
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;