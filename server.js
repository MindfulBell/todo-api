var express = require('express');
var PORT = process.env.PORT || 8080;
var favicon = require('serve-favicon');

var app = express();
app.use(favicon(__dirname + '/public/favicon.ico'))

app.get('/', function(req, res){
	res.send('Todo API Root');
})

app.listen(PORT, function(req, res){
	console.log('Listening on PORT ' + PORT)
})