const express = require('express');

require('./db/mongoose'); // this is loading the database connection
const User = require('./model/user');
const Task = require('./model/task');

const app = express();
const PORT = process.env.PORT || 3000;

// parse incoming requests to json
app.use(express.json());

// create user
app.post('/user', (req, res) => {
    const user = new User(req.body);
    user.save().then(() => {
        res.status(201).send(user);
    }).catch((error) => {
        res.status(400).send(error);
    });
});

// list users
app.get('/user/', (req, res) => {
    const{id} = req.params;
    User.find({}).then((users) => {
        if(!users){
            return res.status(404).send({error:`User not found`});
        }
        res.send(users);
    }).then((error) => {
        res.status(500).send(error);
    })
});

// list specific user
app.get('/user/:id', (req, res) => {
    const{id} = req.params;
    User.findById(id).then((user) => {
        if(!user){
            return res.status(404).send({error:`User not found`, id});
        }
        res.send(user);
    }).then((error) => {
        res.status(500).send(error);
    })
});

// create task
app.post('/task', (req, res) => {
    const task = new Task(req.body);
    task.save().then(() => {
        res.status(201).send(task);
    }).catch((error) => {
        res.status(400).send(error);
    });
});


// list users
app.get('/task/', (req, res) => {
    const{id} = req.params;
    Task.find({}).then((tasks) => {
        if(!tasks){
            return res.status(404).send({error:`Task not found`});
        }
        res.send(tasks);
    }).then((error) => {
        res.status(500).send(error);
    })
});

// list specific user
app.get('/task/:id', (req, res) => {
    const{id} = req.params;
    Task.findById(id).then((task) => {
        if(!task){
            return res.status(404).send({error:`Task not found`, id});
        }
        res.send(task);
    }).then((error) => {
        res.status(500).send(error);
    })
});

app.listen(PORT, () => {
    console.log('*yawns*', `Port: ${PORT}`);
});