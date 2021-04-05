/*
* Configuration for the 'cjs' code.
*
* Note: Once Jest 'globalSetup' can take ES modules, this becomes passé.
*/
const fs = require("fs");

const FIRESTORE_HOST = process.env["FIRESTORE_EMULATOR_HOST"] || (() => {
  const fn = process.env["FIREBASE_JSON"] || './firebase.json';
  const firebaseJson = JSON.parse(
      fs.readFileSync(fn, 'utf8')
  );

  const port = firebaseJson.emulators.firestore.port;   // "6767"
  if (!port) {
    throw new Error(`Unable to get Firestore emulator port from '${fn}'`);
  }

  return `localhost:${port}`;
})();

module.exports = {
  FIRESTORE_HOST
}