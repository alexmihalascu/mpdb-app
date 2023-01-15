const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mpdb-db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});

module.exports = db;
