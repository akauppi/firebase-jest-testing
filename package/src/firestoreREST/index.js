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
//import { init as initToken } from './token.js'
import { init as initAction } from './action!.js'

import { action_v1 } from './action!.js'
//import { getToken } from './token.js'

import { createUnsecuredJwt } from '../rules-unit-testing/index.js'

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
  //initToken(projectId);
  initAction(projectId);

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
* Reference:
*   https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/get
*/
async function getAs(uid, docPath) {    // (string, string) => Promise of ()
  const token = getToken(uid);

  await action_v1(token, 'GET', docPath);
}

async function setAs(uid, docPath, v) {   // (string, string, any) => Promise of ()
  const token = getToken(uid);

  throw new Error("not implemented!");
}

async function deleteAs(uid, docPath) {   // (string, string) => Promise of ()
  const token = getToken(uid);

  throw new Error("not implemented!");
}

export {
  init,
  getAs,
  setAs,
  deleteAs
}
