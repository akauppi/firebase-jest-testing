/*
* src/firestoreTesting/common.js
*
* Used by both Jest 'globalSetup' and tests.
*
* NOTE: As long as 'globalSetup' cannot use ES modules, only the tests get the values from here.
*/

// Using separate - but static - Firebase project id.
//
// - keeps us separate from the other tests (e.g. Cloud Functions)
// - helps the priming (in Jest 'globalSetup') and tests (separate Jest contexts) to find the same data
// - we don't see this data in the Emulator UI (it only shows the active project = 'firebase use'); things work, though.
//
// Note: MUST BE in lower case. Otherwise priming data never gets through.
//    mentioned here -> https://github.com/firebase/firebase-tools/issues/1147
//
const projectId = "rules-test";

const PRIME_ROUND = !global.afterAll;   // are imported from 'globalSetup', or from the tests

export {
  projectId,
  PRIME_ROUND
}
