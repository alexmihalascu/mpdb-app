const express = require('express')
const cookie = require('cookie-parser')
const app= express()
const PORT = 3000
app.use(cookie())
app.use(express.json())
app.use('api',require('./controllers/app'))
app.listen(PORT)



