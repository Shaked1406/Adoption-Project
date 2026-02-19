
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'cyber123123',
    database: 'adoption_project'
});

module.exports = pool.promise();
