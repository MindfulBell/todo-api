const express = require('express');
const PORT = process.env.PORT || 8080;
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const _ = require('underscore');

let todos = [];
let todoNextId = 1;

let app = express();
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root Bacon');
})

// GET /todos?completed=true&q=ass

app.get('/todos', (req, res) => {
	let queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty("completed") && queryParams.completed === "true") {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		})
	} else if (queryParams.hasOwnProperty("completed") && queryParams.completed === "false") {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		})
	}

	if (queryParams.hasOwnProperty("q") && queryParams.q.trim().length > 0) {
		filteredTodos = _.filter(filteredTodos, (todo) => {
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1
		})
	}

	res.json(filteredTodos);
})

//GET todos/:id
app.get('/todos/:id', (req, res) => {
	const id = parseInt(req.params.id);
	let todo = _.findWhere(todos, {
		id
	})
	if (!todo) {
		res.status(404).send("No matching id found...");
	} else {
		res.json(todo)
	}
})

//POST
app.post('/todos', (req, res) => {
	let body = _.pick(req.body, "description", "completed");

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}
	body.description = body.description.trim();
	body.id = todoNextId++;

	todos.push(body)

	res.json(body);
})

// DELETE

app.delete('/todos/:id', (req, res) => {
	const id = parseInt(req.params.id);
	let todo = _.findWhere(todos, {
		id
	});

	if (!todo) {
		res.status(404).send("Could not find todo to delete...")
	} else {
		todos = _.without(todos, todo);
		res.json(todo);
	}
})

// PUT

app.put('/todos/:id', (req, res) => {
	let body = _.pick(req.body, "description", "completed");
	let validAttributes = {};
	const id = parseInt(req.params.id);
	let todo = _.findWhere(todos, {
		id
	});

	if (!todo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty("completed") && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	Object.assign(todo, validAttributes);
	res.json(todo);

})


app.listen(PORT, (req, res) => {
	console.log(`Listening on PORT ${PORT}`)
})