//Setup express application
require('dotenv').config({ path: `./config/${process.env.ENV}.env` }) //load .env to environment variables
require('./db/mongoose.js'); //establish connect with mongodb
const fs = require('fs');

const express = require('express');
const path = require('path');

const app = express(); // create a new server instance

const userRouter = require('./routers/user.js');
const taskRouter = require('./routers/task.js');

const morgan = require('morgan'); // a logger

//Middleware on imcoming request
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //middleware to parse body to json

//Create a write stream (in append mode) for morgan logger
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
	flags: 'a',
});

//Setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

//Routers
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
