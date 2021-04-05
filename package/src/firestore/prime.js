/*
* src/firestore/prime.js
*
* Write data to the emulated Firestore; DEFAULT "APP".
*/
import { dbUnlimited } from './dbUnlimited.js'

/*
* Prime a database with data
*/
async function prime(data) {    // ({ <docPath>: { <field>: <value> } }) => Promise of ()
  const batch = dbUnlimited.batch();

  for (const [docPath,value] of Object.entries(data)) {
    batch.set( dbUnlimited.doc(docPath), value );
  }
  await batch.commit();
}

export { prime }
