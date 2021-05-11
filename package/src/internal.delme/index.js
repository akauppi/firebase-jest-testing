/*
* src/firebase-admin/index.js
*
* No comment
*/

// firebase-admin 9.7.0, 9.6.0:
//import * as admin from 'firebase-admin';
//  ^-- gives "admin.initializeApp is not a function"

// firebase-admin 9.7.0, 9.6.0:
//import admin from 'firebase-admin';
//  ^-- gives "Cannot read property 'INTERNAL' of undefined" (unknown what's the reason...)

import { default as admin } from 'firebase-admin'

const {
  initializeApp
} = admin;

export {
  initializeApp
}
