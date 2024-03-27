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

    if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        // const connection = await pool.getConnection();
        // await connection.query('DELETE FROM RefreshTokens WHERE Token = ?', [refreshToken]);
        // connection.release();
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    }

    try{
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
        

        if (rows.length === 0) {
            connection.release();
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.PasswordHash);

        if (!passwordMatch) {
            connection.release();
            return res.status(401).send({ message: 'Invalid email or password' });
        }

        const accessToken = jwt.sign({ "userId": user.UserID }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ "userId": user.UserID }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

        // Insert refresh token into RefreshTokens table
        await connection.query('INSERT INTO RefreshTokens (UserID, Token) VALUES (?, ?)', [user.UserID, refreshToken]);
        connection.release();

        // Send refreshToken as a cookie and accessToken as a regular JSON response
        res.cookie('jwt', refreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ accessToken});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Login: Internal server error' });
    }

});

module.exports = router;