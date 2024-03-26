const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {

    const cookies = req.cookies;
    console.log(`cookie available at login: ${JSON.stringify(cookies)}`);
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: 'Email and password are required' });
    }

    try{
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
        connection.release();

        if (rows.length === 0) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign(
            {
              "user": {
                "username":user.firstName
                }
            },
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: '1h' }
        );

        const  newRefreshToken = jwt.sign(
            { "username": user.firstName},
            process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: '1d'}
        );

        res.status(200).json({ token: accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Login: Internal server error' });
    }

});

module.exports = router;