/*
* src/firestoreRules/index.js
*
* Tests facing API (not for the Global setup).
*
* Note: Each JEST test has its own Node.js environment. Thus, this code gets imported N times, once per each test.
*   Only "global setup" allows one-time initializations.
*/
import { PRIME_ROUND, projectId } from './common.js'
if (PRIME_ROUND) throw new Error("This module is for tests only");

import { init } from '../firestoreREST/index.js'

// This initializes 'firestoreREST' so that inner entries can use it without passing any context info (project id or
// Firebase/Firestore handled).
//
const release = init(projectId);

/*** REMOVE!!!
import { FIRESTORE_HOST } from '../config.js'

// For now, we're using a Firebase client.
//
//import { initializeApp } from '@firebase/app'
import firebase from 'firebase'
const { initializeApp } = firebase;

//import { initializeFirestore, FieldValue } from '@firebase/firestore'
const { FieldValue } = firebase.firestore.FieldValue;

const fah = initializeApp({
  projectId
}, "rules-test-random");   // use a custom name, in case the tests also use 'initializeApp' or 'getApp'

/_*** 9.0.0-beta.N
const db = initializeFirestore(fah, {
  host: FIRESTORE_HOST,
  ssl: false
})
***_/

// 8.x
const db = firebase.firestore(fah)
db.useEmulator("localhost",6767);
***/

import { collection } from './collection.js'

const dbAuth = {
  collection
}

// Enable '.toAllow' and '.toDeny' matchers for the tests, as a side effect
//
import './matchers.js';

/*** disabled
/*
* Sentinels
*
* For wire interface of sentinels, see:
*   -> https://github.com/samuelgozi/firebase-firestore-lite/blob/master/test/Transform.test.js
*
* Note: They don't seem to be in the official documentation.
*_/
const serverTimestamp = () => ({ setToServerValue: 'REQUEST_TIME' });

// tbd. Study the values in network traffic of writing a 'serverTimestamp'
/_* others:
  increment,
  arrayRemove,
  arrayUnion,
  deleteField
*_/
***/

/*
* JEST can clean after us.
*/
afterAll( async () => {   // () => Promise of ()
  await release();
});

export {
  dbAuth,
  //serverTimestamp
  projectId
}
