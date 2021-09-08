const { Router } = require('express');
const Task = require('../models/task.js'); //load Task model
const auth = require('../middleware/auth.js');
const router = new Router();

//Post a task to db and associate it with requesting user
router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});
	try {
		const result = await task.save();
		res.status(201).send(result);
	} catch (err) {
		res.status(400).send(err);
	}
});

//Get all tasks associated with requesting user, and with query of completed=true/falselimit and skip for pagination options
//GET /task?completed=true&limit=2&skip=3&sortBy=createAt:desc
router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1; //if the second part of sortBy string is desc return -1 for desc & vice versa
	}
	try {
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort,
				},
			})
			.execPopulate();
		if (!req.user.tasks) {
			return res.status(404).send();
		}

		res.status(200).send(req.user.tasks);
	} catch (err) {
		res.status(500).send(err);
	}
});

//Get a single task by id associated with request user
router.get('/tasks/:id', auth, async (req, res) => {
	const _id = req.params.id;

	try {
		const task = await Task.findOne({ _id, owner: req.user._id });

		if (!task) {
			return res.status(404).send('404 not found!');
		}
		res.status(200).send(task);
	} catch (err) {
		res.status(500).send(err);
	}
});

//Update a task by id associated with requesting user
router.patch('/tasks/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const validUpdates = ['description', 'completed'];
	const isValidOperation = updates.every((update) => validUpdates.includes(update));
	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

		if (!task) {
			return res.status(404).send({ error: 'Task not found!' });
		}

		updates.forEach((update) => (task[update] = req.body[update]));
		const updatedTask = await task.save();
		res.status(200).send(updatedTask);
	} catch (err) {
		res.status(500).send(err);
	}
});

//Delete a task by id associated with requesting user
router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
		!deletedTask ? res.status(404).send({ error: 'Task not found!' }) : res.status(200).send({ deletedTask });
	} catch (err) {
		res.status(500).send();
	}
});

module.exports = router;
