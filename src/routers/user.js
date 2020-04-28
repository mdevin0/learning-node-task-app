const express = require('express');

const User = require('../model/user');
const utils = require('../utils');
const auth = require('../middleware/auth');

const router = new express.Router();

// create user
router.post('/user', async (req, res) => {
    const user = new User(req.body);
    try {
        // TODO - should return status 500 if there's an error on connecting with the database
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch(e) {
        res.status(400).send(e);
    }
});

// show user profile
router.get('/user/me', auth, async (req, res) => {
    res.send(req.user);
});

// list specific user
router.get('/user/:id', auth, async (req, res) => {
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
router.patch('/user/:id', auth, async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, User);

    if(invalidFields.length > 0){
        return res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        const user = await User.findById(req.params.id);
        fieldsToUpdate.forEach((field) => user[field] = req.body[field]);
        await user.save();

        if(!user){
            return res.status(404).send({error: "User not found.", user: req.params.id});
        }
        res.send(user);

    } catch(e) {
        res.status(400).send(e);
    }
});

// delete user
router.delete('/user/:id', auth, async (req, res) => {
    const {id} = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if(!user){
            return res.status(404).send({error: 'User not found.'});
        }
        res.send(user);
    } catch(e){
        res.status(500).send(e);
    }
});

// user login
router.post('/user/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch(e){
        res.status(400).send(e);
    }

});

module.exports = router;