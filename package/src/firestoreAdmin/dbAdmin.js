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
function eventually(docPath, p, timeoutMs) {    // (string, (object|null) => boolean, ms?) => Promise of object|null|false

  return new Promise( (resolve) => {
    let unsub;
    let timer;

    // Note: JavaScript doesn't have cancellable Promises, but a promise can be timed out from within.
    //
    if (timeoutMs) {
      timer = setTimeout( _ => {
        resolve(false);   // timed out
        unsub();
      }, timeoutMs);
    }

    unsub = dbAdmin.doc(docPath).onSnapshot( ss => {
      const o = ss.exists ? ss.data() : null;

      if (p(o)) {
        if (timer) clearTimeout(timer);
        unsub();
        resolve(o);
      }
    });
  })
}

export {
  dbAdmin,
  eventually
}
