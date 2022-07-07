
const db = require('./../index')
var ref;
var lastKnownKey='';
var arrayElements = [];


async function getGroups(){
    console.log('GROUPS FIREBASE NODE INIT ...')
    const groups_ref = '/apps/'+ process.env.TENANT  +'/groups/'
    ref = db.FIREBASE_db.ref(groups_ref);
    let complete = false;
    let STEP= 20
    let index = 0
    // loadData(STEP)
    while (!complete) {
        index = index+1
        await getElements(STEP).then((data)=> {
            arrayElements.push(...data)
            if (data.length === STEP || data.length) {
                STEP =20
            } else {
                complete = true;
            }
            return data
        })
        .then((data)=> {
            saveToMongo(data)
        })
        .catch((err)=> {
            console.log(err)
            complete = true
        })
    }
    console.log(`(GROUPS) SAVED ${arrayElements.length} DATA FROM FIREBASE\n`, )

}


function getElements(STEP){
    return new Promise((resolve, reject)=> {
        let array = []
        // async function execute(){
            if(STEP > 0){
                if(lastKnownKey == ''){
                    ref.orderByKey().limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            // console.log('data key::', key)
                            let group = generateGroupElementForMongo(snaps.val()[key], key)
                            array.push(group)
                            lastKnownKey = key;
                            
                        }
                        resolve(array)
                    })
                } else { 
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            // console.log('data key::', key)
                            let group = generateGroupElementForMongo(snaps.val()[key], key)
                            array.push(group)
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


async function saveToMongo(groups){
    const db = global.mongoDB.collection('groups')
    if(groups && groups.length > 0){
        db.insertMany(groups, function(err, res) {
            if (err) throw err;
            // console.log("(GROUPS) Number of documents inserted: " + res.insertedCount);
        });
    }
}


function generateGroupElementForMongo(group, key){
    group.uid = key
    group.appid= process.env.TENANT
    group.updatedOn = new Date().getTime()

    return group
}


module.exports = { getGroups , saveToMongo};