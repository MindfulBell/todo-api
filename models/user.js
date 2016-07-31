const bcrypt = require('bcryptjs');
const _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	let user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		salt: {
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				let salt = bcrypt.genSaltSync(10);
				let hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: (user, options) => {
				user.email = typeof user.email === 'string' ? user.email.toLowerCase() : user.email;
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					user.findOne({
						where: {
							email: body.email
						}
					}).then((user) => {
						if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
							return reject();
						}
						resolve(user);
					}, (e) => {
						reject();
					});
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function() {
				let json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt')
			}
		}
	});
	return user;
}