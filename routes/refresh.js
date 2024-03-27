const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).send({ message: 'No token provided'});

    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    try {

        const connection = await pool.getConnection();
        const [tokens] = await connection.query('SELECT * FROM RefreshTokens WHERE Token = ?', [refreshToken]);

        if (tokens.length === 0) {
            connection.release();
            return res.status(403).send({ message: "Invalid refresh token"});
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {

            if (err) {
                connection.release();
                return res.status(403).send({ message : 'Invalid token'});
            }

            const accessToken = jwt.sign({ "userId": decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            connection.release();
            res.status(200).json({accessToken});
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});


module.exports = router;