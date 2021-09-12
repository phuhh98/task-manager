const request = require('supertest');
const app = require('../src/app');
const User = require("../src/models/user.js");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const userOneId = new mongoose.Types.ObjectId();
const userOne = {
	_id : userOneId,
	name: "Mike",
	email: "mike@example.com",
	password: '1234567',
	tokens: [{
		token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
	}]
}

beforeEach(async () => {
	await  User.deleteMany();
	await new User(userOne).save();
})

test('Should sign up a new user', async () => {
	const response = await request(app).post('/users').send({
		name: "hhp",
		password: 'Mypass777!',
		email: "nhokgalmht@gmail.com"
	}).expect(200);

	//Assert that the database was change correctly
	const user = await User.findById(response.body.user._id)
	expect(user).not.toBeNull()

	//Assertion about the response
	expect(response.body).toMatchObject({
		user: {
			name:"hhp",
			email: "nhokgalmht@gmail.com",
		},
		token: user.tokens[0].token
	})
	expect(user.password).not.toBe('Mypass777!')
})

test('Should signin existing user', async () => {
	const response = await request(app).post('/users/login').send({
		email: userOne.email,
		password: userOne.password
	}).expect(200);


	//Assert that return token match db token
	const user = await User.findById(userOneId)
	expect(user).not.toBeNull()
	//console.log(user.tokens[1].token, response.body.token);
	expect(user.tokens[1].token == response.body.token).toBe(true);
})

test('Should not login non-existent user', async () => {
	await request(app).post('/users/login').send({
		email: "pecola@123.com",
		password: "23146135"
	}).expect(400)
})


test('Get user profile with jwt token Authorization', async () => {
	await request(app)
		.get("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)
})


test('Get user profile without jwt token should fail', async () => {
	await request(app)
		.get("/users/me")
		.send()
		.expect(401);
})

test('Should delete account for user', async () => {
	await request(app)
		.delete("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	//Assert that user has been removed from db
	const user = await User.findById(userOneId);
	expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
	await request(app)
		.delete("/users/me")
		.send()
		.expect(401)
})


test('Should upload avatar image',async () => {
	await request(app)
		.post("/users/me/avatar")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200)

	const user = await User.findById(userOneId)
	expect(user.avatar).toEqual(expect.any(Buffer))
})


test('Should update valid user fields', async () => {
	await request(app)
		.patch("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			name: "Jodan"
		})
		.expect(200)

	//Assert user name has been updated correctly
	const user = await User.findById(userOneId)
	expect(user.name).toBe("Jodan")
})

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch("/users/me")
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			location: "1251212"
		})
		.expect(400)

})