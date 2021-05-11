/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/
import { docs } from './docs.js'

import { projectId } from 'firebase-jest-testing/firestoreRules/setup'
import { init, prime } from 'firebase-jest-testing/firestoreAdmin'

async function setup() {
  init(projectId);
  await prime(docs);
}

export default setup;
