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

export { firebase }
