var express = require('express')
var bodyParser = require('body-parser')
var fs = require('fs')
var hbs = require('hbs')

var app = express()

app.use(express.static('content'))
app.set('view engine', 'hbs')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var exerciseSubmissions = {}

// Make this tidier with promises
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

// Implement websocket endpoint
//'/exercises/:exerciseName/submissions'

// Implement submission endpoint
app.post('/exercises/:exerciseName/authors/:author/submissions', function (req, res) {
	var solution = req.body.solution
	exerciseSubmissions[req.params.exerciseName] = { author: req.params.author, solution: solution, score: calculateScore(solution) }
})

function calculateScore(solution) {
	return solution.length
}

// Implement delete a post endpoint
//app.delete('/exercises/:exerciseName/submissions/:submissionId'), function (req, res) {
//}

app.listen(3000)

module.exports = { calculateScore: calculateScore }
