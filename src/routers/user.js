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
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch(e) {
        console.error(e);
        res.status(400).send({error: 'Failed to create user.'});
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
        console.error(e);
        res.status(400).send({error: 'Unable to login.'});
    }

});

// user logout
router.post('/user/logout', auth, async (req, res) => {
    try{
        const{user} = req;
        user.tokens = user.tokens.filter((token) => token !== req.token);
        await user.save();
        res.send({message: 'Logout successful.'});
    } catch(e){
        console.error(e);
        res.status(400).send();
    }
});

// user logout from sessions
router.post('/user/logoutAll', auth, async (req, res) => {
    try{
        const{user} = req;
        user.tokens = [];
        await user.save();
        res.send({message: 'Logout successful.'});
    } catch(e){
        console.error(e);
        res.status(400).send()
    }
});

// show user profile
router.get('/user/me', auth, async (req, res) => {
    res.send(req.user);
});

// update user
router.patch('/user/me', auth, async (req, res) => {
    const fieldsToUpdate = Object.keys(req.body);
    const invalidFields = utils.getInvalidFields(fieldsToUpdate, User);

    if(invalidFields.length > 0){
        return res.status(400).send({error: 'Invalid fields.', fields: invalidFields})
    }

    try {
        const {user} = req;
        fieldsToUpdate.forEach((field) => user[field] = req.body[field]);
        await user.save();
        res.send(user);

    } catch(e) {
        console.error(e);
        res.status(400).send(e);
    }
});

// delete user
router.delete('/user/me', auth, async (req, res) => {

    try {
        await User.findByIdAndDelete(req.user.id);
        res.send(req.user);
    } catch(e){
        console.error(e);
        res.status(500).send({error: "Error deleting user."});
    }
});


module.exports = router;