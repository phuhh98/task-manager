const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require("../../src/models/user.js")
const Task = require("../../src/models/task.js")

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();

const userOne = {
	_id: userOneId,
	name: 'Mike',
	email: 'mike@example.com',
	password: '1234567',
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
		},
	],
};

const userTwo = {
	_id: userTwoId,
	name: 'Jess',
	email: 'jess@example.com',
	password: '12@@567',
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
		},
	],
}


const taskOne = {
	_id : new mongoose.Types.ObjectId(),
	description: "First task",
	completed: false,
	owner: userOne._id
}

const taskTwo = {
	_id : new mongoose.Types.ObjectId(),
	description: "Second task",
	completed: true,
	owner: userOne._id
}
const taskThree = {
	_id : new mongoose.Types.ObjectId(),
	description: "Third task",
	completed: true,
	owner: userTwo._id
}


const setupDatabase = async () => {
	await User.deleteMany(); // clear Users collection
	await Task.deleteMany(); // clear Tasks colection
	await new User(userOne).save();
	await new User(userTwo).save();
	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();

}

module.exports = {
	userOne,
	userOneId,
	userTwo,
	userTwoId,
	setupDatabase,
	taskOne
}