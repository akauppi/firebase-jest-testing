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
import util from 'util'   // for JSON logging

import { strict as assert } from 'assert'
import fetch from 'node-fetch'

import { path_v1 } from './common'
import { projectId } from '../config'

import { splitSentinels } from './sentinels'

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
async function commit_v1(token, writes) {   // (string|null, Array of Write) => Promise of true|string
  const [method, uri] = ['POST', `${path_v1}:commit`];

  const body = JSON.stringify({
    writes
    // 'transaction' not needed - doing all at once
  });

  //console.log("!!! Fetch", { token, uri, method, body } );  // DEBUG

  const res = await fetch(uri, {method, headers: token ? { "Authorization": `Bearer ${token}` } : {}, body })
  const status = res.status;

  // Access:
  //    200 with an empty JSON body ({\n}) if writes succeeded
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'create' @ L262", "status":"PERMISSION_DENIED" } }

  // Emulator only provides 200 result (all 2xx would be success).
  //
  if (status === 200) {
    return true;

  } else if (status === 403) {   // access denied
    const json = await res.json();
    const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    return s;

  } else {    // other status codes
    const body = await res.text();
    const msg = `Unexpected response from ${method} ${uri} (${status}): ${body}`;
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
function writeGen(docPath, o, merge) {    // (string, object, boolean) => Write

  debugger;
  // Process 'o', removing keys that carry a sentinel. Create a separate transforms object from them.
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

    update: {
      name: `projects/${projectId}/databases/(default)/documents/${docPath}`,
      ...mapValue(oRemains)   // 'Document' is just like an extended 'MapValue'
    }
  };

  //console.debug("!!! Write:", util.inspect(write, {depth: null}));    // DEBUG

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

  console.debug("DELETE WRITE:", docPath);
  return {
    delete: `projects/${projectId}/databases/(default)/documents/${docPath}`
  }
}

/*
* Convert a JSON object (where sentinel values have been removed) into a 'MapValue':
*
*   {
*     fields: {
*       "some-key": {  // Value:
*         nullValue: null
*         | booleanValue: boolean
*         | integerValue: string        // not used by us (shipping numbers always as double)
*         | doubleValue: number
*         | timestampValue: string      // RFC3339 format
*         | stringValue: string         // UTF-8
*         | bytesValue: string          // base64 encoded; not used by us
*         | referenceValue: string      // not used by us
*         | geoPointValue: LatLng       // not used by us (not important for Security Rules testing)
*         | arrayValue: { values: Array of Value }    // except no support for array of arrays
*         | mapValue: { fields: { <key>: Value } }
*       }
*       , ...
*     }
*   }
*
* Note: Undefined values are simply skipped. They are used as markers for removing a field.
*
* See:
*   https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents#Document
*   https://firebase.google.com/docs/firestore/reference/rest/v1/Value
*/
function mapValue(o) {    // (object) => { fields: ... }
  assert(typeof o === 'object');

  const pairs = Object.entries(o).map(([k, v]) => {
    if (v === undefined) { return null }    // skip fields with 'undefined' value. 'deleteField' sentinel uses this.

    return [k, value(v)]
  }).filter( x => x );
  const fields = Object.fromEntries(pairs);

  return { fields };
}

function value(v) {   // (any) => { nullValue: null | ... }

  switch( typeof v ) {
    case 'boolean': return { booleanValue: v }
    case 'number': return { doubleValue: v }
    case 'string': return { stringValue: v }

    case 'object':    // null,Date,
      if (v === null) return { nullValue: null }
      if (Array.isArray(v)) return { arrayValue: arrayValue(v) };
      if (v instanceof Date) return { timestampValue: v.toISOString() }   // tbd. is the format correct (RFC3339 with UTC "Zulu")?

      return { mapValue: mapValue(v) };
  }
}

function arrayValue(a) {  // (Array of any /*except Array*/) => { values: Array of Value }
  return { values: a.map(value) };
}

export {
  commit_v1,
  writeGen,
  writeDeleteGen,

  // for 'sentinels.js'
  arrayValue
}
