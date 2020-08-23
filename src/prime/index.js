/*
* src/prime/index.js
*
* Write data to the emulated Firestore; DEFAULT "APP".
*/
import { dbUnlimited } from '../dbUnlimited.js'

/*
* Prime a database with data
*/
async function prime(data) {    // ({ <docPath>: { <field>: <value> } }) => Promise of ()
  const batch = dbUnlimited.batch();

  for (const [docPath,value] of Object.entries(data)) {
    batch.set( dbUnlimited.doc(docPath), value );
  }
  await batch.commit();

  // tbd. 'dbUnlimited.app' is undefined when we use 'firebase-admin' (and not 'rules-unit-testing's '.initializeAdminApp'.
  //    Is some cleanup needed??
  /* disabled
  const ignore = dbUnlimited.app().delete()   // tail free-roaming
    .catch(err => {
      console.error("Failure to release Firebase app:", err);   // not seen
    })
  */
}

export { prime }
