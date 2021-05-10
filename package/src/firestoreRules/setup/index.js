/*
* src/firestoreRules/setup/index.js
*
* Imported both by the Global Setup (to prime the data) and the test suites.
*/

// Note: MUST BE in lower case. Otherwise priming data never gets through.
//    See -> https://github.com/firebase/firebase-tools/issues/1147
//
const projectId = "rules-test";

export {
  projectId
}
