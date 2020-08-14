/*
* src/firestoreTesting/projectId.js
*
* Used by both Jest global setup and tests.
*/

// Using separate - but static - Firebase project id.
//
// - keeps us separate from the other tests (e.g. Cloud Functions)
// - helps the priming (in Jest 'globalSetup') and tests (separate Jest contexts) to find the same data
// - we don't see this data in the Emulator UI (it only shows the project in '.firebaserc); things work, though.
//
// Note: MUST BE in lower case. Otherwise priming data never gets through.
//    mentioned here -> https://github.com/firebase/firebase-tools/issues/1147
//
const projectId = "rules-test";

export {
  projectId
}
