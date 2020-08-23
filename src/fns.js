/*
* src/fns.js
*
* Provide access to an emulator-facing Firebase client (Cloud Functions).
*/
import { strict as assert } from 'assert'

// This gives:
// <<
//    Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '.../node_modules/firebase/app' is not supported resolving ES modules imported from ...
// <<
//import * as firebase from 'firebase/app'
//import "firebase/firestore"
//import "firebase/functions"

import firebase from 'firebase/app/dist/index.cjs.js'
import "firebase/functions/dist/index.cjs.js"

import { projectId } from './projectId.js'
import { FUNCTIONS_URL } from './config.js'

/*
* Initialize access to Firestore and provide a handle.
*
* Note: By providing a name, we are independent of other apps created (such as for Cloud Firestore testing).
*/
const app = firebase.initializeApp({
  projectId,
  auth: null    // unauth is enough
}, "fns-testing");

const fns = app.functions(/*"europe-west3"*/);
fns.useFunctionsEmulator(FUNCTIONS_URL);

export {
  fns
}
