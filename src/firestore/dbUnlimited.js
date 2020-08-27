/*
* src/firestore/dbUnlimited.js
*
* Provide access to an emulator-facing Firebase client for Firestore, FOR THE DEFAULT "APP", _without_ Security Rules
* applied.
*
* Sniffs the Firestore emulator port from:
*   1. 'FIRESTORE_EMULATOR_HOST' env.var. ('firebase emulator:exec' sets this)
*   2. 'FIREBASE_JSON' file
*   3. './firebase.json' (default)
*
* Usage: On applications where 'dbUnlimited' is used, the caller MUST release the Firebase app as such:
*   <<
*     dbUnlimited.app().delete();
*   <<
*/
import admin from 'firebase-admin'

import { projectId } from '../projectId.js'
import { FIRESTORE_HOST } from '../config.js'

/*
* Initialize access to Firestore and provide a handle.
*
* Note: By providing a name, we are independent of other apps created (such as for functions testing).
*/
const appAdmin = admin.initializeApp({
  projectId
});   // prepare for default app (unlike '.initializeAdminApp' which uses a random app name)

const db = appAdmin.firestore();
db.settings({         // affects all subsequent use (and can be done only once)
  host: FIRESTORE_HOST,
  ssl: false
});

export {
  db as dbUnlimited
}
