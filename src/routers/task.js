const express = require('express');
const Task = require('../model/task');
const utils = require('../utils');

const router = new express.Router();


// create task
router.post('/task', async (req, res) => {
    const task = new Task(req.body);
    try{
        // TODO - should return status 500 if there's an error on connecting with the database
        await task.save();
        res.status(201).send(task);
    } catch(e){
        console.error(e);
        res.status(400).send(e);
    }
});


// list tasks
router.get('/task/', async (req, res) => {
    try{
        const tasks = await Task.find({});
        if(!tasks){
            return res.status(404).send({error:'No tasks found'});
        }
        res.send(tasks);
    } catch(e){
        console.error(e);
        res.status(500).send(e);
    }
});

// list specific task
router.get('/task/:id', async (req, res) => {
    const{id} = req.params;
    try{
        const task = await Task.findById(id);
        if(!task){
            return res.status(404).send({error: 'Task not found', id});
        }
        res.send(task);
    } catch(e){
        console.error(e);
        res.status(500).send({error: 'Internal server error.'});
    }
});


// update Task
router.patch('/task/:id', async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, Task);

    if(invalidFields.length > 0){
        return res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        const task = await Task.findById(req.params.id);
        fieldsToUpdate.forEach((field) => task[field] = req.body[field]);
        await task.save();

        if(!task){
            return res.status(404).send({error: "Task not found.", task: req.params.id});
        }
        res.send(task);

    } catch(e) {
        console.error(e);
        res.status(400).send(e);
    }
});

// delete task
router.delete('/task/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const task = await Task.findByIdAndDelete(id);
        if(!task){
            return res.status(404).send({error: 'Task not found.'});
        }
        res.send(task);
    } catch(e){
        console.error(e);
        res.status(500).send({error: 'Error deleting task.'});
    }
});

module.exports = router;