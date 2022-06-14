var groups = require("./groups/groups")
const dotenv = require('dotenv');
const MongoClient = require('mongodb');
var firebaseApp = require("firebase-admin");



start()

function start(){
    console.log('START migration ...')
    dotenv.config()
    FIREBASE_db = initiFirebaseDatabase()
    initMondoDb()
    groups.getGroups(FIREBASE_db)
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
    const client = new MongoClient();
    client.connect(process.env.MONGO_databaseURL, function(err, db){
        if(err) throw err;
        console.log('DATABASE CREATED...')
    });
}
