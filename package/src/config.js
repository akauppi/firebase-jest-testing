/*
* src/config.js
*
* Provides access to emulator and project configuration, plus execution context (JEST Global Setup or part of test suite).
*
* Context:
*   Imported both under Global Setup and tests.
*
* Note:
*   Must have NO side effects; imported for reading an immutable context.
*
* On project id:
*   Each individual JEST Node.js universe is only ever involved with one project ID. It's provided either by
*   'GCLOUD_PROJECT' env.var. or (for the Security Tests) by the Global Setup setting the value.
*/
import { readFileSync } from 'fs'

const fn = process.env["FIREBASE_JSON"] || './firebase.json';

function fail(msg) { throw new Error(msg); }

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

// Note: MUST BE in lower case. Otherwise priming data never gets through.
//    See -> https://github.com/firebase/firebase-tools/issues/1147
//
const projectId = process.env["GCLOUD_PROJECT"]
  || fail("Env.var 'GCLOUD_PROJECT' not set. Please set it in 'package.json' or the Global JEST Setup (specific value doesn't matter).");

if (projectId !== projectId.toLowerCase()) {    // (could do it for the user, and just warn?)
  fail("Please provide 'GCLOUD_PROJECT' with only lower case characters.");
}

const PRIME_ROUND = !global.afterAll;   // are we imported from 'globalSetup', or from the tests?

export {
  FIRESTORE_HOST,
  FUNCTIONS_URL,
  projectId,
  PRIME_ROUND
}
