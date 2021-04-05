/*
* src/config.js
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

const FUNCTIONS_URL = (() => {
  let port = firebaseJson.emulators.functions?.port;   // "5002"
  if (!port) {
    port = 5001;
    console.warning(`No 'emulators.functions.port' in '${fn}': using default (${port}).`);
  }

  return `http://localhost:${port}`;
})();


export {
  FIRESTORE_HOST,
  FUNCTIONS_URL
}
