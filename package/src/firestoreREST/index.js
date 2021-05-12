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
import { action_v1 } from './action!.js'
import { commit_v1, writeGen, writeDeleteGen } from './commit'

import { getUnlimited } from '../firestoreAdmin/getUnlimited'
import { createUnsecuredJwt } from '../rules-unit-testing/createUnsecuredJwt.js'

import { projectId } from '../config.js'

const tokenMap = new Map();

/*
* Fabricate a JWT.
*/
function getToken(uid) {   // (string) => string
  if (!tokenMap.has(uid)) {
    tokenMap.set(uid, createUnsecuredJwt(uid, projectId));
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

/*
* Check (over)writing a document
*/
async function setAs(uid, docPath, data) {    // (string, string, object) => Promise of true|string
  const token = getToken(uid);

  const writes = [
    writeGen(data, false),    // set
    await restoreGen(docPath)
  ];

  return commit_v1(token, writes);
}

/*
* Check merging to an existing document
*/
async function updateAs(uid, docPath, data) {    // (string, string, object) => Promise of true|string
  const token = getToken(uid);

  const writes = [
    writeGen(data, true),   // update
    await restoreGen(docPath)
  ];

  return commit_v1(token, writes);
}

/*
* Fetches the current document at 'docPath' (if it exists), and prepares a 'Write' entry that restores to that state.
*/
async function restoreGen(docPath) {  // (string) => Write
  const data = await getUnlimited(docPath);

  return data ? writeGen(was, false) : writeDeleteGen(docPath);
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
  getAs,
  setAs,
  updateAs,
  deleteAs
}
