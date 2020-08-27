/*
* src/firestoreReadOnly/matchers.js
*
* Conveniency functions for testing Firestore security rules.
*
* Note: '@firebase/rules-unit-testing' provides 'assertFails' and 'assertSucceeds' but they are only thin wrappers around the
*     promise. We don't use them, and the '.toAllow', '.toDeny' are seen as more developer friendly interface.
*
* Note: Used to have 'err instanceof FirebaseError' in the conditions, but that didn't work (maybe Jest interference,
*     maybe '@firebase/rules-unit-testing' stuff), but testing can as well be done with '.name'.
*
*     References:
*       - firebase.FirebaseError -> https://firebase.google.com/docs/reference/js/firebase.FirebaseError
*/
import { strict as assert } from 'assert'
import { expect } from '@jest/globals'

// Mentally also depends on '@firebase/rules-unit-testing'.
//import firebase from '@firebase/rules-unit-testing'

import { PRIME_ROUND } from "./common"
assert(!PRIME_ROUND);

// Just importing enables them:
expect.extend( {
  async toAllow(prom) {
    try {
      await prom;
      return { pass: true };
    } catch (err) {
      if (err.name === 'FirebaseError' && err.code == 'permission-denied') {
        return { pass: false, message: () => format('allowed','denied', err) }
      } else {
        return weird(err)
      }
    }
  },

  async toDeny(prom) {
    try {
      await prom;
      return { pass: false, message: () => format('denied','allowed') }   // there is no reason for passing
    } catch (err) {
      if (err.name === 'FirebaseError' && err.code == 'permission-denied') {
        return { pass: true }
      } else {
        return weird(err)
      }
    }
  }
});

function format(a,b,reason) {   // (string, string, string | undefined) => string
  return `Expected ${a} but the Firebase operation was ${b.toUpperCase()}.` + reason ? ` [${reason}]`: "";
}

function weird(err) {   // assert failed within the code; not allow/deny
  return { pass: false, message: () => err }    // e.g. "ReferenceError: xxx is not defined"
}

export { }
