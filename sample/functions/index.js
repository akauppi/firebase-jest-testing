/*
* functions/index.js
*
* Cloud Functions so we have something to test against.
*/
import functions from 'firebase-functions';

// Firebase modular API (starting 10.0) -> https://modular-admin.web.app/get-started/quick-start
//
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Sad that the default region needs to be in the code. There is no configuration for it. 😢
//
const regionalFunctions = functions.region("mars-central2");

// Note: The file is executed three times by Cloud Functions (once to list the exports; then once per each function).
//    This initialization only matters to certain functions, but it also takes just 2ms, so we can have it in the root.
//
//const t0 = Date.now()
initializeApp()
const db = getFirestore()
//console.debug("!!! Initialization took:", Date.now()-t0 )   // 2, 2, 2

/*
* { msg: string } -> string
*/
export const greet = regionalFunctions.https
  .onCall((msg, context) => {

    /*** KEEP
    // If you need to signal errors, this is the way. Use codes only from 'FunctionsErrorCode' selection:
    //  -> https://firebase.google.com/docs/reference/functions/providers_https_#functionserrorcode
    //
    throw new functions.https.HttpsError('unimplemented',"message",[...details]);
    ***/

    return `Greetings, ${msg}.`;
  });

// UserInfo shadowing
//
// Track changes to global 'userInfo' table, and update projects where the changed user is participating with their
// renewed user info.
//
// Note: This is application specific, from 'GroundLevel'.
//
//  - shows picking document id (following all docs in a collection)
//  - shows behaviour based on template data (i.e. testing Cloud Functions may need primed data).
//
export const userInfoShadow = regionalFunctions.firestore
  .document('/userInfo/{uid}')
  .onWrite( async (change, context) => {

    const [before,after] = [change.before, change.after];   // [QueryDocumentSnapshot, QueryDocumentSnapshot]
    const uid = change.after.id;

    const newValue = after.data();      // { ... } | undefined
    console.debug(`Global userInfo/${uid} change detected: `, newValue);

    // Removal of userInfo is not propagated. Only tests do it, as 'beforeAll'.
    //
    if (newValue !== undefined) {

      // Find the projects where the person is a member.
      //
      const qss = await db.collection('projects')
        .where('members', 'array-contains', uid)
        .select()   // don't ship the fields, just matching ref
        .get();

      if (qss.size === 0) {
        console.debug(`User '${uid}' not found in any of the projects.`);

      } else {
        const arr = qss.docs;   // Array of QueryDocumentSnapshot
        const proms = arr.map( qdss => {
          console.debug(`Updating userInfo for: projects/${qdss.id}/userInfo/${uid} ->`, newValue);

          return qdss.ref.collection("userInfo").doc(uid).set(newValue);    // Promise of WriteResult
        });
        await Promise.all(proms);
      }
    }
  });
