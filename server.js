const express = require('express');
const PORT = process.env.PORT || 8080;
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');

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
	let query = req.query;
	var where = {};

	if (query.hasOwnProperty("completed")) {
		where.completed = query.completed === "true" ? true : false;
	}
	if (query.hasOwnProperty("q") && query.q.trim().length > 0) {
		where.description = {
			$like: `%${query.q.trim()}%`
		}
	}

	db.todo.findAll({
		where
	}).then((todos) => {
		res.json(todos)
	}).catch((e) => {
		res.status(500).send();
	})
})

//GET todos/:id
app.get('/todos/:id', (req, res) => {
	const id = parseInt(req.params.id);

	db.todo.findById(id).then((todo) => {
		if (!!todo) {
			res.json(todo.toJSON())
		} else {
			res.status(404).send();
		}
	}).catch((e) => {
		res.status(500).json(e);
	})
})

//POST
app.post('/todos', (req, res) => {
	let body = _.pick(req.body, "description", "completed");

	db.todo.create(body).then((todo) => {
		res.status(200).json(todo.toJSON())
	}).catch((e) => {
		res.status(400).json(e);
	})
})

// DELETE

app.delete('/todos/:id', (req, res) => {
	const id = parseInt(req.params.id);

	db.todo.destroy({
		where: {
			id
		}
	}).then((rowsDeleted) => {
		if (rowsDeleted === 0) {
			return res.status(404).json({
				error: 'No todo with id'
			});
		} else {
			res.status(204).send();
		}
	}).catch((e) => {
		res.status(500).json(e);
	})
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

db.sequelize.sync().then(() => {
	app.listen(PORT, (req, res) => {
		console.log(`Listening on PORT ${PORT}`)
	})
})