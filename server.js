const express = require('express');
const PORT = process.env.PORT || 8080;
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');

let todos = [];
let todoNextId = 1;

let app = express();
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json());

app.get('/', (req, res)=>{
	res.send('Todo API Root Bacon');
})

// GET /todos

app.get('/todos', (req, res)=>{
	res.json(todos);
})

//GET todos/:id

app.get('/todos/:id', (req, res)=>{
	let todo = todos.filter((todo)=>{
		return todo.id === parseInt(req.params.id, 10);
	})
	if (!todo.length){
		res.status(404).send("No matching id found...");
	}
	else {
		res.json(todo)
	}
})

//POST

app.post('/todos', (req, res)=>{
	let body = req.body;

	body.id = todoNextId++;
	todos.push(body)

	res.json(body);
})


app.listen(PORT, (req, res)=>{
	console.log(`Listening on PORT ${PORT}`)
})