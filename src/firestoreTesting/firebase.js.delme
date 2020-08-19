/*
* src/firestoreTesting/firebase.js
*
* Provide the '@firebase/testing' client's 'firebase' handle. Used by both data priming (admin) and test (read-only)
* modules.
*
* Usage:
*   - '--harmony-top-level-await' node flag needed
*/
import { firebaseJson } from "../config"

/***
 * This tries to avoid needing to place 'FIRESTORE_EMULATOR_HOST' in 'package.json', but while it works on individual
 * tests, Jest has a teardown problem when all tests are run.
 * <<
 *  ReferenceError: You are trying to `import` a file after the Jest environment has been torn down.
 *    23 | const firebase= (await import('@firebase/testing')).default;
 *                         ^
 * <<

// Set 'FIRESTORE_EMULATOR_HOST', to guide '@firebase/testing' (unless already set)
//
const tmp = process.env["FIRESTORE_EMULATOR_HOST"];
if (!tmp) {
  process.env["FIRESTORE_EMULATOR_HOST"] = `localhost:${firebaseJson.emulators.firestore.port}`;   // "localhost:6767"

  //console.debug("FIRESTORE_EMULATOR_HOST:", process.env["FIRESTORE_EMULATOR_HOST"]);
}

// Load _dynamically_ so that the changed 'process.env' applies.
//
const firebase= (await import('@firebase/testing')).default;
***/

import firebase from '@firebase/testing'
export { firebase }
