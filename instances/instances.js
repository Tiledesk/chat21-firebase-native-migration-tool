var ref;
var lastKnownKey='';

async function getInstancesForUserId(db, uid){ 
    var arrayElements = [];
    lastKnownKey=''
    console.log('INSTANCES FIREBASE NODE INIT ...', uid, lastKnownKey)
    const instances_uid = '/apps/'+ process.env.TENANT  +'/users/'+uid +'/instances'
    ref = db.ref(instances_uid);
    let complete = false;
    let STEP= 2
    let index = 0
    // index!==3
    while (!complete) {
        index = index+1
        await getElements(STEP, uid).then((data)=> {
            arrayElements.push(...data)
            if (data.length === STEP || data.length) {
                STEP = 2
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
                            let instance = generateGroupElementForMongo(snaps.val()[key], key, userId)
                            array.push(instance)
                            lastKnownKey = key;
                            
                        }
                        resolve(array)
                    })
                } else {
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            let instance = generateGroupElementForMongo(snaps.val()[key], key, userId)
                            array.push(instance)
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

async function saveToMongo(instances){
    const db = global.mongoDB.collection('instances')

    return new Promise((resolve, reject) => {
        let count=1
        if(instances && instances.length > 0){
            instances.forEach(instance =>{
                db.insertOne(instance, {upsert: true, multi: true}, function(err, res) {
                    if (err) throw err;
                    
                    if(count === instances.length){
                        console.log("(INSTANCES) Number of documents inserted: ", instances.length);
                        resolve('ok')
                    }else{
                        count= count + 1
                    }
                });
            })
        }else{
            resolve('ok')
        }
    })
}

function generateGroupElementForMongo(instance, key, userId){
    instance.instance_id = key
    instance.app_id= process.env.TENANT
    instance.user_id = userId

    return instance
}


module.exports = { getInstancesForUserId , saveToMongo};