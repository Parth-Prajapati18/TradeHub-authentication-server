const express = require('express');
const pool = require('./db/db');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3001;
const saltRounds = 10;

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
    res.send("Authentication server is up and running");
});

app.post('/login', async (req,res) => {

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

        const token = jwt.sign({ user }, process.env.JWT_SECRET , { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Login: Internal server error' });
    }
});


app.post('/register', async (req, res) => {
    const { email, firstName, lastName, password } = req.body;

    const connection = await pool.getConnection();

    if (!email || !firstName || !lastName || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await connection.query('INSERT INTO Users (Email, FirstName, LastName, PasswordHash) VALUES (?, ?, ?, ?)', [email, firstName, lastName, hashedPassword]);

        if (result.affectedRows === 1) {
            return res.status(201).send('User registered successfully');
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

app.listen(port, () => {
    console.log(`Auth server is running on port ${port}`);
});