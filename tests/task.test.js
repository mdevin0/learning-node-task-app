const request = require('supertest');

const app = require('src/app');
const Task = require('src/model/task');
const {existingUser, setupDatabase, wipeDatabase, 
    existingTask1, existingTask2, existingTask3} = require('tests/fixtures/db');

beforeEach(setupDatabase);
afterAll(wipeDatabase);

describe('Create task', () => {
    test('Should create task', async () => {
        const response = await request(app)
        .post('/task')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            description: "Task without 'completed'"
        })
        .expect(201);

        const task = await Task.findOne({_id: response.body._id, owner: existingUser._id});
        expect(task.description).toBe("Task without 'completed'");
        expect(task.completed).toBe(false);
    });

    test('Should not create task for unauthorized user', async () => {
        request(app)
        .post('/task')
        .send({
            description: "Task without 'completed'"
        })
        .expect(401);
    });

    test('Should not create task missing required fields', async () => {
        request(app)
        .post('/task')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            completed: true
        })
        .expect(401);
    });
});

describe('List tasks', () => {
    test('Should list only tasks owned by user', async () => {
        const response = await request(app)
        .get('/task')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .expect(200);

        expect(response.body.length).toBe(2);
        expect(response.body[0]._id).toEqual(existingTask1._id.toString());
        expect(response.body[1]._id).toEqual(existingTask2._id.toString());
    });
});

describe('Delete task', () => {
    test('Should delete task', async () => {
        await request(app)
        .delete('/task/' + existingTask1._id.toString())
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200);

        const task = await Task.findById(existingTask1._id);
        expect(task).toBeNull();
    });

    test('Should not delete a task owned by another user', async () => {
        await request(app)
        .delete('/task/' + existingTask3._id.toString())
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(404);
    });

    test('Should not delete a task when unauthenticated', async () => {
        await request(app)
        .delete('/task/' + existingTask3._id.toString())
        .send()
        .expect(401);
    });
});