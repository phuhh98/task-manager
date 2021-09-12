//Call and run express application
const chalk = require('chalk');
const app = require('./app.js');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server started on port ${chalk.yellow(PORT)}`);
});
