/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/
import { docs } from './docs.js'

// Separate Firestore project id; allows parallel testing of Rules and other stuff.
//
process.env["GCLOUD_PROJECT"] = "rules-test";

async function setup() {
  const { prime } = await import('firebase-jest-testing/firestoreAdmin');   // dynamic so that 'GCLOUD_PROJECT' can be in effect
  await prime(docs);
}

export default setup;
