const express = require('express');
const PORT = process.env.PORT || 8080;
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const _ = require('underscore');
const db = require('./db.js');
const bcrypt = require('bcryptjs');
const middleware = require('./middleware.js')(db);

let todos = [];
let todoNextId = 1;

let app = express();
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.send('Todo API Root Bacon');
})

// GET /todos?completed=true&q=ass

app.get('/todos', middleware.requireAuthentication, (req, res) => {
	let query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed')) {
		where.completed = query.completed === 'true' ? true : false;
	}
	if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
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
app.get('/todos/:id', middleware.requireAuthentication, (req, res) => {
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
app.post('/todos', middleware.requireAuthentication, (req, res) => {
	let body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then((todo) => {
		res.status(200).json(todo.toJSON())
	}).catch((e) => {
		res.status(400).json(e);
	})
})

// DELETE
app.delete('/todos/:id', middleware.requireAuthentication, (req, res) => {
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
app.put('/todos/:id', middleware.requireAuthentication, (req, res) => {
	const id = parseInt(req.params.id);
	let body = _.pick(req.body, 'description', 'completed');
	let attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description
	}

	db.todo.findById(id).then((todo) => {
		if (todo) {
			todo.update(attributes).then((todo) => {
				res.json(todo.toJSON());
			}, (e) => {
				res.status(400).json(e);
			})
		} else {
			res.status(404).send();
		}
	}, () => {
		res.status(500).send();
	})
})

// USER POST

app.post('/users', (req, res) => {
	let body = _.pick(req.body, 'email', 'password');

	db.user.create(body).then((user)=>{
		res.json(user.toPublicJSON());
	}, (e)=>{
		res.status(400).json(e);
	});

});

//POST /users/login

app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then((user) => {
		let token = user.generateToken('authentication');

		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		}
		else {
			res.status(401).send();
		}
		
	},(e) => {
		res.status(401).send();
	})
})

db.sequelize.sync({force: true}).then(() => {
	app.listen(PORT, (req, res) => {
		console.log(`Listening on PORT ${PORT}`)
	})
})