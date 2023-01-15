const sql = require('mysql')
const db = sql.createConnection({host:process.env.HOST, pass: process.env.PASS, database: process.env.DATABASE, user: process.env.USER})
module.exports = db