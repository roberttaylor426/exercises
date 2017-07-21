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

var exerciseSolutions = {};
var deletedSolutions = {};
var exerciseWsConnections = {};
var exerciseKeystrokesVisible = {};

var analogyVideos = [
	["https://www.youtube.com/watch?v=GA2-DEEkU9M","https://www.youtube.com/watch?v=rDWRyU5yFxU","https://youtu.be/0ZcpbsoeDZ0?t=73"],
	["https://youtu.be/6JdSgDzi1XU","https://www.youtube.com/watch?v=z70XlpjnEb8","https://www.youtube.com/watch?v=V6m5ZQke4mw"],
	["https://youtu.be/AzzpQ5EhPck?t=33","https://youtu.be/PDmhGVP41h4","https://www.youtube.com/watch?v=HzZnAIZlEnE"],
	["https://youtu.be/GA2-DEEkU9M?t=15","https://youtu.be/dviHVZj42U8","https://youtu.be/bO-ARrx6eRE","https://youtu.be/sTqKU1qCjDg","https://youtu.be/zaFPhlVOJ48","https://www.youtube.com/watch?v=kpB1nHSB1HM","https://www.youtube.com/watch?v=LBr7Pc-Wuzo"],
	["https://www.youtube.com/watch?v=CHHGSeUf-30"],
	["https://www.youtube.com/watch?v=bhju0mBRhH8","https://www.youtube.com/watch?v=sCbmxMmo1QM","https://www.youtube.com/watch?v=MK_ifMawOk0","https://www.youtube.com/watch?v=ABVx7jNeI8w","https://www.youtube.com/watch?v=CtQmJf50LGE","https://www.youtube.com/watch?v=t9O5X03Nygc"],
	["https://www.youtube.com/watch?v=YefULut6YrA","https://www.youtube.com/watch?v=NzWN_1RMuAQ","https://www.youtube.com/watch?v=bJe8MseGn3M","https://youtu.be/5_UVgmPDMRY?t=24","https://www.youtube.com/watch?v=4viMgaWeHXI"]
];

app.get('/exercises/:exerciseName', function (req, res) {
	var exerciseName = req.params.exerciseName
	fs.readFile('exercises/' + exerciseName, function(err, exercise) {
		if (err) res.sendStatus(404);
		else res.render('index', JSON.parse(exercise.toString()));
	});
});

app.ws('/exercises/:exerciseName/solutions', function(ws, req) {
	var exerciseName = req.params.exerciseName;
	if (!(exerciseName in exerciseWsConnections)) {
		exerciseWsConnections[exerciseName] = new Array();
	}
	exerciseWsConnections[exerciseName].push(ws);
	notifyExerciseObservers(exerciseName);
	ws.on('close', function(code, reason) {
		console.log('Closing ws connection');
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
	var solution = req.body.solution;
	if (!(exerciseName in exerciseSolutions)) {
		exerciseSolutions[exerciseName] = new Array();
	}
	exerciseSolutions[exerciseName].push({ id: exerciseSolutions[exerciseName].length, author: req.params.author, solution: solution, score: calculateScore(solution) });
	notifyExerciseObservers(exerciseName);
	fs.readFile('exercises/' + exerciseName, function(err, exercise) {
		if (err) throw err;
		var par = JSON.parse(exercise.toString()).exercise_par;
		var score = calculateScore(solution);
		var videoBucket = analogyVideos[determineVideoBucket(score, par)];
		res.send(videoBucket[Math.floor(Math.random() * videoBucket.length)]);
	});
});

function calculateScore(solution) {
	return solution.replace(new RegExp("<.+>"),"x").length;
}

function determineVideoBucket(score, par) {
	if (score > par * 1.3) return 6; 
	if (score > par * 1.2) return 5; 
	if (score > par * 1.1) return 4; 
	if (score <= par * 1.1 && score >= par * 0.9) return 3;
	if (score >= par * 0.8) return 2;
	if (score >= par * 0.7) return 1;
	return 0;
}

function notifyExerciseObservers(exerciseName) {
	if (!(exerciseName in exerciseWsConnections)) {
		return;
	}
	if (!(exerciseName in exerciseKeystrokesVisible)) {
		exerciseKeystrokesVisible[exerciseName] = false;
	}
	for (var i = 0; i < exerciseWsConnections[exerciseName].length; i++) {
		exerciseWsConnections[exerciseName][i].send(JSON.stringify({ 
				solutions: exerciseSolutions[exerciseName]
					.sort(function(a, b) { return a.score - b.score })
					.filter(function(s) { return !(exerciseName in deletedSolutions) || deletedSolutions[exerciseName].indexOf(s.id) == -1 }),
				keystrokesVisible: exerciseKeystrokesVisible[exerciseName]}));
	}	
}

app.delete('/exercises/:exerciseName/solutions/:id', function (req, res) {
	var exerciseName = req.params.exerciseName;
	if (!(exerciseName in deletedSolutions)) {
		deletedSolutions[exerciseName] = new Array();
	}
	deletedSolutions[exerciseName].push(parseInt(req.params.id));
	notifyExerciseObservers(exerciseName);
	res.sendStatus(200);
});

app.put('/exercises/:exerciseName/keystrokesVisible/:visible', function (req, res) {
	var exerciseName = req.params.exerciseName;
	var visible = req.params.visible == 'true';
	exerciseKeystrokesVisible[exerciseName] = visible;
	notifyExerciseObservers(exerciseName);
	res.sendStatus(200);
});

app.listen(3000);

module.exports = { calculateScore: calculateScore, determineVideoBucket: determineVideoBucket };
