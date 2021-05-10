/*
* src/firestoreRules/common.js
*/
import { projectId } from './setup/index.js'

const PRIME_ROUND = !global.afterAll;   // are imported from 'globalSetup', or from the tests

export {
  projectId,
  PRIME_ROUND
}
