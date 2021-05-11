/*
* src/firestoreRules/index.js
*
* Tests facing API (not for the Global setup).
*
* Note: Each JEST test has its own Node.js environment. Thus, this code gets imported N times, once per each test.
*   Only "global setup" allows one-time initializations.
*/
import { PRIME_ROUND } from './common.js'
if (PRIME_ROUND) throw new Error("This module is for tests only");

import { init } from '../firestoreREST/index.js'

import { collection } from './collection.js'

import { serverTimestampSentinel } from './sentinels'

// Enable '.toAllow' and '.toDeny' matchers for the tests, as a side effect
//
import './matchers.js';

// This initializes 'firestoreREST' (we may get rid of even this, eventually)
//
const release = init();

const dbAuth = {
  collection
}

// Firestore client API has the '()' but they always are given the same value.
//
const serverTimestamp = () => serverTimestampSentinel;

/*
* JEST can clean after us.
*/
afterAll( async () => {   // () => Promise of ()
  await release();
});

export {
  dbAuth,
  serverTimestamp
}
