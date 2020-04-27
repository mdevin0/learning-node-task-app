const mongoose = require('mongoose');
const validator = require('validator');

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 100,
        validate(value){
            if(value.toLowerCase().includes('password')){
               throw new Error("Password cannot contain 'password'.");
            }
        }

    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 50,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error(`E-mail '${value}' is invalid`);
            }
        }

    },
    age: {
        type: Number,
        validate(value){
            if(value < 0){
                throw new Error('Age is invalid')
            }
        }
    }
});

module.exports = User;