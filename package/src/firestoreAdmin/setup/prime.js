/*
* src/firestoreAdmin/setup/prime.js
*
* Write data to the emulated Firestore.
*
* Context:
*   JEST Global Setup
*/
import { strict as assert } from 'assert'
import {PRIME_ROUND, FIRESTORE_HOST} from '../../config.js'
assert(PRIME_ROUND);

//import { initializeApp } from 'firebase-admin/app'    // for "modular API" (in alpha)

// To successfully load 'firebase-admin' (9.x), you DO IT PRECISELY LIKE HERE!
//
// DO NOT:
//    - spread the 'admin' open (not in module root; not within functions).
//        >> const { initializeApp } = admin    // gives "Cannot read property 'INTERNAL' of undefined"
//    - assign to a value
//        >> const initializeApp = admin.initializeApp;   // ..same error
//
// The official "ES2015" way of "import * as admin from ..." does not work with native ES modules.
//
//import admin from 'firebase-admin'; const initializeApp = admin.initializeApp;
import { default as admin } from 'firebase-admin';   // WORKS
function initializeApp(a,b) { return admin.initializeApp(a,b) }

import { wipe } from './wipe.js'

/*
* Prime a database with data
*
* We also clear the whole database (like priming with paint also does); this ensures no earlier ghost data would
* remain.
*
* projectId:  A unique string to this test set; allows multiple test sets to be run in parallel. They each have
*             their own Firestore data sets but share the Security Rules.
*/
async function prime(projectId, data) {    // ({ <docPath>: { <field>: <value> } }) => Promise of ()

  // Project id MUST BE in lower case. Otherwise priming data never gets through.
  //    See -> https://github.com/firebase/firebase-tools/issues/1147
  //
  if (projectId !== projectId.toLowerCase()) {
    const tmp = projectId.toLowerCase();
    console.warn("Using a lower case project id:", tmp )
    projectId = tmp;
  }

  // Set an internal env.var. from which the tests get the project id.
  //
  process.env["PROJECT_ID"] = projectId;

  await wipe(projectId);    // clear the old remains

  await withDbAdmin(projectId, async dbAdmin => {
    const batch = dbAdmin.batch();

    for (const [docPath,value] of Object.entries(data)) {
      batch.set( dbAdmin.doc(docPath), value );
    }
    await batch.commit();
  });
}

/*
* Do something, using a temporary admin access to Firestore.
*
* Note: Do not merge this with 'dbAdmin.js'. This one works in the Global Setup.
*/
async function withDbAdmin(projectId, f) {  // ( string, (Firestore) => Promise of () ) => Promise of ()
  const appAdmin = initializeApp({
    projectId
  }, `prime-${Date.now()}`);    // unique from other "apps"

  const dbAdmin = appAdmin.firestore();
  dbAdmin.settings({
    host: FIRESTORE_HOST,
    ssl: false
  });

  await f(dbAdmin);

  /*await*/ appAdmin.delete();    // let releasing run free (though only takes 0.20, 0.31 ms)
}

export {
  prime
}
