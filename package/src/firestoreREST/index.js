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
//import { strict as assert } from 'assert'

import { action_v1, delete_v1 } from './action!.js'
import { commit_v1, writeGen } from './commit'

import { createUnsecuredJwt } from '../rules-unit-testing/createJwt.js'

import { projectId } from '../config.js'

const tokenMap = new Map();

/*
* Fabricate a JWT.
*/
function getToken(uid) {   // (string|null) => string|null
  if (uid === null) return null;    // guests should not even add an auth header

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
function getAs(uid, docPath) {    // (string|null, string) => Promise of true|string
  const token = getToken(uid);

  return action_v1(token, 'GET', docPath);
}

/*
* Check (over)writing a document
*/
async function setAs(uid, docPath, data) {    // (string|null, string, object) => Promise of true|string
  const token = getToken(uid);

  const writes = [
    writeGen(docPath, data, false),    // set
  ];

  return commit_v1(token, writes);
}

/*
* Check merging to an existing document
*/
async function updateAs(uid, docPath, data) {    // (string|null, string, object) => Promise of true|string
  const token = getToken(uid);

  const writes = [
    writeGen(docPath, data, true),   // update
  ];

  return commit_v1(token, writes);
}

// https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/delete
//
function deleteAs(uid, docPath) {   // (string|null, string) => Promise of true|string
  const token = getToken(uid);

  return delete_v1(token, docPath);
}

export {
  getAs,
  setAs,
  updateAs,
  deleteAs
}
