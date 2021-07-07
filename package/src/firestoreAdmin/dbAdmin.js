/*
* src/firestoreAdmin/dbAdmin.js
*
* Context:
*   Always called within tests
*/
import { strict as assert } from 'assert'
import {PRIME_ROUND} from '../config.js'
assert(!PRIME_ROUND);

import { initializeApp } from 'firebase-admin/app'    // "modular API" (in alpha)
//import { default as admin } from 'firebase-admin';    // stable API
//function initializeApp(a,b) { return admin.initializeApp(a,b) }

import {FIRESTORE_HOST, projectId} from '../config.js'

import { afterAll } from '@jest/globals'

/*
* All the exposed methods operate on this one Firestore Admin app. This hides emulator configuration from the rest.
*/
const dbAdmin = (_ => {
  const adminApp = initializeApp({
    projectId
  }, `unlimited-${ Date.now() }`);   // unique name keeps away from other "apps" (configurations, really); btw. would be nice if Firebase APIs had nameless "apps" easier.

  const db = adminApp.firestore();
  db.settings({
    host: FIRESTORE_HOST,
    ssl: false
  });

  afterAll( async () => {   // clean up, automatically
    await adminApp.delete();
  });

  return db;
})();

/*
* Pre-heat the Admin SDK <-> Firebase Emulators listening connection.
*
* Note: Setting up the first listener to a collection carries a 300..320 ms penalty. By pre-warming the listening
*     (if the test application sets up the listener in, say, 'beforeAll'), we can make the test times *seem* faster,
*     dropping from ~570..620ms to ~280ms.
*
*     This doesn't really speed up anything: it just removes a portion of the timing to the test preparation (and thus,
*     it doesn't get reported). If you wish to report the *recurring* performance of your tests, use this trick.
*     If you are interested in the first (worst case?), don't.
*
*     ---
*     Note to Firebase:
*
*     300ms for setting up a connection sounds like a lot. Is it the same, towards a cloud instance, as well?
*     #contribute: test this, report to Firebase if you also think 300ms could be improved (say, to 100ms)
*     ---
*/
function preheat_EXP(collPath) {    // (string) => (string, ((object|null) => boolean)?)) => ()

  // Instantly unsubscribing doesn't matter - it still creates the connection ('firebase-admin' ; 'firebase-tools' 9.12.1)
  //
  const unsub = dbAdmin.doc(`${collPath}/...`).onSnapshot( ss => {} );
  unsub();
}

export {
  dbAdmin,

  // EXPERIMENTAL
  preheat_EXP
}
