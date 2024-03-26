require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { logger } = require('./middleware/logEvents');
const credentials = require('./middleware/credentials')
const port = 3001;


app.use(logger);
app.use(credentials);
app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

//server static files
app.use('/', express.static(path.join(__dirname, '/public')));

//routes
app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/auth'));

app.listen(port, () => {
    console.log(`Auth server is running on port ${port}`);
});