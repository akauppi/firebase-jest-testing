/*
* src/fns.js
*
* Provide access to an emulator-facing Firebase client (Cloud Functions).
*/
import { strict as assert } from 'assert'

// Note: Importing JSON is still experimental (behind '--experimental-json-modules'; Node 14.7).
import fs from 'fs'

// This gives:
// <<
//    Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '.../node_modules/firebase/app' is not supported resolving ES modules imported from ...
// <<
//import * as firebase from 'firebase/app'
//import "firebase/firestore"
//import "firebase/functions"

import firebase from 'firebase/app/dist/index.cjs.js'
import "firebase/firestore/dist/index.cjs.js"
import "firebase/functions/dist/index.cjs.js"

import { projectId } from './projectId.js'

const fn = process.env["FIREBASE_JSON"] || './firebase.json';
const firebaseJson = JSON.parse(
  fs.readFileSync(fn, 'utf8')
);

const FUNCTIONS_URL = "http://localhost:5001";    // not available in any Firebase config, to read. :(

/*
* Initialize access to Firestore and provide a handle.
*/
const app = firebase.initializeApp({
  projectId,
  auth: null    // unauth is enough
});

firebase.functions().useFunctionsEmulator(FUNCTIONS_URL);   // must be *after* '.initializeApp'

const fns = firebase.app().functions(/*"europe-west3"*/);

export {
  fns
}
