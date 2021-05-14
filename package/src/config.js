/*
* src/config.js
*
* Context:
*   Imported both under Global Setup and tests.
*
* Provides access to emulator and project configuration, plus execution context (JEST Global Setup or part of test suite).
*
* Each individual JEST Node.js universe is only ever involved with one project ID. It's provided in the 'prime' call
* and distributed to all tests under that Node environment, via an internal env.var.
*/
import { readFileSync } from 'fs'

const fn = process.env["FIREBASE_JSON"] || './firebase.json';

function fail(msg) { throw new Error(msg); }

const PRIME_ROUND = !global.afterAll;   // are we imported from 'globalSetup', or from the tests?

const firebaseJson = JSON.parse(
  readFileSync(fn, 'utf8')
);

const FIRESTORE_HOST = process.env["FIRESTORE_EMULATOR_HOST"] || (() => {
  const port = firebaseJson?.emulators?.firestore?.port
    || fail(`Unable to get Firestore emulator port from '${fn}'`);

  return `localhost:${port}`;
})();

const FUNCTIONS_URL = (() => {
  let port = firebaseJson?.emulators?.functions?.port;   // "5002"
  if (!port) {
    port = 5001;
    console.warning(`No 'emulators.functions.port' in '${fn}': using default (${port}).`);
  }

  return `http://localhost:${port}`;
})();

// If Global Setup, pass
// In tests, expect 'prime' to have set 'PROJECT_ID' env.var.
//
const projectId = PRIME_ROUND ? null
  : process.env["PROJECT_ID"] || fail("Internal error - env.var 'PROJECT_ID' not set. Did you run 'prime(projectId,docs)' in Global Setup?");

export {
  FIRESTORE_HOST,
  FUNCTIONS_URL,
  PRIME_ROUND,
  projectId
}
