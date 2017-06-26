var express = require('express')
var fs = require('fs')
var hbs = require('hbs')

var app = express()

app.use(express.static('content'))
app.set('view engine', 'hbs')

app.get('/exercises/:exerciseName', function (req, res) {
	var exerciseName = req.params.exerciseName
	fs.readFile('exercises/' + exerciseName + '_title', function(err, name) {
		if (err) throw err
		fs.readFile('exercises/' + exerciseName + '_start', function(err, start) {
			if (err) throw err
			fs.readFile('exercises/' + exerciseName + '_end', function(err, end) {
				if (err) throw err
				res.render('index', { 
							exercise_name: name.toString(),
							exercise_start: start.toString(),
							exercise_end: end.toString() 
				})
			})
		})
	})
})

app.listen(3000)
