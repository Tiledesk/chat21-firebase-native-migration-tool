const groups = require("./groups/groups")
const users = require('./users/users')
const dotenv = require('dotenv');
const fs = require('fs');
const moment = require('moment')
var firebaseApp = require("firebase-admin");
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
const { MongoClient, ServerApiVersion } = require('mongodb');


start()

async function start(){
    var startTime = moment()
    console.log(`START migration at ${startTime}...`)

    dotenv.config()
    initiFirebaseDatabase().then((firebae_db)=> {
        module.exports.FIREBASE_db =  firebae_db
        return firebae_db
    })
    .then(()=> {
        return initMondoDb()
    })
    .then(()=> {
        return laodJsonLogger()
    })
    .then(()=>{
        createCollection('groups')
        createCollection('conversations')
        createCollection('archived_conversations')
        createCollection('messages')
        createCollection('instances')
        return
    })
    .then(()=> {
        return groups.getGroups().then(()=> {
            return groups.saveToMongo()
        })
    })
    .then(()=>{
        return users.getUser()
    })
    .then(()=>{
        var endTime = moment()
        var timeDifference = endTime.diff(startTime, 'seconds')
        console.log(`FINISCHED migration at ${endTime}...`)
        console.log(`--------> duration Time: ${secondsToDhms(timeDifference)}...`)
        return timeDifference
    })
    .catch((error)=> {
        console.error('ERROR EVENT OCCURRED-->', error)
    })

      // MONGO_db = initMondoDb().then((client)=>{
    //     createCollection('groups')
    //     createCollection('conversations')
    //     createCollection('archived_conversations')
    //     createCollection('messages')
    //     createCollection('instances')
    // })

}


function initiFirebaseDatabase(){

    return new Promise((resolve, reject) => {

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
        
        var con = false;
        var connectedRef = db.ref(".info/connected");
        connectedRef.on("value", function (snap) {
            if (snap.val() === true) {
                con = true;
                resolve(db)
            } else {
                con = false;
            }
        })
        
    })

}


async function initMondoDb(){
    // const uri = process.env.MONGO_databaseURL;
    const uri = 'mongodb://127.0.0.1:27017'
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


async function createCollection(name){
    await global.mongoDB.createCollection(name, function(err, res) {
        if (err) {
            return console.log(`Collection ${name} already exist...`)
        }else{
            return console.log(`Collection ${name} created...`);
        }
    });
}


function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
}


async function laodJsonLogger(){
    global.jsonLoggerFile = process.env.LOG_NAME
    if (!fs.existsSync(global.jsonLoggerFile)) 
        fs.writeFileSync(global.jsonLoggerFile);
    return 
}

// Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
// export NODE_OPTIONS="--max-old-space-size=5120"
