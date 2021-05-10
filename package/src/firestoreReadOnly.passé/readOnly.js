/*
* src/firestoreReadOnly/readOnly.js
*
* Accessing an emulated
*
*
* Layer above '@firebase/rules-unit-testing'. Access is read-only (as far as the tests are concerned),
* meaning successful write/delete operations do NOT cause the data seen by other tests change.
*
* We are ONLY interested in working against an emulated Firestore instance, and only on the tests.
*/
import { strict as assert } from 'assert'

import firebase from '@firebase/rules-unit-testing'
import admin from 'firebase-admin'

import { projectId, PRIME_ROUND } from './common.js'
import { emul } from './emul.js'

assert(!PRIME_ROUND);

/*
* Create an "admin" Firestore instance, for restoring the values.
*
* Note: We could use '.initializeAdminApp' but since it's just a veneer above 'firebase-admin', we use that straight.
*/
const adminApp = admin.initializeApp({
  projectId
}, "rules-test-admin" );    // keep away from other apps; not needed to be random since initialized only once

/*
* Unlike in the Firestore API, we allow authentication to be set after collection.
*/
const dbAuth = {  // firebase.firestore.Firestore -like

  collection: collectionPath => {   // string => { as: ... }
    const collAdmin = adminApp.firestore()
        .collection(collectionPath);

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
  const apps = [ adminApp, ...firebase.apps() ];

  await Promise.all( apps.map( app => { return app.delete(); }));
});

export {
  dbAuth
}
