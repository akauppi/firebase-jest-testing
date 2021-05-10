/*
* sample/test-fns/setup.jest.js
*
* Sets the data for functions tests (default project id).
*/
import { prime } from 'firebase-jest-testing/firestoreAdmin'
import { docs } from './docs.js'

function fail(msg) { throw new Error(msg); }

const projectId = process.env["GCLOUD_PROJECT"]
  || fail("Please provide 'GCLOUD_PROJECT' env.var. with project id.");

const setup = async _ => {
  await prime(projectId, docs);
}

export default setup;
