const request = require('supertest')
const app = require('../src/app');
const Task = require('../src/models/task')
const {userOne, userOneId, setupDatabase, taskOne} = require('./fixtures/db.js')

beforeEach(setupDatabase);


test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks')
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send({
			description: "From my test"
		})
		.expect(201)

	//Assert that task has been created
	const task = await Task.findById(response.body._id)
	expect(task).not.toBeNull()
	expect(task.completed).toEqual(false);
})

test('Get tasks from userOne', async () => {

	const response = await request(app).get('/tasks')
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	//Assert length of response array is 2
	expect(response.body.length).toEqual(2)
})


test('Delete task with valid authorization', async () => {
	const response = await request(app)
		.delete(`/tasks/${taskOne._id.toString()}`)
		.set("Authorization", `Bearer ${userOne.tokens[0].token}`)
		.send()
		.expect(200)

	// Assert deletion
	const task = await Task.findById(taskOne._id)
	expect(task).toBeNull()

})