/*
* src/firestoreRules/collection.js
*
* The pseudo-API (similar to Firebase or Firebase-admin APIs, though those are currently in flux).
*/

import { getAs, setAs, deleteAs } from '../firestoreREST/index.js'

//function fail(msg) { throw new Error(msg); }

/*
* Unlike in the Firestore API, we allow authentication to be set after collection.
*/
function collection(collectionPath) {   // string => { as: ... }

  return {
    as: uid => ({   // (string|null) => firebase.firestore.CollectionReference -like

      doc: docPath => {
        return documentAs(uid, `${collectionPath}/${docPath}`);
      }

      /*get: () => {
      }*/
    })
  };
}

function documentAs(uid, documentPath) {   // (string, string) => { get, set, delete }

  return {
    get: () => {
      return getAs(uid, documentPath);
    },
    set: (data) => {
      return setAs(uid, documentPath, data);
    },
    delete: () => {
      return deleteAs(uid, documentPath)
    }
  };
}

export { collection }
