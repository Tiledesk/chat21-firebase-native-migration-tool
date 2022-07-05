var ref;
var lastKnownKey='';

async function getConversationsForUserId(db, uid){
    var arrayElements = [];
    lastKnownKey=''
    // console.log('ARCHIVED CONVERSATIONS FIREBASE NODE INIT ...', uid, lastKnownKey)
    const conversations_uid = '/apps/'+ process.env.TENANT  +'/users/'+uid +'/archived_conversations'
    ref = db.ref(conversations_uid);
    let complete = false;
    let STEP= 20
    let index = 0
    // index!==3
    while (!complete) {
        index = index+1
        await getElements(STEP, uid).then((data)=> {
            arrayElements.push(...data)
            if (data.length === STEP || data.length) {
                STEP = 20
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
                    ref.orderByKey().limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            let conversation = generateGroupElementForMongo(snaps.val()[key], key, userId)
                            array.push(conversation)
                            lastKnownKey = key;
                            
                        }
                        resolve(array)
                    })
                } else { 
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            let conversation = generateGroupElementForMongo(snaps.val()[key], key, userId)
                            array.push(conversation)
                            lastKnownKey = key;
                        }
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

async function saveToMongo(convs){
    const db = global.mongoDB.collection('conversations')
    
    return new Promise((resolve, reject) => {
        let count=1
        if(convs && convs.length > 0){
            convs.forEach(conv =>{
                // console.log('Conversation id::', conv.key)
                db.insertOne(conv, {upsert: true, multi: true}, function(err, res) {
                    if (err) throw err;
                    
                    if(count === convs.length){
                        console.log("Number of documents inserted: ", convs.length);
                        resolve('ok')
                    }else{
                        count= count + 1
                    }
                });
            })
        }else {
            resolve('ok')
        }
    })
}

function generateGroupElementForMongo(conversation, key, userId){
    conversation.key = key
    conversation.timelineOf = userId
    conversation.app_id= process.env.TENANT
    conversation.archived = true

    return conversation
}


module.exports = { getConversationsForUserId , saveToMongo};