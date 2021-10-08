/*
* functions/index.js
*
* Cloud Functions so we have something to test against.
*/
import functions from 'firebase-functions';
import admin from 'firebase-admin';

//import { debug as debugGen, enable } from 'debug'   // ESM API (fictional)
const { debug: /*as*/ debugGen, enable } = await import('debug').then( mod => mod.default );    // CommonJS API only

const debug = debugGen('sample:functions');

const dGreet = debug.extend("greet");
const dUIS = debug.extend("userInfoShadow");

// NOTE: Normally the caller would do 'DEBUG=sample:*' but that activates _all_ of Firebase Emulator's own (unrelated)
//    debugging output. This is a work-around, not needing to set 'DEBUG'.
//
enable('sample:*');

debug("Loading 'functions/index.js'");

admin.initializeApp();          debug("Firebase app initialized");
const db = admin.firestore();   debug("Firestore handle initialized");

// Sad that the default region needs to be in the code. There is no configuration for it. 😢
//
const regionalFunctions = functions.region("mars-central2");

debug("Have 'regionalFunctions'");

/*
* { msg: string } -> string
*/
export const greet = regionalFunctions.https
  .onCall((msg, context) => {

    dGreet("called");
    /*** KEEP
    // If you need to signal errors, this is the way. Use codes only from 'FunctionsErrorCode' selection:
    //  -> https://firebase.google.com/docs/reference/functions/providers_https_#functionserrorcode
    //
    throw new functions.https.HttpsError('unimplemented',"message",[...details]);
    ***/

    return `Greetings, ${msg}.`;
  });

debug("'greet' declared");

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

    dUIS("onWrite called");

    const [before,after] = [change.before, change.after];   // [QueryDocumentSnapshot, QueryDocumentSnapshot]
    const uid = change.after.id;

    const newValue = after.data();      // { ... } | undefined
    console.debug(`Global userInfo/${uid} change detected: `, newValue);

    dUIS("change logged");

    // Removal of userInfo is not propagated. Only tests do it, as 'beforeAll'.
    //
    if (newValue !== undefined) {

      // Find the projects where the person is a member.
      //
      const qss = await db.collection('projects')
        .where('members', 'array-contains', uid)
        .select()   // don't ship the fields, just matching ref
        .get();

      dUIS("documents to write found: %d", qss.size);

      if (qss.size === 0) {
        console.debug(`User '${uid}' not found in any of the projects.`);

      } else {
        const arr = qss.docs;   // Array of QueryDocumentSnapshot
        const proms = arr.map( qdss => {
          console.debug(`Updating userInfo for: projects/${qdss.id}/userInfo/${uid} ->`, newValue);

          return qdss.ref.collection("userInfo").doc(uid).set(newValue);    // Promise of WriteResult
        });
        await Promise.all(proms);

        dUIS("documents updated");
      }
    }
  });

debug("'userInfoShadow' declared");
