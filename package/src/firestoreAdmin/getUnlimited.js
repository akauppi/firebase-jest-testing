/*
* src/firestoreREST/getUnlimited.js
*
* Context:
*   Always called within tests (makes no sense to read data in a Global Setup).
*/
import { strict as assert } from 'assert'
import {PRIME_ROUND} from '../config.js'
assert(!PRIME_ROUND);

//import { initializeApp } from 'firebase-admin'
import { default as admin } from 'firebase-admin'

import {FIRESTORE_HOST, projectId} from '../config.js'

const dbAdmin = (_ => {
  const adminApp = admin.initializeApp({
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
* What's currently in a certain Firestore path?
*/
async function getUnlimited(docPath) {  // (string) => Promise of undefined|object

  const dss = await dbAdmin.doc(docPath).get();   // DocumentSnapshot
  return dss.data();
  // "Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist."
}

export {
  getUnlimited
}
