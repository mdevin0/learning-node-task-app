const {MongoClient, ObjectID} = require('mongodb');


// It seems using localhost instead of the loopback address causes some performance issues.
const connectionURL = 'mongodb://127.0.0.1:27017';
const database = 'task-manager';


MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if(error){
        console.error(error);
        return console.log('Failed to connect with database.');
    }

    console.log('Successfully connected with database.');
    const db = client.db(database);

    // db.collection('users').insertOne({
    //     name: "Someone",
    //     age: 25
    // }, (error, result) => {
    //     if(error){
    //         return console.error(error);
    //     }
    //     console.log("User saved successfully.", res.ops);
    // });

    // db.collection('tasks').insertMany([
    //     {
    //         description: "Finish Node.js course",
    //         completed: false
    //     },
    //     {
    //         description: "Security 101",
    //         completed: false
    //     },
    //     {
    //         description: "Express 101",
    //         completed: true
    //     }
    // ], (error, result) => {
    //     if(error){
    //         return console.error(error);
    //     }

    //     console.log("Tasks inserted successfully.", result.ops);
    // });

    db.collection('tasks').findOne({_id: ObjectID('5ea6f0a63c95492bb8ab438d')}, (error, task) => {
        if(error){
            return console.log(console.error);
        }

        console.log("Task found:", task);
    });

    db.collection('tasks').find({completed: false}).toArray((error, tasks) => {
        console.log(`${tasks.length} unfinished tasks found:`);
        console.log(tasks.map((task) => task.description).join('\n'));
    });
});