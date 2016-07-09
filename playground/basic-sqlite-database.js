const Sequelize = require('sequelize');
let sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': `${__dirname}/basic-sqlite-database.sqlite`
});

let Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

sequelize.sync({
	/*force: true*/
}).then(() => {
	console.log('Everything is synced')

	return Todo.findById(7).then((todo) => {
		if (todo) {
			console.log(todo.toJSON())
		}
		else {
			console.log('Could not find todo')
		}
	})

	/*Todo.create({
		description: 'Take out trash'
	}).then((todo) => {
		return Todo.create({
			description: 'Clean office'
		});
	}).then(() => {
		/*return Todo.findById(1)
		return Todo.findAll({
			where: {
				description: {
					$like: '%office'
				}
			}
		})
	}).then((todos) => {
		if (todos) {
			todos.forEach((todo) => {
				console.log(todo.toJSON());
			})

		} else {
			console.log('no todo found')
		}
	}).catch((e) => {
		console.log(e);
	})*/
})