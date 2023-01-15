const express = require('express')
const dotenv = require('dotenv').config()
const db = require('./routes/db-config')
const cookie = require('cookie-parser')
const app= express()
app.use(cookie())
app.use(express.json())
app.use('api',require('./controllers/app'))
app.listen(PORT)
const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('mpdb-db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});



