const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../model/task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
        validate(value){
            if(!validator.isAlphanumeric(value)){
               throw new Error("User name can only contain letters and numbers");
            }
        }

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
        unique: true,
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
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

// Sets up the relation to find tasks from User object
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function(){
    const user = this;
    const userData = user.toObject();

    delete userData.password;
    delete userData.tokens;

    return userData;

}

// Instance method
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({_id: user._id.toString() }, process.env.JWT_SIGN, 
            { expiresIn: process.env.JWT_TTL });
    user.tokens.push({token});
    await user.save();

    return token;
};


// Static method
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if(!user)
        throw new Error('Invalid credentials.');

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Invalid credentials.');
    }

    return user;
};

/*
    This is is a so-called MonboDB middleware. It runs before create/update events.
    You cannot user Mongoose's findByIdAndUpdate() method as it bypasses MongoDB
    middlewares.
*/
userSchema.pre('save', async function(next) {
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, parseInt(process.env.BCRYPT_ROUNDS));
    }
    next(); // gotta call next to finish the function execution, or hang forever
});


userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id });
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;