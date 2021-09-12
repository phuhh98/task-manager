const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY); // configure api key for sendgrid machine

// const welcomeMsg = {
// 	to: "phuhh98@gmail.com", // Change to your recipient
// 	from: "phuhh98@gmail.com", // Change to your verified sender
// 	subject: "Sending with SendGrid is Fun",
// 	text: "and easy to do anywhere, even with Node.js",
// 	html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'phuhh98@gmail.com',
		subject: 'Thanks for joining us',
		text: `Welcome to the app, ${name}. Let me know how you get along with the app.`,
	});
};

const sendCancelation = (email, name) => {
	sgMail.send({
		to: email,
		from: 'phuhh98@gmail.com',
		subject: 'Farewell',
		text: `So sad that you leave ${name} 😢`,
	});
};

module.exports = {
	sendWelcomeEmail,
	sendCancelation,
};
