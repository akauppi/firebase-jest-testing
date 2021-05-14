/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/
import { docs } from './docs.js'

import { prime } from 'firebase-jest-testing/firestoreAdmin'

const projectId = "rules-test";   // must be lower case

async function setup() {
  await prime(projectId, docs);
}

export default setup;
