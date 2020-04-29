const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

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
        await req.user.remove();
        res.send(req.user);
    } catch(e){
        console.error(e);
        res.status(500).send({error: "Error deleting user."});
    }
});

// user file upload
const upload = multer({
    limits: {
        fileSize: 1000000 // 1MB
    },
    fileFilter(req, file, callback){
        if(!file.originalname.toLowerCase().match(/[.](jpe?g|png)$/)){
            return callback(new Error('Only .jpg, .jpeg, and .png extensions are supported.'));
        }

        callback(undefined, true);
    }
});
router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send({message: 'File uploaded successfully.'});

}, (error, req, res, next) => { // It's important for the function to have this signature
    res.status(400).send({error: error.message});
});

// delete user avatar
router.delete('/user/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send({message: 'File deleted successfully.'});

}, (error, req, res, next) => { // It's important for the function to have this signature
    res.status(400).send({error: error.message});
});

// serve avatar
router.get('/user/:_id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params._id);
        if(!user || !user.avatar){
            throw new Error('Profile not found.');
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch(e) {
        res.status(404).send({error: e.message});
    }

}, (error, req, res, next) => { // It's important for the function to have this signature
    res.status(404).send({error: error.message});
});


module.exports = router;