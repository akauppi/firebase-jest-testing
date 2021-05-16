/*
* src/firestoreRules/index.js
*
* Tests facing API (not for the Global setup).
*
* Note: Each JEST test has its own Node.js environment. Thus, this code gets imported N times, once per each test.
*   Only "global setup" allows one-time initializations.
*/
import { PRIME_ROUND } from '../config.js'
if (PRIME_ROUND) throw new Error("This module is for tests only");

import { collection } from './collection.js'

import { serverTimestampSentinel, deleteFieldSentinel, arrayRemove, arrayUnion } from '../firestoreREST/sentinels'

// Enable '.toAllow' and '.toDeny' matchers for the tests, as a side effect
//
import './matchers.js';

// Firestore client API has the '()' but they always are given the same value.
//
const serverTimestamp = () => serverTimestampSentinel;
const deleteField = () => deleteFieldSentinel;

export {
  collection,
  serverTimestamp,
  deleteField,
  arrayRemove,
  arrayUnion
}
