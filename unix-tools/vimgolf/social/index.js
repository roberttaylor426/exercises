var express = require('express')

var app = express()

app.use(express.static('content'))

app.listen(3000)
