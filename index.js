const groups = require("./groups/groups")
const users = require('./users/users')
const dotenv = require('dotenv');
var firebaseApp = require("firebase-admin");
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const { MongoClient, ServerApiVersion } = require('mongodb');


start()

function start(){
    console.log('START migration ...')
    dotenv.config()
    FIREBASE_db = initiFirebaseDatabase()
    MONGO_db = initMondoDb().then((client)=>{
        console.log('connected', client)
    })
    // .then(()=> {
    //     createCollection('groups')
    //     console.log(`Collection GROUPS created ...`)
    // }).then(()=> {
    //     groups.getGroups(FIREBASE_db).then(()=> {
    //         groups.saveToMongo()
    //     }) 
    // })
    .then(()=> {
        createCollection('conversations')
        console.log(`Collection CONVERSATIONS created ...`)
    })
    .then(()=>{
        users.getUser(FIREBASE_db)
    })
    // groups.getGroups(FIREBASE_db).then(()=> {
    //     console.log('save to mongoooo')
    //     // groups.saveToMongo()
    // })
}


function initiFirebaseDatabase(){
    // Fetch the service account key JSON file contents
    var serviceAccount = require("./serviceAccountKey.json");
    console.log('INITIALIZE Firebase database connection to url: ', process.env.FIREBASE_databaseURL)
    // Initialize the app with a service account, granting admin privileges
    firebaseApp.initializeApp({
        credential: firebaseApp.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_databaseURL
    });

    // As an admin, the app has access to read and write all data, regardless of Security Rules
    var db = firebaseApp.database();
    return db
}


async function initMondoDb(){
    const uri = process.env.MONGO_databaseURL;
    console.log('INITIALIZE MONGO database connection to url: ', uri)
    const client = new MongoClient(uri);

    // const uri ="mongodb://localhost:27017"
    // const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    // MongoClient.connect(uri, function(err, db) {
    //     if (err) throw err;
    //     global.mongoDB = db.db("migration");
    // });
 
    try {
        // Connect to the MongoDB cluster
        await client.connect().then(()=> {
            console.log('MONGO DB CONNECTED ...')
        });

    } catch (e) {
        console.error(e);
    } finally {
        //Public db to global
        return global.mongoDB =  client.db("migration")
    }
}


function createCollection(name){
    global.mongoDB.createCollection(name, function(err, res) {
        if (err) {
            console.log(`Collection ${name} already exist...`)
        }else{
            console.log("Collection created!");
        }
    });
}
