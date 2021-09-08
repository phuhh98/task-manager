require("dotenv").config(); //load .env to environment variables
require("./db/mongoose.js"); //establish connect with mongodb
const express = require("express");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

const app = express(); // create a new server instance
const PORT = process.env.PORT || 3000;

const userRouter = require("./routers/user.js");
const taskRouter = require("./routers/task.js");
//const auth = require("./middleware/auth.js");
const morgan = require("morgan");
//Middlewares

//maintainance
// app.use((req, res, next) => {
// 	res.status(503).send('Site currently unavailable');
// });
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //middleware to parse body to json
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

//Routers
// setup the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(userRouter);
app.use(taskRouter);

function errorEmit(req, res, next) {
	throw new Error("throw an error");
}

app.get(
	"/upload",
	errorEmit,
	(req, res) => {
		res.send("OK");
	},
	// error middleware at the end of middleware list to handler any error thrown
	(err, req, res, next) => {
		if (err) {
			res.status(500).send(err.message);
		}
	}
);

app.listen(PORT, () => {
	console.log(`Server started on port ${chalk.yellow(PORT)}`);
});
