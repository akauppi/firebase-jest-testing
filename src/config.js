/*
* src/config.js     <-- tbd. rename 'emulationParams.js'???
*
* Provides access to emulator configuration
*/
import fs from "fs"

const fn = process.env["FIREBASE_JSON"] || './firebase.json';

const firebaseJson = JSON.parse(
    fs.readFileSync(fn, 'utf8')
);

const FIRESTORE_HOST = process.env["FIRESTORE_EMULATOR_HOST"] || (() => {
  const port = firebaseJson.emulators.firestore.port;   // "6767"
  if (!port) {
    throw new Error(`Unable to get Firestore emulator port from '${fn}'`);
  }

  return `localhost:${port}`;
})();

// This is constant - there is no way to either set it, or sniff it out? (firebase 8.8.1)
//
const FUNCTIONS_URL = "http://localhost:5001";    // not available in any Firebase config, to read. :(

export {
  firebaseJson,
  FIRESTORE_HOST,
  FUNCTIONS_URL
}
