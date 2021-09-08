const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const auth = async (req, res, next) => {
	try {
		const token = req.header('Authorization').replace('Bearer ', '');
		const decoded = await jwt.verify(token, process.env.TOKEN_SIGNITURE);
		const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
		if (!user) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
	} catch {
		res.status(401).send('Error: Please authentiation!');
	}
};

module.exports = auth;