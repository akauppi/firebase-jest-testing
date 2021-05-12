/*
* src/firestoreRules/collection.js
*
* The pseudo-API (similar to Firebase or Firebase-admin APIs, though those are currently in flux).
*/

import { getAs, setAs, updateAs, deleteAs } from '../firestoreREST/index.js'

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
    get: () => {    // () => Promise of true|string
      return getAs(uid, documentPath);
    },

    // Firestore 8.x client API has separate 'set' and 'update'.
    //
    // '.set' overwrites the doc if it exists, and creates a new one if it doesn't.
    // '.update' merges the fields with the existing document ("updates fields in the document"). It fails if the doc
    //    does not already exist.
    //
    // From the point of view of Security Rules testing:
    //  - '.set' may need either 'create' or 'update' rule, depending on the state of the data
    //  - '.update' always needs just 'update' rule
    //
    // Note that the '.set' here only tests either being able to create a doc (if one doesn't exist, already) or being
    //    able to update one (if it does). In order to test both, the _test_ must include two sets: one to an existing
    //    doc ref and another to a clear one. (Naturally, no such doc gets created, because of our immutability cover).
    //
    set: (data) => {    // (object) => Promise of true|string
      return setAs(uid, documentPath, data);
    },
    update: (data) => {    // (object) => Promise of true|string
      return updateAs(uid, documentPath, data);
    },

    delete: () => {     // () => Promise of true|string
      return deleteAs(uid, documentPath)
    }
  };
}

export { collection }
