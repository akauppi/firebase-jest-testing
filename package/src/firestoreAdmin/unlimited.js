/*
* src/firestoreREST/unlimited.js
*
* Context:
*   Always called within tests
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

/*
* Set a document
*/
async function setUnlimited(docPath,o) {  // (string, object) => Promise of ()
  await dbAdmin.doc(docPath).set(o);
}

/*
* Delete a document
*/
async function deleteUnlimited(docPath) {  // (string) => Promise of ()
  await dbAdmin.doc(docPath).delete();
}

/*
* Create a document, but only if it doesn't already exist.
*
* Rejects with the following error if the document already exists:
*   {
*     message: "6 ALREADY_EXISTS: entity already exists: [...]"
*     code: 6
*   }
*/
async function createUnlimited(docPath,o) {   // (string, object) => Promise of ()

  // "Creates a document referred to by this 'DocumentReference' with the provided object values. The write fails
  // if the document already exists."
  //
  await dbAdmin.doc(docPath).create(o);
}

// Full
//
const dbUnlimited = dbAdmin;

export {
  getUnlimited,
  setUnlimited,
  deleteUnlimited,
  createUnlimited,

  // for functions tests
  dbUnlimited
}
