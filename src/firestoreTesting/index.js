/*
* src/firestoreTesting/index.js
*
* Things common (potentially) to both priming and Security Rules tests.
*
* Note: e.g. 'FieldValue' only makes sense in the tests, but since these are like peek-throughs to Firebase API,
*     wanted to not have them clutter 'firestoreTestingReadOnly'.
*/
import firebase from '@firebase/testing'

const FieldValue = firebase.firestore.FieldValue;

export {
  FieldValue
}
