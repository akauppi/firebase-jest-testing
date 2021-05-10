/*
* src/firestoreRules/matchers.js
*
* Conveniency functions for testing Firestore security rules.
*
* Imported automatically for the test Node.js environments (not global setup).
*
* Note: Used to have 'err instanceof FirebaseError' in the conditions, but that didn't work (maybe Jest interference
*     stuff), but testing can as well be done with '.name'.
*
*     References:
*       - firebase.FirebaseError -> https://firebase.google.com/docs/reference/js/firebase.FirebaseError
*/
import { strict as assert } from 'assert'
import { expect } from '@jest/globals'

import { PRIME_ROUND } from "./common.js"
assert(!PRIME_ROUND);

// Just importing enables them:
expect.extend( {
  async toAllow(prom) {
    try {
      await prom;
      return { pass: true };
    } catch (err) {
      if (err.name === 'FirebaseError' && err.code === 'permission-denied') {
        return { pass: false, message: () => myFmt(true, err) }
      } else {
        return weird(err)
      }
    }
  },

  async toDeny(prom) {
    try {
      await prom;
      return { pass: false, message: () => myFmt(false) }   // there is no reason for passing
    } catch (err) {
      if (err.name === 'FirebaseError' && err.code === 'permission-denied') {
        return { pass: true }
      } else {
        return weird(err)
      }
    }
  }
});

function myFmt(expectedAllowed,reason) {   // (boolean, string | undefined) => string
  const [a,b] = expectedAllowed ? ['allowed','denied'] : ['denied','allowed'];

  return `Expected ${a} but the Firebase operation was ${b.toUpperCase()}.` + reason ? ` [${reason}]`:'';
}

function weird(err) {   // assert failed within the code; not allow/deny
  return { pass: false, message: () => err }    // e.g. "ReferenceError: xxx is not defined"
}

export { }
