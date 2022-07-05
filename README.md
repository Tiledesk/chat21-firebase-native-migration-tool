# TILEDESK FIREBASE-to-MONGO migration module

![](https://user-images.githubusercontent.com/47848430/177296810-df0a3495-07aa-423e-9326-631fb18936c1.png)

Tiledesk FIREBASE-to-MONGO migration module allow you to migrate tiledesk firebase database to a mongo remote database. 
With this module, you can migrate the following tiledesk firebase database nodes:
- groups
- users/archived_conversations
- users/conversations
- users/messages
- users/instances

## Prerequisites
- Firebase admin privileges
- Mondo Db
- NodeJs and npm installed (suggested versions are NodeJS 12.20.2 and NPM 6.14.11)

## How to install
Before you start, you must have a serviceAccountKey.json file in the current project folder, as described in the next section. 

### Initialize Firebse SDK
The Admin SDK is a set of server libraries that lets you interact with Firebase from privileged environments to perform some utils actions.

To authenticate a service account and authorize it to access Firebase services, you must generate a private key file in JSON format.

To generate a private key file for your service account:
1. In the Firebase console, open Settings > Service Accounts.
2. Click Generate New Private Key, then confirm by clicking Generate Key.
3. Securely store the JSON file containing the key and save it into root project as serviceAccountKey.json file


### Set up environment

Create a .env file and provide che following string variable:
```
FIREBASE_databaseURL * = https://<DATABASE_NAME>.firebaseio.com
MONGO_databaseURL= <MONGO_URI>
MONGO_DBName=<DATABASE_NAME>
TENANT = <YOUR_TENANT>
```
*To get <DATABASE_NAME>, in the Firebase console, open Settings > General and get 'Project name' property value

## Launch
Before you run the module, you have to update the node memory with respect to the storage size of your firebase database. You can get this info in the Firebase console overview page. Then run the following:
```
export NODE_OPTIONS=--max_old_space_size=<size in bits>
```
e.g. export NODE_OPTIONS=--max_old_space_size=5120 (5Gb memory size)

Run the following command to start migrating data from firebase to mongo
```
npm start
```

When migration ends you should see a log that advise you the task is compled with the duration time. Log seems as following

```
FINISCHED migration at <END_TIME>

----> duration Time: <DURATION_TIME> <----

```



