var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var hbs = require('hbs');

var app = express();
var expressWs = require('express-ws')(app);

app.use(express.static('content'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var exerciseSubmissions = {};
var exerciseWsConnections = {};

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
				});
			});
		});
	});
});

app.ws('/exercises/:exerciseName/submissions', function(ws, req) {
	var exerciseName = req.params.exerciseName;
	console.log('registering ws connection for ' + exerciseName);
	if (!(exerciseName in exerciseWsConnections)) {
		exerciseWsConnections[exerciseName] = new Array();
	}
	exerciseWsConnections[exerciseName].push(ws);
	notifyExerciseObservers(exerciseName);
	ws.on('close', function(code, reason) {
		console.log('connection closed!');
		for (var i = 0; i < exerciseWsConnections[exerciseName].length; i++) {
			if (exerciseWsConnections[exerciseName][i] == ws) {
				exerciseWsConnections[exerciseName].splice(i, 1);
				break;
			}
		}
	});
});

app.post('/exercises/:exerciseName/authors/:author/solutions', function (req, res) {
	var exerciseName = req.params.exerciseName;
	console.log(req.body);
	var solution = req.body.solution;
	if (!(exerciseName in exerciseSubmissions)) {
		exerciseSubmissions[exerciseName] = new Array();
	}
	exerciseSubmissions[exerciseName].push({ id: exerciseSubmissions.length, author: req.params.author, solution: solution, score: calculateScore(solution) });
	notifyExerciseObservers(exerciseName);
	res.sendStatus(200);
});

function calculateScore(solution) {
	return solution.replace(new RegExp("<.+>"),"x").length;
}

function notifyExerciseObservers(exerciseName) {
	console.log('Attempting to notify observers...');
	console.log(exerciseWsConnections);
	if (!(exerciseName in exerciseWsConnections)) {
		console.log('Exercise has no observers');
		return;
	}
	for (var i = 0; i < exerciseWsConnections[exerciseName].length; i++) {
		console.log('Notifying observer!');
		exerciseWsConnections[exerciseName][i].send(JSON.stringify({ solutions: exerciseSubmissions[exerciseName].sort(function(a, b) { return a.score - b.score })}));
	}	
}

// Implement delete a post endpoint
//app.delete('/exercises/:exerciseName/submissions/:submissionId'), function (req, res) {
//}

app.listen(3000);

module.exports = { calculateScore: calculateScore };
