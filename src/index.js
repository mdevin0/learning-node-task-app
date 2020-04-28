const express = require('express');

require('./db/mongoose'); // this is loading the database connection
const User = require('./model/user');
const Task = require('./model/task');
const utils = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// parse incoming requests to json
app.use(express.json());

// create user
app.post('/user', async (req, res) => {
    const user = new User(req.body);
    try {
        // TODO - should return status 500 if there's an error on connecting with the database
        await user.save();
        res.status(201).send(user);
    } catch(e) {
        res.status(400).send(e);
    }
});

// list users
app.get('/user/', async (req, res) => {
    try {
        const users = await User.find({});
        if(!users){
            return res.status(404).send({error: 'No users found.'});
        }
        res.send(users);

    } catch(e) {
        res.status(500).send(e);
    }
});

// list specific user
app.get('/user/:id', async (req, res) => {
    const{id} = req.params;

    try{
        const user = await User.findById(id);
        if(!user){
            return res.status(404).send({error: 'User not found.', id});
        }
        res.send(user);
    } catch(e){
        res.status(500).send(e);
    }
});

// update user
app.patch('/user/:id', async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, User);

    if(invalidFields.length > 0){
        res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!user){
            return res.status(404).send({error: "User not found.", user: req.params.id});
        }
        res.send(user);

    } catch(e) {
        res.status(400).send(e);
    }
});

// create task
app.post('/task', async (req, res) => {
    const task = new Task(req.body);
    try{
        // TODO - should return status 500 if there's an error on connecting with the database
        await task.save();
        res.status(201).send(task);
    } catch(e){
        res.status(400).send(e);
    }
});


// list tasks
app.get('/task/', async (req, res) => {
    try{
        const tasks = await Task.find({});
        if(!tasks){
            return res.status(404).send({error:'No tasks found'});
        }
        res.send(tasks);
    } catch(e){
        res.status(500).send(e);
    }
});

// list specific task
app.get('/task/:id', async (req, res) => {
    const{id} = req.params;
    try{
        const task = await Task.findById(id);
        if(!task){
            return res.status(404).send({error: 'Task not found', id});
        }
        res.send(task);
    } catch(e){
        res.status(500).send(e);
    }
});


// update Task
app.patch('/task/:id', async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, Task);

    if(invalidFields.length > 0){
        res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!task){
            return res.status(404).send({error: "Task not found.", task: req.params.id});
        }
        res.send(task);

    } catch(e) {
        res.status(400).send(e);
    }
});

app.listen(PORT, () => {
    console.log('*yawns*', `Port: ${PORT}`);
});