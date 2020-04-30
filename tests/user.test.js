const request = require('supertest');

const app = require('src/app');
const {existingUser, unregisteredUser, validUser, setupDatabase, wipeDatabase} = require('tests/fixtures/db');
const User = require('src/model/user');
const Task = require('src/model/task');



beforeEach(setupDatabase);
afterAll(wipeDatabase);

describe('User sign up', () => {
    test('Should sign up a new user', async () => {
        const response = await request(app)
        .post('/user')
        .send(
            validUser
        ).expect(201);

        // Assert that the database was changed correctly
        const retrievedUser = await User.findById(response.body.user._id);
        expect(retrievedUser).not.toBeNull();

        // Note: toMatchObject() only tests for the given properties. It will ignore
        // any other extra properties.
        // Assertions about the response
        expect(response.body).toMatchObject({
            user: {
                name: validUser.name,
                email: validUser.email
            },
            token: retrievedUser.tokens[0].token
        });

        // Assert password was not stored as plain text
        expect(retrievedUser.password).not.toBe(validUser.password);
    });

    test('Should fail to sign up with an e-mail already in use', async () => {
        await request(app)
        .post('/user')
        .send(
            existingUser
        ).expect(400);
    });

    test('Should fail to sign up with a weak password', async () => {
        await request(app)
        .post('/user')
        .send({
            user: unregisteredUser.email,
            password: 'password'
        }).expect(400);
    });
});

describe('User log in', () => {
    test('Should log in an existing user', async () => {
        const response = await request(app)
        .post('/user/login')
        .send({
            email: existingUser.email,
            password: existingUser.password
        }).expect(200);

        const retrievedUser = await User.findById(existingUser._id);

        // Assert if token received on login response was saved on database
        expect(retrievedUser.tokens.map((tokenObj) => tokenObj.token))
            .toEqual(expect.arrayContaining([response.body.token]));
    });

    test('Should fail to log in a non-registered user', async () => {
        await request(app)
        .post('/user/login')
        .send({
            email: unregisteredUser.email,
            password: unregisteredUser.password
        }).expect(400);
    });
});

describe('User profile', () => {
    test('Should get user profile', async () => {
        await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200);
    });

    test('Should not get profile for unauthenticated user', async () => {
        await request(app)
        .get('/user/me')
        .send()
        .expect(401);
    });
});

describe('User deletion', () => {
    test('Should delete user account', async () => {
        await request(app)
        .delete('/user/me')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send()
        .expect(200);

        // Assert user has been deleted, along with its tasks
        const retrievedUser = await User.findById(existingUser._id);
        expect(retrievedUser).toBeNull();

        const retrievedTasks = await Task.find({owner: existingUser._id});
        expect(retrievedTasks).toEqual([]);
    });

    test('Should not delete for unauthenticated user', async () => {
        await request(app)
        .delete('/user/me')
        .send()
        .expect(401);
    });
});

describe('User profile picture upload', () => {
    test('Should upload profile picture', async () => {
        await request(app)
        .post('/user/me/avatar')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

        // Assert user has been deleted, along with its tasks
        const retrievedUser = await User.findById(existingUser._id);
        expect(retrievedUser.avatar).toEqual(expect.any(Buffer));
    });

    test('Should not files from unauthorized user', async () => {
        await request(app)
        .post('/user/me/avatar')
        .attach('avatar', 'tests/fixtures/fall.jpg')
        .expect(401);
    });

    test('Should not upload unsuported extensions', async () => {
        await request(app)
        .post('/user/me/avatar')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/sample-pdf-file.pdf')
        .expect(400);
    });

    test('Should not upload large files', async () => {
        await request(app)
        .post('/user/me/avatar')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/fall.jpg')
        .expect(400);
    });
});

describe('User update', () => {
    test('Should update valid user fields', async () => {
        await request(app)
        .patch('/user/me/')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            name: 'AnotherName',
            email: 'another@email.com',
            age: 2
        })
        .expect(200);

        // Assert user has been updated on the database
        const retrievedUser = await User.findById(existingUser._id);
        expect(retrievedUser.name).toBe('AnotherName');
        expect(retrievedUser.email).toBe('another@email.com');
        expect(retrievedUser.age).toBe(2);
    });

    test('Should not update invalid user fields', async () => {
        await request(app)
        .patch('/user/me/')
        .set('Authorization', `Bearer ${existingUser.tokens[0].token}`)
        .send({
            name: 'AnotherName',
            email: 'another@email.com',
            job: 'Software developer'
        })
        .expect(400);
    });

    test('Should not update unauthorized user', async () => {
        await request(app)
        .patch('/user/me/')
        .send({
            name: 'AnotherName',
            email: 'another@email.com',
            age: 2
        })
        .expect(401);
    });
});
