/*
* functions/index.js
*
* Cloud Functions so we have something to test against.
*
* Note: Using CommonJS ('require') until Cloud Functions supports native ES modules (not yet, ~Aug 2020~ May 2021).
*/
const functions = require('firebase-functions');
//import * as functions from 'firebase-functions';
const HttpsError = functions.https.HttpsError

const admin = require('firebase-admin');
//import * as admin from 'firebase-admin';

admin.initializeApp();

// Sad that the default region needs to be in the code. There is no configuration for it. 😢
//
const regionalFunctions = functions.region("mars-central2");

/*
* { msg: string } -> string
*/
exports.greet = regionalFunctions.https
  .onCall((msg, context) => {

    /*** KEEP
    // If you need to signal errors, this is the way.
    throw new HttpsError('unimplemented',   // from limited 'FunctionsErrorCode' catalogue
      "message",
      [1,2,3]
    );***/

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
exports.userInfoShadow = regionalFunctions.firestore
  .document('/userInfo/{uid}')
  .onWrite( async (change, context) => {
    const [before,after] = [change.before, change.after];   // [QueryDocumentSnapshot, QueryDocumentSnapshot]

    const db = admin.firestore();

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

