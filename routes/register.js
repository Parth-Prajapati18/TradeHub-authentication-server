const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.post('/', async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    const connection = await pool.getConnection();

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await connection.query('INSERT INTO Users (Email, FirstName, LastName, PasswordHash) VALUES (?, ?, ?, ?)', [email, firstName, lastName, hashedPassword]);

        if (result.affectedRows === 1) {
            return res.status(201).send({ 'success': `New user ${firstName} created!` });
        } else {
            throw new Error('User could not be registered');
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send('User already exists');
        }
        console.error('Failed to register user:', error);
        return res.status(500).send('Register: Internal Server Error');
    } finally {
        connection.release();
    }
});

module.exports = router;