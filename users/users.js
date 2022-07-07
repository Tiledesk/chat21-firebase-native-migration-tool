
const db = require('./../index')
const conversations = require('../conversations/conversations')
const archived_conversations = require('../conversations/archived_conversations')
const messages = require('../messages/messages.js')
const instances = require('../instances/instances.js')
var ref;
var lastKnownKey=''

async function getUser(){
    console.log('USERS FIREBASE NODE INIT ...')
    const users_ref = '/apps/'+ process.env.TENANT  +'/users/'
    ref = db.FIREBASE_db.ref(users_ref);
    let complete = false;
    let STEP= 1
    let index = 0
    // index!==3
    while (!complete) {
        index = index+1
        let currentUser= null
        await getSingleUser(STEP).then((data)=> {
            currentUser = data
            if (data.length === STEP || data.length) {
                console.log('\n\nRETRIVED user with id-->', data[0].uid)
                return currentUser
            } else {
                complete = true;
            }
        })
        .then((currentUser)=> {
            if(!complete){
                console.log('CONVERSATIONS for user', currentUser[0].uid)
                return getConversations(db.FIREBASE_db, currentUser)
            }
        })
        .then(()=> {
            if(!complete){
                console.log('ARCHIVED CONVERSATIONS for user', currentUser[0].uid)
                return getArchivedConversations(db.FIREBASE_db, currentUser)
            }
        })
        .then(()=> {
            if(!complete){
                console.log('MESSAGES for user', currentUser[0].uid)
                return getMessages(db.FIREBASE_db, currentUser)
            }
        })
        .then(()=> {
            if(!complete){
                console.log('INSTANCES for user', currentUser[0].uid)
                return getInstances(db.FIREBASE_db, currentUser)
            }
        })
        .catch((err)=> {
            console.log(err)
            complete = true
        })
    }
}

function getSingleUser(STEP){
    return new Promise((resolve, reject)=> {
        let array = []
        if(STEP > 0){
            if(lastKnownKey == ''){
                ref.orderByKey().limitToFirst(STEP).get().then(snaps => {
                    for(key in snaps.val()){
                        let user = snaps.val()[key]
                        user.uid = key
                        array.push(user)
                        lastKnownKey = key;
                    }
                    resolve(array)
                })
            } else { 
                ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                    for(key in snaps.val()){
                        let user = snaps.val()[key]
                        user.uid = key
                        array.push(user)
                        lastKnownKey = key;
                    }
                    resolve(array)
                });
                
            }
        }else{
            reject('ERROR --> STEP MUST BE > O', STEP)
        }
    })
}

async function getConversations(db, data){
    return conversations.getConversationsForUserId(db, data[0].uid).then((convs)=> {
        console.log(`RETRIEVED ${convs.length} conversations from user --> `, data[0].uid)
        return convs
    }).then((convs)=>{
        console.log(`SAVE ${convs.length} conversations from user ${data[0].uid} to 'conversations' collection on MONGODB`)
        return conversations.saveToMongo(convs)
    }).catch(err => {
        console.log(`ERROR occurred while getConversations for user ${data[0].uid} : ${err}`)
    })
}

async function getArchivedConversations(db, data){
    return archived_conversations.getConversationsForUserId(db, data[0].uid).then((convs)=> {
        console.log(`RETRIEVED ${convs.length} archived conversations from user --> `, data[0].uid)
        return convs
    }).then((convs)=>{
        console.log(`SAVE ${convs.length} archived conversations from user ${data[0].uid} to 'archived_conversations' collection on MONGODB`)
        return archived_conversations.saveToMongo(convs)
    }).catch(err => {
        console.log(`ERROR occurred while getArchivedConversations for user ${data[0].uid} : ${err}`)
    })
}

async function getMessages(db, data){
    return messages.getMessagesForUserId(db, data[0].uid).then((messages)=> {
        console.log(`RETRIEVED ${messages.length} messages from user --> `, data[0].uid)
        return messages
    }).then((messagesArray)=>{
        console.log(`SAVE ${messagesArray.length} messages from user ${data[0].uid} to 'messages' collection on MONGODB`)
        return messages.saveToMongo(messagesArray)
    }).catch(err => {
        console.log(`ERROR occurred while getMessages for user ${data[0].uid} : ${err}`)
    })
}


async function getInstances(db, data){
    return instances.getInstancesForUserId(db, data[0].uid).then((instances)=> {
        console.log(`RETRIEVED ${instances.length} instances from user --> `, data[0].uid)
        return instances
    }).then((instancesArray)=>{
        console.log(`SAVE ${instancesArray.length} instances from user ${data[0].uid} to 'instances' collection on MONGODB`)
        return instances.saveToMongo(instancesArray)
    }).catch(err => {
        console.log(`ERROR occurred while getInstances for user ${data[0].uid} : ${err}`)
    })
}


function writeJsonLogger(jsonContent){
    fs.writeFile(global.jsonLoggerFile, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    }); 
}


module.exports = { getUser }