/*
* src/firestoreRules/matchers.js
*
* Conveniency functions for testing Firestore security rules.
*
* Imported automatically for the test Node.js environments (not global setup).
*/
import { strict as assert } from 'assert'
import { expect } from '@jest/globals'

import { PRIME_ROUND } from "../config.js"
assert(!PRIME_ROUND);

expect.extend( {
  async toAllow(prom) {
    const s = await prom;
    if (s !== true) {
      return { pass: false, message: () => myFmt(true, s) }
    } else {
      return { pass: true };
    }
  },

  async toDeny(prom) {
    const s = await prom;
    if (s === true) {
      return { pass: false, message: () => myFmt(false) }   // no reason for being allowed
    } else {
      return { pass: true };
    }
  }
});

function myFmt(expectedAllowed,reason) {   // (boolean, string | undefined) => string
  const a = lookup[expectedAllowed];
  const b = lookup[!expectedAllowed];

  // 'reason' from the emulator seems to start with '\n' ('firebase-tools' 9.10.2). Strip any preceding white space.

  return `Expected ${a} but the Firebase operation was ${b.toUpperCase()}.` + (reason ? ` [${reason.trimStart()}]`:'');
}

const lookup = { false: "denied", true: "allowed" };
