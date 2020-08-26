/*
* src/fns.js
*
* Provide access to an emulator-facing Firebase client (Cloud Functions).
*/
// Note: This should be:
//import * as firebase from 'firebase/app'
import firebase from 'firebase/app'
import "firebase/functions"

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

const fns = app.functions();    // region does not seem to be needed, when running in emulation
fns.useFunctionsEmulator(FUNCTIONS_URL);

export {
  fns
}
