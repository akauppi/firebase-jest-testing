/*
* src/firestoreAdmin/prime.js
*
* Write data to the emulated Firestore.
*
* Context:
*   JEST Global Setup
*/
import { strict as assert } from 'assert'
import { PRIME_ROUND } from '../config.js'
assert(PRIME_ROUND);

//import { initializeApp } from 'firebase-admin'    // for "modular API" #later

// To successfully load 'firebase-admin' (9.x), you DO IT PRECISELY LIKE HERE!
//
//    import { default as admin } from 'firebase-admin'
//    ...later:   admin.initializeApp()
//
// DO NOT:
//    - spread the 'admin' open (not in module root; not within functions):
//      <<
//        const { initializeApp } = admin   // DOES NOT WORK. Gives "Cannot read property 'INTERNAL' of undefined"
//      <<
//
// The official "ES2015" way of "import * as admin from ..." does not work with native ES modules (likely only for bundlers).
//
import { default as admin } from 'firebase-admin'

import { wipe } from '../rules-unit-testing/wipe.js'

import { FIRESTORE_HOST, projectId } from '../config.js'

/*
* Prime a database with data
*
* We also clear the whole database (like priming with paint also does); this ensures no earlier ghost data would
* remain.
*/
async function prime(data) {    // ({ <docPath>: { <field>: <value> } }) => Promise of ()

  await wipe(projectId);    // clear the old remains

  await withDbAdmin(async dbAdmin => {
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
* Note: Do not merge this code with 'getUnlimited'. This one works in the Global
*/
async function withDbAdmin(f) {  // ( string, (Firestore) => Promise of () ) => Promise of ()
  const appAdmin = admin.initializeApp({
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
