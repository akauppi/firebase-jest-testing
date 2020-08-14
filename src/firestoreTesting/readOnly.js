/*
* src/firestoreTesting/readOnly.js
*
* Layer above '@firebase/testing' FOR TESTING SECURITY RULES. Access is read-only (as far as the tests are concerned),
* meaning successful write/delete operations do NOT cause the data seen my other tests change.
*
* We are ONLY interested in working against an emulated Firestore instance, and only on the tests.
*
* Usage:
*   - '--harmony-top-level-await' node flag needed
*/
import { strict as assert } from 'assert'

import { firebase } from './firebase.js'
import { projectId } from './projectId.js'
import { emul } from './emul.js'

const PRIME_ROUND = !global.afterAll;   // check we are imported from a test (not 'globalSetup')
assert(!PRIME_ROUND);

/*
* Unlike in the Firestore API, we allow authentication to be set after collection.
*/
const dbAuth = {  // firebase.firestore.Firestore -like

  collection: collectionPath => {   // string => { as: ... }
    const collAdmin = firebase.initializeAdminApp({   // same for all auths
      projectId
    }).firestore().collection(collectionPath);

    return {
      as: auth => {   // { uid: string }|null => firebase.firestore.CollectionReference -like
        const collAuth = firebase.initializeTestApp({
          projectId,
          auth
        }).firestore().collection(collectionPath);

        return emul(collAdmin, collAuth);
      }
    };
  }
};

/*
* We know how to clean up after ourselves. Runs after all the tests (once per each suite).
*/
afterAll( async () => {   // () => Promise of ()
  await Promise.all( firebase.apps().map( app => { return app.delete(); }));
});

// Enable '.toAllow' and '.toDeny' matchers, as a side effect
import './matchers.js'

export {
  dbAuth
}
