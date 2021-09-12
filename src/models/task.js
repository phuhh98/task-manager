const mongoose = require('mongoose');
// const validator = require('validator');
const { Schema } = mongoose;

const TaskSchema = new Schema(
	{
		description: {
			type: String,
			required: true,
		},
		completed: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId, // or just simply ObjectId,
			required: true,
			ref: 'User',
		},
	},
	{
		timestamps: true, //Schema option to enable mongoose manage createAt and updateAt prop of object instance
	}
);

const Task = new mongoose.model('Task', TaskSchema);

module.exports = Task;
