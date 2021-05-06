/*
* sample/test-rules/setup.jest.js
*
* Sets the (immutable) data for the Rules tests.
*/
import { docs } from './docs.js'

import { clearAll, prime } from 'firebase-jest-testing/firestore'

const setup = async _ => {
  // Clear the existing data and prime with ours

  await clearAll();
  await prime(docs);

  console.debug("Docs primed for test-rules.");
}

export default setup;
