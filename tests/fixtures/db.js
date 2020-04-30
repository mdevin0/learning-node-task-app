const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('src/model/user');
const Task = require('src/model/task');

//////////////////// User data ////////////////////

const existingUserId = new mongoose.Types.ObjectId();
const existingUser = {
    _id: existingUserId,
    name: 'ExistingUser',
    email: 'existing@user.com',
    password: 'I am an existing user!',
    tokens: [{
        token: jwt.sign({ _id: existingUserId.toString() }, process.env.JWT_SIGN)
    }]
};

const existingUser2Id = new mongoose.Types.ObjectId();
const existingUser2 = {
    _id: existingUser2Id,
    name: 'ExistingUser2',
    email: 'existing2@user.com',
    password: 'I am an existing user too!',
    tokens: [{
        token: jwt.sign({ _id: existingUser2Id.toString() }, process.env.JWT_SIGN)
    }]
};

const unregisteredUser = {
    name: 'UnregisteredUser',
    email: 'unregistered@user.com',
    password: 'I am not signed up!'
};

const validUser = {
    name: 'ValidUser',
    email: 'valid@user.com',
    password: 'I am a valid user!'
};


//////////////////// Tasks data ////////////////////

const existingTask1Id = new mongoose.Types.ObjectId();
const existingTask1 = {
    _id: existingTask1Id,
    description: 'Task 1',
    completed: true,
    owner: existingUserId
};

const existingTask2Id = new mongoose.Types.ObjectId();
const existingTask2 = {
    _id: existingTask2Id,
    description: 'Task 2',
    completed: false,
    owner: existingUserId
};

const existingTask3Id = new mongoose.Types.ObjectId();
const existingTask3 = {
    _id: existingTask3Id,
    description: 'Task 3',
    completed: true,
    owner: existingUser2Id
};


//////////////////// Functions ////////////////////
setupDatabase = async () => {
    await wipeDatabase();
    await new User(existingUser).save();
    await new User(existingUser2).save();
    await new Task(existingTask1).save();
    await new Task(existingTask2).save();
    await new Task(existingTask3).save();
};

wipeDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
}

module.exports = {
    existingUserId,
    existingUser,
    existingUser2Id,
    existingUser2,
    unregisteredUser,
    existingTask1Id,
    existingTask1,
    existingTask2Id,
    existingTask2,
    existingTask3Id,
    existingTask3,
    validUser,
    setupDatabase,
    wipeDatabase
}