const config = require('config');

const DB_DATA = {
    user: config.get('db.user'),
    password: config.get('db.password'),
    host: config.get('db.host'),
    port: config.get('db.port'),
    database: config.get('db.database'),
}

const Pool = require("pg").Pool;

const pool = new Pool(DB_DATA);

module.exports = pool;