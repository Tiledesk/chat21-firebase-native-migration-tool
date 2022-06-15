
var ref;
var lastKnownKey='';
var arrayElements = [];


async function getGroups(db){
    console.log('GROUPS FIREBASE NODE INIT ...')
    const groups_ref = '/apps/'+ process.env.TENANT  +'/groups/'
    ref = db.ref(groups_ref);
    let complete = false;
    let STEP= 2
    let index = 0
    // loadData(STEP)
    while (index !==2) {
        index = index+1
        await getElements(STEP).then((data)=> {
            arrayElements.push(...data)
            if (data.length === STEP || data.length) {
                STEP +=2
            } else {
                complete = true;
            }
        }).catch((err)=> {
            console.log(err)
            complete = true
        })
    }
    console.log('DATA FROM FIREBASE-->', arrayElements.length)

}


function getElements(STEP){
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
                            let group = snaps.val()[key]
                            group.timelineOf = key
                            array.push(group)
                            lastKnownKey = key;
                            
                        }
                        console.log('lastKnownKey', lastKnownKey)
                        resolve(array)
                    })
                } else { 
                    console.log('Nth CALL TO DATABASE ... ', lastKnownKey, STEP)
                    ref.orderByKey().startAfter(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                        for(key in snaps.val()){
                            let group = snaps.val()[key]
                            console.log('data key::', key)
                            group.timelineOf = key
                            array.push(group)
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


async function saveToMongo(){
    const db = global.mongoDB.collection('groups')
    db.insertMany(arrayElements, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
    });
}


module.exports = { getGroups , saveToMongo};