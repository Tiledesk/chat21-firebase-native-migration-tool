# TILEDESK FIREBASE-to-MONGO migration module

Tiledesk FIREBASE-to-MONGO migration module allow you to migrate tilesk firebase database to a mongo remote database. 
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
Before you start, you must have a serviceAccountKey.json file in the current project folder. 

### Initialize Firebse SDK
The Admin SDK is a set of server libraries that lets you interact with Firebase from privileged environments to perform actions like:

Read and write Realtime Database data with full admin privileges.
Programmatically send Firebase Cloud Messaging messages using a simple, alternative approach to the Firebase Cloud Messaging server protocols.
Generate and verify Firebase auth tokens.
Access Google Cloud resources like Cloud Storage buckets and Cloud Firestore databases associated with your Firebase projects.
Create your own simplified admin console to do things like look up user data or change a user's email address for authentication.
The Firebase Admin Node.js SDK is available on npm as firebase-admin:
```
$ npm install --save firebase-admin
```
Once you have decided the firebase database project to migrate, you can initialize the firebase SDK with admin privileges.


To authenticate a service account and authorize it to access Firebase services, you must generate a private key file in JSON format.

To generate a private key file for your service account:
1. In the Firebase console, open Settings > Service Accounts.
2. Click Generate New Private Key, then confirm by clicking Generate Key.
3. Securely store the JSON file containing the key and save it into root project as serviceAccountKey.json file


### Set up environment

Create a .env file and provide che following string variable:
```
FIREBASE_databaseURL = https://<DATABASE_NAME>.firebaseio.com
MONGO_databaseURL= <MONGO_URI>
MONGO_DBName=<DATABASE_NAME>
TENANT = <YOUR_TENANT>
```
## Launch

Run the following command to start migrating data from firebase to mongo
```
npm start
```





