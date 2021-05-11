/*
* src/firestoreREST/getUnlimited.js
*/
import { strict as assert } from 'assert'

//import { initializeApp } from 'firebase-admin'
import { default as admin } from 'firebase-admin'

let dbAdmin;

function init(projectId) {    // (string) => (() => Promise of ())
  const adminApp = admin.initializeApp({
    projectId
  }, `rest-${ Date.now() }`);   // unique; keep away from other "apps" (configurations, really); btw. would be nice if Firebase APIs had nameless "apps" easier.

  dbAdmin = adminApp.firestore();

  return async () => {
    await adminApp.delete();
  };
}

/*
* What's currently in a certain Firestore path?
*/
async function getUnlimited(docPath) {  // (string) => Promise of undefined|object
  assert(dbAdmin);
  const dss = await dbAdmin.doc(docPath).get();   // DocumentSnapshot

  return dss.data();
  // "Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist."
}

export {
  init,
  getUnlimited
}