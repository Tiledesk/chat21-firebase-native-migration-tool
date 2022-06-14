
var ref;
var lastKnownKey='';
global.testVar = "ciao"

async function getGroups(db){
    console.log('GROUPS FIREBASE NODE INIT ...')
    const groups_ref = '/apps/'+ process.env.TENANT  +'/groups/'
    ref = db.ref(groups_ref);
    let complete = false;
    let STEP= 2, arrayElements = []
    let index = 0
    // loadData(STEP)
    while (index !==2) {
        index = index+1
        console.log('indexxxx',index, global.testVar )
        await getElements(STEP).then((data)=> {
            arrayElements.push(...data)
            console.log('dataaaaaaaaaaaaaaaaaaaaa', arrayElements)
            if (data.length === STEP) {
                STEP +=2
            } else {
                complete = true;
            }
        }).catch((err)=> {
            console.log(err)
            complete = true
        })
    }

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



async function getElementsFromInterval(STEP){
    let array = []
    if(STEP > 0){
        if(lastKnownKey !== ''){
            console.log('FIRST CALL TO DATABASE ... ', lastKnownKey)
            await ref.orderByKey().limitToLast(STEP).get().then(snaps => {
                for(key in snaps.val()){
                    console.log('data key::', key, snaps.val()[key])
                    let group = snaps.val()[key]
                    group.timelineOf = key
                    array.push(group)
                    lastKnownKey = key;
                    
                }
            })
            console.log('arrayyyy', array)
        } else { 
            console.log('Nth CALL TO DATABASE ... ', lastKnownKey)
            await ref.orderByKey().startAt(lastKnownKey).limitToFirst(STEP).get().then(snaps => {
                for(key in snaps.val()){
                    let currentElement = snaps[key]
                    currentElement.timelineOf = key
                    array.push(currentElement)
                    console.log('data key::', key)
                    lastKnownKey = key;
                }
            });
        }
    }else{
        console.error('ERROR --> STEP MUST BE > O', STEP)
    }
    return array

}

module.exports = { getGroups };