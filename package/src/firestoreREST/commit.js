/*
* src/firestoreREST/commit.js
*
* The 'commit' API.
*
* Forget about 'createDocument' and 'patch' - they don't support 'serverTimestamp' (and other such) sentinels (ehem,
* "transforms" in the Firebase lingo). Also, 'commit' does what they do so there's no need for them.
*
* Documentation (lack of):
*
*   The "transforms" side is greatly under-documented by Firebase. Here are the tidbits this code is based upon:
*
*   - SO question from 2018 (with one answer!):
*     -> https://stackoverflow.com/questions/53943408/firestore-rest-api-add-timestamp
*   - commit API
*     -> https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/commit
*     -> https://firebase.google.com/docs/firestore/reference/rest/v1/Write
*/
import fetch from 'node-fetch'

import { path_v1 } from './common'
import { projectId } from '../config'

import { serverTimestampSentinel } from '../firestoreRules/sentinels'

/*
* Carry out writes to Firestore.
*
* These are applied atomically, and (presumably) Security Rules would disallow if any of the writes is not allowed.
*
* This allows us to:
*   - 1st write the change we're testing for
*   - 2nd write the earlier contents back (not changing anything)
*
*   If that works, there is no need for locks but we still always play against an immutable database. Yayyy!!! 😄
*
* Resolves to 'true' if (all) access is granted, or an error message, describing why the access failed (as received from
* the emulator's response; may be useful for debugging the tests).
*/
async function commit_v1(token, writes) {   // (string, Array of Write) => Promise of true|string
  const [method, uri] = ['POST', `${path_v1}:commit`];

  const body = JSON.stringify({
    writes,
    // 'transaction' not needed - doing all at once
  });

  const res = await fetch(uri, {method, headers: { ["Authorization"]: `Bearer ${token}`, body }})
    .catch( err => {
      const msg = `Failed to talk with Firestore emulator REST API: ${method} ${uri}`;
      console.error(msg, err);
      throw err;
    });

  // Access:
  //    200 with a JSON body if writes succeeded
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { ...tbd... }

  const status = res.status;

  // Emulator only provides 200 result (all 2xx would be success).
  //
  if (status === 200) {
    return true;

  } else if (status === 403) {   // access denied
    console.log("!!!", await res.text())

    throw new Error("unfinished!");
    //const json = await res.json();
    //const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    //return s;

  } else {    // other status codes
    const body = await res.text();
    const msg = `Unexpected response from ${method} ${uri} (${status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }
}

/*
* Helper for creating the 'Write' objects.
*
* Study [1] properly.
*
* In particular:
*   Firebase uses "update" in two different meanings. The distinction is crucial to be aware of. The JS client has
*   'update' and 'set'. Both of these can be implemented with the 'updateMask' of the 'Write' object, so we only need
*   to support the "update" operation (there is no "set" operation) of the 'Write'. Clear? 🧐
*
* 'merge':
*   false:  like the client 'set' (overwrites whole doc; doc does not need to pre-exist)
*   true:   like the client 'update' (merges the keys; doc needs to pre-exist)
*
* [1]: https://firebase.google.com/docs/firestore/reference/rest/v1/Write
*/
function writeGen(o, merge) {    // (object, boolean) => Write

  debugger;
  // Process 'o', removing keys that carry the 'serverTimestamp_Sentinel'. Create a separate transforms object from them.
  //
  const [oRemains, transforms] = splitSentinels(o);

  const write = {
    // 'updateMask'
    // "If the mask is not set for an 'update' and the document exists, any existing data will be overwritten."
    // "If the mask is set and the document on the server has fields not covered by the mask, they are left unchanged."
    //
    ...(merge ? { updateMask: { fieldPaths: Object.keys(oRemains) }}: {}),

    // 'updateTransforms'
    ...((transforms.length > 0) ? { updateTransforms: transforms } : {}),

    // 'currentDocument'
    // For 'merge', require that the document pre-exist.
    ...(merge ? { currentDocument: { "exists": true } } : {}),

    update: oRemains
  };
  return write;
}

/*
* Create a 'Write' object for deleting a document.
*
* References:
*   - Firestore REST API > Write: https://firebase.google.com/docs/firestore/reference/rest/v1/Write
*/
function writeDeleteGen(docPath) {    // (string) => Write

  // Note: We don't set a precondition for the document to exist (one could, using 'currentDocument').

  return {
    delete: `projects/${projectId}/databases/(default)/documents/${docPath}`
  }
}

/*
* Split sentinels for the 'commit' REST API.
*
* Note: Currently does a shallow scan, but can be implemented as recursive if needed.
*/
function splitSentinels(o) {    // (object) => [object, Array of FieldTransform]
  const transforms = [];

  const pairs = Object.entries(o).map( ([k,v]) => {
    if (v === serverTimestampSentinel) {
      transforms.push( {
        fieldPath: k,   // note: if doing recursive, we must prepend the field paths
        ["setToServerValue"]: 'REQUEST_TIME'
      });
      return undefined;
    } else {
      return [k,v];
    }
  }).filter(x => x);

  const o2 = Object.fromEntries(pairs);
  return [o2,transforms];
}

export {
  commit_v1,
  writeGen,
  writeDeleteGen
}
