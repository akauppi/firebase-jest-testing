/*
* src/firestoreAdmin/dbAdmin.js
*
* Context:
*   Always called within tests
*/
import { strict as assert } from 'assert'
import {PRIME_ROUND} from '../config.js'
assert(!PRIME_ROUND);

//import { initializeApp } from 'firebase-admin/app'    // modular API (in alpha)
import { default as admin } from 'firebase-admin'     // current stable API

import {FIRESTORE_HOST, projectId} from '../config.js'

/*
* All the exposed methods operate on this one Firestore Admin app. This hides emulator configuration from the rest.
*/
const dbAdmin = (_ => {
  const adminApp = admin.initializeApp({
    projectId
  }, `unlimited-${ Date.now() }`);   // unique name keeps away from other "apps" (configurations, really); btw. would be nice if Firebase APIs had nameless "apps" easier.

  const db = adminApp.firestore();
  db.settings({
    host: FIRESTORE_HOST,
    ssl: false
  });

  afterAll( async () => {   // clean up, automatically
    await adminApp.delete();
  });

  return db;
})();

/*
* Wait for a document to change so that predicate 'p' becomes true.
*
* If 'timeoutMs' is provided, times out after that time.
*
* Resolves with:
*   object|null (the value of the object, or that it's not there) when the predicate holds
*   false if timed out
*/
function eventually(docPath, p, timeoutMs) {    // (string, (object|null) => boolean, ms?) => Promise of object|null|undefined
  // Undocumented: if 'p' omitted, just wait for any document
  p = p || (o => !!o);

  return new Promise( (resolve) => {
    let unsub;
    let timer;

    // Note: JavaScript doesn't have cancellable Promises, but a promise can be timed out from within.
    //
    if (timeoutMs) {
      timer = setTimeout( _ => {
        resolve(undefined);   // timed out    // tbd. best API style for conveying timeout, still in flux
        unsub();
      }, timeoutMs);
    }

    unsub = dbAdmin.doc(docPath).onSnapshot( ss => {
      const o = ss.exists ? ss.data() : null;

      if (p(o)) {
        if (timer) clearTimeout(timer);
        resolve(o);
        unsub();
      }
    });
  })
}

/*
* Listener for a collection.
*
* Note: Setting up the first listener to a collection carries a 300..320 ms penalty. By pre-warming the listening
*     (if the test application sets up the listener in, say, 'beforeAll'), we can make the test times *seem* faster,
*     dropping from ~570..620ms to ~280ms. However, this is a VISUAL TRICK since the overall execution time remains
*     the same - now the delay simply is moved to the test preparation, instead of test execution.
*
*     Ideally, setting up a Firestore listener (with emulator) could be sped up by Firebase. It likely doesn't need to
*     take ~300ms? #contribute: ask them
*/
function listener_EXP(collPath) {    // (string) => (string, ((object|null) => boolean)?)) => Promise of object|null

  // Dummy listener that may be executed already in 'beforeAll' (depends on the test application, of course).
  //
  const unsub = dbAdmin.doc(`${collPath}/...`).onSnapshot( ss => {} );
  unsub();

  return (docId, p, timeoutMs) => {
    return eventually(`${collPath}/${docId}`, p, timeoutMs);
  }
}

export {
  dbAdmin,
  eventually,

  // EXPERIMENTAL
  listener_EXP
}
