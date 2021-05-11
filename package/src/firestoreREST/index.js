/*
* src/firestoreREST/index.js
*
* Accessing Firestore with Security Rules applied - but without a dedicated client. The problem with clients is that
* they leak through to the downstream application, and dictate whether it should use 8.x or 9.x API. We don't want that.
* Also, this reduces the install size of the library (but that's a secondary consideration).
*
* Note: We let the caller initialize the project ID, but in practise this is only use from 'firestoreRules' (with a
*     fixed project id).
*/
import { init as initUnlimited } from './getUnlimited.js'
import { init as initAction } from './action!.js'
import { init as initTransactions } from './transactions.js'

import { action_v1 } from './action!.js'
import { beginTransaction_v1 } from './transactions.js'

import { createUnsecuredJwt } from '../rules-unit-testing/createUnsecuredJwt.js'

let createToken;    // uid => token; fixed for the project id

/*
* Provide the project id to be used. Same for all tests (Jest runs test suites in isolated Node.js universes).
*
* Returns a 'destroy' function that must be called - and waited for - at the end of tests.
*/
function init(projectId) {    // (string) => (() => Promise of ())

  // Pass the initialization to minions.
  //
  const release = initUnlimited(projectId);
  initAction(projectId);
  initTransactions(projectId);

  createToken = (uid) => {
    return createUnsecuredJwt(uid, projectId);
  }

  return release;
}

const tokenMap = new Map();

/*
* Fabricate a JWT.
*/
function getToken(uid) {   // (string) => string
  if (!tokenMap.has(uid)) {
    tokenMap.set(uid, createToken(uid));
  }
  return tokenMap.get(uid);
}

/*
* Check getting a single document
*
* https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/get
*/
function getAs(uid, docPath) {    // (string, string) => Promise of true|string
  const token = getToken(uid);

  return action_v1(token, 'GET', docPath);
}

// https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/patch
//
async function patchAs(uid, docPath, dataObj) {   // (string, string, object) => Promise of true|string
  const token = getToken(uid);

  // Get existing value
  //tbd. const was = getUnlimited(docPath);

  // Patch and set back, as a transaction. #later
  //
  /***const o2 = await beginTransaction_v1(token);
  const transactionId = o2.transaction;    // eg. "EXoAAAAAAAAA"
  ***/

  // 🚧🚧🚧 WARNING: trying our luck, no locking

  const ret = await action_v1(token, 'PATCH', docPath, dataObj);

  if (ret === true) {   // it passed
    //tbd. setUnlimited(docPath);
  }

  return ret;
}

// https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/delete
//
function deleteAs(uid, docPath) {   // (string, string) => Promise of true|string
  const token = getToken(uid);

  throw new Error("tbd. transaction!!")
  // tbd. transaction!!
  //return action_v1(token, 'DELETE', docPath);
}

export {
  init,
  getAs,
  patchAs,
  deleteAs
}
