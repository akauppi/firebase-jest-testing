/*
* src/firestoreClient/index.js
*
* Context:
*   Tests.
*
* Provides support for using Firebase clients in eg. Cloud Functions testing.
*/

/*** disabled
import { projectId } from "../config.js"
export {
  projectId   // pass back (to tests) the project ID the test application has provided (in Global Setup)
}***/

export { httpsCallable } from './httpsCallable.js'
