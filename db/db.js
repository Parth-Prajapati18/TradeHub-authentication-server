const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'cloud150468.mywhc.ca',
    user: 'frontstreetdh_devtestapi_auth',
    password: 'wJW7JO7c0aJ#6%dgbPpetD2pL06DCniYEFc',
    database: 'frontstreetdh_TradeHubAuth'
  });

module.exports = pool;