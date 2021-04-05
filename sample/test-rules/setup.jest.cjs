/*
* sample/test-rules/setup.jest.cjs
*
* Note! Jest 2.4.0 does NOT allow this to be an ES module!
*     See -> https://github.com/facebook/jest/issues/9430#issuecomment-653818834
*
* Sets the (immutable) data for the Rules tests.
*/
//import { docs } from './docs.js'
const docs = require('./docs.cjs');

// We just know it is (until ES modules)
//
//import { projectId } from './projectId.js'
const projectId = "rules-test";

//import { clearAndPrime } from './tools/clearAndPrime.js'
const cjsTools = require('firebase-jest-testing/cjs');    // until Jest 27 allows us to use ES modules, for setup
const { clearFirestoreData, prime } = cjsTools;

const setup = async _ => {
  // Clear the existing data and prime with ours

  await clearFirestoreData({projectId});
  await prime(projectId, docs);

  console.debug("Docs primed for test-rules.");
}

//export default setup;
module.exports = setup;
