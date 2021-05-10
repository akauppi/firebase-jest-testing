/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/

// firebase-admin 9.7.0, 9.6.0:
//import * as admin from 'firebase-admin';
//  ^-- gives "admin.initializeApp is not a function"

// firebase-admin 9.7.0, 9.6.0:
//import admin from 'firebase-admin';
//  ^-- gives "Cannot read property 'INTERNAL' of undefined" (unknown what's the reason...)

import { default as admin } from 'firebase-admin'

//const admin = await import('firebase-admin');

import { docs } from './docs.js'

import { projectId } from 'firebase-jest-testing/firestoreRules/setup'
import { init, prime } from 'firebase-jest-testing/firestoreAdmin'

async function setup() {

  const adminApp = admin.initializeApp({
    projectId
  }, `rest-${ Date.now() }`);   // unique; keep away from other "apps" (configurations, really); btw. would be nice if Firebase APIs had nameless "apps" easier.

  init(projectId);
  await prime(projectId, docs);

  console.debug("Docs primed for test-rules.");
}

export default setup;
