//establish connection with mongodb server

const mongoose = require('mongoose');
const connection = process.env.MONGODB_STRING || 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose.connect(connection, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
});
