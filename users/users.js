
const conversations = require('../conversations/conversations')

var ref;
var lastKnownKey='';

async function getUser(db){
    console.log('CONVERSARIONS FIREBASE NODE INIT ...')
    const users_ref = '/apps/'+ process.env.TENANT  +'/users/'
    ref = db.ref(users_ref);
    let complete = false;
    let STEP= 1
    let index = 0
    // loadData(STEP)
    while (index !==2) {
        index = index+1
        await getSingleUser(STEP).then((data)=> {
            if (data.length === STEP || data.length) {
                console.log('RETRIVED user with id-->', data[0].uid)
                conversations.getConversationsForUserId(db, data[0].uid).then((convs)=> {
                    console.log('convs for userrrr', convs)
                    conversations.saveToMongo(convs)
                })
            } else {
                complete = true;
            }
        }).catch((err)=> {
            console.log(err)
            complete = true
        })
    }
}

function getSingleUser(STEP){
    return new Promise((resolve, reject)=> {
        let array = []
        // async function execute(){
            if(STEP > 0){
                console.log('lasttttt', lastKnownKey)
                if(lastKnownKey == ''){
                    console.log('FIRST CALL TO DATABASE ... ', lastKnownKey)
                    ref.orderByKey().limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            console.log('data key::', key)
                            let user = snaps.val()[key]
                            user.uid = key
                            array.push(user)
                            lastKnownKey = key;
                            
                        }
                        console.log('lastKnownKey', lastKnownKey)
                        resolve(array)
                    })
                } else { 
                    console.log('Nth CALL TO DATABASE ... ', lastKnownKey, STEP)
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            console.log('data key::', key)
                            let user = snaps.val()[key]
                            user.uid = key
                            array.push(user)
                            lastKnownKey = key;
                        }
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

module.exports = { getUser }