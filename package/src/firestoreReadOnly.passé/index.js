/*
* src/firestoreReadOnly/index.js
*/
import firebase from '@firebase/rules-unit-testing'

const FieldValue = firebase.firestore.FieldValue;

import { dbAuth } from './readOnly.js'

// Enable '.toAllow' and '.toDeny' matchers, as a side effect
import './matchers.js'

export {
  dbAuth,
  FieldValue
}
