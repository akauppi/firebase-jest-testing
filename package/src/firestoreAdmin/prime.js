/*
* src/firestoreAdmin/prime.js
*
* Write data to the emulated Firestore.
*/
//import { initializeApp } from 'firebase-admin'    // for "modular API" (9.100.x had problems with this; 10-May-2021)

// To successfully load 'firebase-admin' (9.7.0 era; pre-ESM), you MUST DO THIS:
//
//  <<
//    import { default as admin } from 'firebase-admin'
//    // DON'T TRY to spread the 'admin' open (not in the root; not within the functions):
//    //const { initializeApp } = admin;    // WON'T WORK: "Cannot read property 'INTERNAL' of undefined"
//  <<
//
// Note that the official "ES2015" way of "import * as admin from ..." does not work, either.
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
