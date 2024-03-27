const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.post('/', async(req, res) => {

    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204);
    const refreshToken = cookies.jwt;
    
    try{
        const connection = await pool.getConnection();
        await connection.query('DELETE FROM RefreshTokens WHERE Token = ?', [refreshToken]);
        connection.release();

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        res.status(200).send({ message: 'Logged out' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    };

})

module.exports = router;