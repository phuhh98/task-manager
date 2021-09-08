const mongoose = require("mongoose");
const { Schema } = mongoose;
const Task = require("./task.js");

const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
	{
		// or = new mongoose.Schema({})
		name: {
			type: String,
			required: true,
			trim: true,
		},
		age: {
			type: Number,
			default: 0,
			validate(value) {
				if (value < 0) {
					throw new Error("Invalid age");
				}
			},
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			lowercase: true,
			validate(value) {
				if (!validator.isEmail(value)) {
					throw new Error("Invalid email");
				}
			},
		},
		password: {
			type: String,
			required: true,
			trim: true,
			minLength: 7,
			validate(value) {
				if (value.toLowerCase().includes("password") === false) {
					return true;
				} else {
					throw new Error('Password cannot contain "password"');
				}
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
		avatar: {
			type: Buffer,
		},
	},
	{
		timestamps: true, //Schema option to enable mongoose manage createAt and updateAt prop of object instance
	}
);

//add a virtual prop to userSchema and can be call with user.populate(<<virtual field>>).execPopulate() to get the ref record
userSchema.virtual("tasks", {
	ref: "Task",
	localField: "_id",
	foreignField: "owner",
});

//adjust .toJSON prop of User model instance to send public data when call res.send(<<User instance>>)
//res.send() will call JSON.stringify(<<object>>)
userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;

	return userObject;
};

//add .methods for instance of model
userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = await jwt.sign({ _id: user._id.toString() }, process.env.TOKEN_SIGNITURE, { expiresIn: process.env.TOKEN_LIFE });

	user.tokens.push({ token });
	await user.save();

	return token;
};

//add .findByCredentials() to Model create from userSchema <Schema>
userSchema.statics.findByCredentials = async function (email, password) {
	const user = await this.findOne({ email: email });
	if (!user) {
		throw new Error("Unable to login");
	}
	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to login");
	}
	return user;
};

//Hash the plain text password before saving to db
// Notices: with function has to be bound with object current context no use of arrow function
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

//Make a cascade delete all tasks associated with deleting user before this user is deleted
userSchema.pre("remove", async function (next) {
	const user = this;
	await Task.deleteMany({ owner: user._id });
	next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
