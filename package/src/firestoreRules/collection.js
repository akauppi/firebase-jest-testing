/*
* src/firestoreRules/collection.js
*
* The pseudo-API (similar to Firebase or Firebase-admin APIs, though those are currently in flux).
*/

import { getAs, patchAs, deleteAs } from '../firestoreREST/index.js'

function fail(msg) { throw new Error(msg); }

/*
* Unlike in the Firestore API, we allow authentication to be set after collection.
*/
function collection(collectionPath) {   // string => { as: ... }

  return {
    as: (o) => {   // ({ uid:string }|null) => firebase.firestore.CollectionReference -like
      const uid = o ? o.uid : null;

      return {
        doc: docPath => {
          return documentAs(uid, `${collectionPath}/${docPath}`);
        },

        // Try to get any (all) documents of the collection.
        //
        // Note: With the JS clients, this returns a QueryDocumentSnapshot of documents in the collection. That does
        //    not seem to be available in the REST API, and to keep things simple, we just check a single document.
        //    Is this enough for the needs of checking access?
        //
        get: () => {    // () => Promise of true|string
          return getAs(uid, "any");
        }
      }
    }
  };
}

function documentAs(uid, documentPath) {   // (string, string) => { get, set, delete }

  return {
    get: () => {
      return getAs(uid, documentPath);
    },

    // REST API has separate "patch" and "create". We just map "set" to the patching - is that ok?
    //
    set: (data) => {
      return patchAs(uid, documentPath, data);
    },

    delete: () => {
      return deleteAs(uid, documentPath)
    }
  };
}

export { collection }
