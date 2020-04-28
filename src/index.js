const utils = require('./utils');
utils.validateEnvironmentVariables();


const express = require('express');

require('./db/mongoose'); // this is loading the database connection
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const PORT = process.env.PORT || 3000;

// app.use((req, res, next) => {
//     if(process.env.UNDER_MAINTENANCE === 'true'){
//         return res.status(503).send('Service is under maintenance. Please try again later.');
//     }

//     next();
// });

// parse incoming requests to json
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);


app.listen(PORT, () => {
    console.log('*yawns*', `Port: ${PORT}`);
});