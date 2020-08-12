/*
* functions/index.js
*
* Cloud Functions so we have something to test against.
*
* Note: Using CommonJS ('require') until Cloud Functions supports native ES modules (not yet, Aug 2020).
*/
const functions = require('firebase-functions');
//import * as functions from 'firebase-functions'   // tried with firebase 8.6.0

const admin = require('firebase-admin');
//import * as admin from 'firebase-admin';

admin.initializeApp();

// Sad that the default region needs to be in the code. There is no configuration for it. 😢
//
const regionalFunctions = functions.region('europe-west3');   // Frankfurt

// Logs, as "callable function"
//
// {
//    level: "debug"|"info"|"warn"|"error"
//    msg: string
//    payload: object   //optional
// }
exports.logs_v190720 = regionalFunctions
//const logs_v190720 = regionalFunctions
  .https.onCall(({ level, msg, payload }, context) => {

    const { debug, info, warn, error } = functions.logger;

    switch (level) {
      case "debug":
        debug(msg, payload);
        break;
      case "info":
        info(msg, payload);
        break;
      case "warn":
        warn(msg, payload);
        break;
      case "error":
        error(msg, payload);
        break;
      default:
        throw new functions.https.HttpsError('invalid-argument', `Unknown level: ${level}`);
    }
  });

// Something went awfully wrong.
//
// A central place to catch unexpected circumstances in already deployed code.
//
// Consider this a relay. We can change where to inform, e.g. devops monitoring tools directly with their APIs.
//
// {
//    msg: string
//    ex: exception object
// }
//
exports.fatal_v210720 = regionalFunctions.https
  .onCall(({ msg, ex }, context) => {

    functions.logger.error(`FATAL: ${msg}`, ex);    // keep an eye - is that good?
  });


/*
* { msg: string } -> string
*/
exports.greet = regionalFunctions.https
  .onCall((msg, context) => {
    return `Greetings, ${msg}.`;
  });


/*** not used
// Mirrors changes to '/temp/some.in' (string) in '/temp/other.out' (string).
//
exports.mirror = regionalFunctions.firestore
  .document('/temp/some')
  .onWrite( async (event, context) => {

    const [before,after] = [event.before, event.after];   // [QueryDocumentSnapshot, QueryDocumentSnapshot]

    if (after.get("in") != before.get("in")) {
      const v = after.get("in");

      // Write to 'other.out'
      //
      // Note: For writing to the same document, 'after.ref.set(...)' would also work.
      //
      await admin.firestore().doc("/temp/other").set({ out: v });

      console.debug("/temp/some{in} -> /temp/other{out}:", v);
    }
  })
***/

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

