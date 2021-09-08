const { Router } = require('express');
const User = require('../models/user.js'); //load User model
const auth = require('../middleware/auth.js');
const multer = require('multer'); // load multer for file uploading

const { customAlphabet } = require('nanoid');
const { alphanumeric } = require('nanoid-dictionary');
const alphanumericRandom = customAlphabet(alphanumeric, 10);
const router = new Router();

//set up multer upload image handler
const uploadImage = multer({
	storage: multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, 'images');
		},
		filename: async function (req, file, callback) {
			//cb(err Error, filename<string>)
			try {
				const mimetype = file.mimetype.match(/^image\/(jpg|png|jpeg)$/)[1];
				const name = alphanumericRandom();
				console.log(mimetype, name);
				return callback(null, `${file.fieldname}${name}.${mimetype}`);
			} catch (err) {
				callback(err);
			}
		},
	}),

	limits: {
		fileSize: 1024 * 1024, //size in bytes
	},

	fileFilter(req, file, callback) {
		//const mimeTypes = ['image/jpeg', 'image/png'];
		if (!mimeTypes.includes(file.mimetype)) {
			return cb(new multer.MulterError('Please upload a jpg|jpeg|png file'));
			//have to have a return before cb(Error) to prevent file upload when not met filter
		}

		callback(null, true); // accepted
	},
});

const uploadDoc = multer({
	//set up multer upload handler
	dest: 'images',
	limit: {
		fileSize: 1024 * 1024, //size in bytes
	},
	fileFilter(req, file, cb) {
		console.log(file.mimetype);
		if (!file.originalname.match(/\.(doc|docx)$/)) {
			return cb(new multer.MulterError('Please upload a doc|docx file'));
			//have to have a return before cb(Error) to prevent file upload when not met filter
		}

		cb(null, true); // accepted
		// cb(null, false); // rejected with no error
	},
});

//Create a new user, no authentication required
router.post('/users', async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();
		const token = await user.generateAuthToken();
		return res.status(201).send({ user, token });
	} catch (err) {
		return res.status(400).send(err);
	}
});

//Login with incoming post req of user's email and password JSON
router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();

		res.send({ user, token });
	} catch (err) {
		res.status(400).send('Wrong credentials');
	}
});

//Logout a session and delete an auth token from user
router.post('/users/logout', auth, async (req, res) => {
	try {
		//filter out the current token sent from client and remove it from user tokens <<array>>
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token !== req.token; // req.token is token carrier passed by auth <<middleware>>
		});
		await req.user.save();
		res.status(200).send('Logout session succeed!');
	} catch (err) {
		res.status(400).send();
	}
});

//Logout all sessions, drop user.tokens[]
router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.status(200).send('Logout all sessions succeed!');
	} catch (err) {
		res.status(400).send('Bad request');
	}
});

//Get requesting user profile
router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

//Update user profile with authorized token
router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body); //extract keys on request json
	const allowUpdates = ['name', 'email', 'age', 'password'];
	const isValidOperation = updates.every((update) => allowUpdates.includes(update));

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update])); //assign user's props with updates data
		await req.user.save();
		res.status(200).send(req.user);
	} catch (err) {
		res.status(500).send(err);
	}
});

//Delete a user from db with authorized token
router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove();
		res.status(200).send('User deleted');
	} catch (err) {
		res.status(500).send(err);
	}
});

//Upload user avatar
// upload a single file, binary contained inside req.file.avatar
router.post('/user/me/avatar', (req, res) => {
	uploadImage.single('avatar')(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			res.status(400).send(err);
		} else if (err) {
			res.status(500).send('Interal server error!');
		} else {
			res.status(200).send('File uploaded');
		}
	});
});

module.exports = router;
