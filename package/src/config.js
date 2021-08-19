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

// Needed for working with Docker Compose.
//
// Note: TRIED desperately to have this provided through some other means. Chiefly, Jest config doesn't allow custom
//    entries (tried), and even if it did, the given globals are not reflected in Global Setup, only in test environment (Jest 27.0.6).
//
const host = process.env["EMUL_HOST"] || 'localhost';

function fail(msg) { throw new Error(msg); }

const PRIME_ROUND = ! process.env.JEST_WORKER_ID;

const firebaseJson = JSON.parse(
  readFileSync(fn, 'utf8')
);

const FIRESTORE_HOST = (() => {
  const port = firebaseJson?.emulators?.firestore?.port
    || fail(`Unable to get Firestore emulator port from '${fn}'`);

  return `${host}:${port}`;
})();

const FUNCTIONS_URL = (() => {
  let port = firebaseJson?.emulators?.functions?.port;   // "5002"
  if (!port) {
    port = 5001;
    console.warning(`No 'emulators.functions.port' in '${fn}': using default (${port}).`);
  }

  return `http://${host}:${port}`;
})();

// If Global Setup, pass
// In tests, expect 'prime' to have set 'PROJECT_ID' env.var.
//
const projectId = PRIME_ROUND ? null
  : process.env["PROJECT_ID"] || fail("Internal error - env.var 'PROJECT_ID' not set. Did you run 'prime(projectId,docs)' in Global Setup?");

/*** disabled
// Region is defined in the code of Cloud Functions, and not treated as a configuration by Firebase (no idea why there's
// not an entry for it in 'firebase.json').
//
const functionsRegion = (() => {
  let s = firebaseJson?._custom && firebaseJson._custom["functions.region"];
  if (!s) {
    s = "us-central1";    // Firebase default region
    console.warning(`No '_custom["functions.region"]' in '${fn}': using default '${s}'.`);
  }
  return s;
})();
***/

export {
  FIRESTORE_HOST,
  FUNCTIONS_URL,
  PRIME_ROUND,
  projectId,
  //functionsRegion
}
