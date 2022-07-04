var ref;
var lastKnownKey='';

async function getMessagesForUserId(db, uid){
    var arrayElements = [];
    lastKnownKey=''
    console.log('MESSAGES FIREBASE NODE INIT ...')
    const conversations_uid = '/apps/'+ process.env.TENANT  +'/users/'+uid +'/messages/'
    ref = db.ref(conversations_uid);
    let complete = false;
    let STEP= 20
    let index = 0
    // loadData(STEP)
    while (!complete) {
        index = index+1
        await getElements(STEP, uid).then((data)=> {
            arrayElements.push(...data)
            if (data.length === STEP || data.length) {
                STEP =20
            } else {
                complete = true;
            }
        }).catch((err)=> {
            console.log(err)
            complete = true
        })
    }
    return arrayElements
}



function getElements(STEP, userId){
    return new Promise((resolve, reject)=> {
        let array = []
        // async function execute(){
            if(STEP > 0){
                if(lastKnownKey == ''){
                    // console.log('FIRST CALL TO DATABASE ... ', lastKnownKey)
                    ref.orderByKey().limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            // console.log('data conversation key::', key)
                            let conversation = snaps.val()[key]
                            Object.keys(conversation).forEach((messageID)=> {
                                let message = generateGroupElementForMongo(conversation[messageID], messageID, key, userId)
                                array.push(message)
                                
                            })
                        }
                        lastKnownKey = key;
                        console.log('lastKnownKey', lastKnownKey)
                        resolve(array)
                    })
                } else { 
                    // console.log('Nth CALL TO DATABASE ... ', lastKnownKey, STEP)
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            // console.log('data conversation key::', key)
                            let conversation = snaps.val()[key]
                            Object.keys(conversation).forEach((messageID)=> {
                                let message = generateGroupElementForMongo(conversation[messageID], messageID, key , userId)
                                array.push(message)
                            })
                        }
                        lastKnownKey = key;
                        console.log('lastKnownKey', lastKnownKey)
                        resolve(array)
                    });
                    
                }
            }else{
                reject('ERROR --> STEP MUST BE > O', STEP)
            }
        // }
        // execute()
    })
}

async function saveToMongo(messages){
    const db = global.mongoDB.collection('messages')
    return new Promise((resolve, reject) => {
        if(messages && messages.length > 0){
            db.insertMany(messages, function(err, res) {
                if (err) throw err;
                if(res) {
                    console.log("Number of documents inserted: ",res.insertedCount);
                    resolve('ok')
                }
                
            });
        }else {
            resolve('ok')
        }
    })
}

function generateGroupElementForMongo(message, key, key_conv, userId){
    message.message_id = key
    message.timelineOf = userId
    message.app_id= process.env.TENANT
    message.conversWith = key_conv

    return message
}


module.exports = { getMessagesForUserId , saveToMongo};