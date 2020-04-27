const mongodb = require('mongodb');


const MongoClient = mongodb.MongoClient;
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

    db.collection('users').insertOne({
        name: "Someone",
        age: 25
    });

});