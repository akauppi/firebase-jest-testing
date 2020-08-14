/*
* src/db.js
*
* Provide access to an emulator-facing Firebase client for Firestore.
*
* NOTE: The client is the NORMAL JavaScript client (not '@firebase/testing'). This client can be used in concert with
*     Cloud Functions.
*
* Sniffs the Firestore emulator port from:
*   1. 'FIRESTORE_EMULATOR_HOST' env.var. ('firebase emulator:exec' sets this)
*   2. 'FIREBASE_JSON' file
*   3. './firebase.json' (default)
*
* Usage: On applications where 'db' is used, the caller MUST release the Firebase app as such:
*   <<
*     db.app.delete();
*   <<
*/
import { strict as assert } from 'assert'

// Note: Importing JSON is still experimental (behind '--experimental-json-modules').
import fs from 'fs'

// tbd. test whether the right way to load would work (this was with Firebase 7.17.x):
// This gives:
// <<
//    Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '.../node_modules/firebase/app' is not supported resolving ES modules imported from ...
// <<
//import * as firebase from 'firebase/app'
//import "firebase/firestore"
//
// Work-around:
import firebase from 'firebase/app/dist/index.cjs.js'
import "firebase/firestore/dist/index.cjs.js"

import { projectId } from './projectId.js'

// Look up Firestore emulation port from:
//    - 'FIRESTORE_EMULATION_HOST' (set by 'firebase emulators:exec', or explicitly for overriding)
//    - from './firebase.json'
//
// Note: We don't support renamed 'firebase.json'. If you do that (with 'firebase --config ...'), provide the host
//    explicitly.
//
const FIRESTORE_HOST = process.env["FIRESTORE_EMULATOR_HOST"] || (() => {
  const fn = process.env["FIREBASE_JSON"] || './firebase.json';

  const firebaseJson = JSON.parse(
    fs.readFileSync(fn, 'utf8')
  );

  const port = firebaseJson.emulators.firestore.port;   // "6768"
  if (!port) {
    throw new Error(`Unable to get Firestore emulator port from '${fn}'`);
  }

  return `localhost:${port}`
})();

/*
* Initialize access to Firestore and provide a handle.
*
* Note: By providing a name, we are independent of other apps created (such as for functions testing).
*/
const app = firebase.initializeApp({
  projectId,
  auth: null    // unauth is enough
}, "db-testing");

const db = app.firestore();
db.settings({         // affects all subsequent use (and can be done only once)
  host: FIRESTORE_HOST,
  ssl: false
});

export {
  db
}
