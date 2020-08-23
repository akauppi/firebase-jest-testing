/*
* src/firestoreTesting/index.js
*
* Firestore constants usable in tests.
*
* Note: e.g. 'FieldValue' only makes sense in the tests, but since these are like peek-throughs to Firebase API,
*     wanted to not have them clutter 'firestoreTestingReadOnly'.
*/
import firebase from '@firebase/rules-unit-testing'

const FieldValue = firebase.firestore.FieldValue;

export {
  FieldValue
}
