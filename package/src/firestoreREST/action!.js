/*
* src/firestoreREST/action!.js
*
* Handle the actual REST API access, including authentication.
*/
import fetch from 'node-fetch'

import { FIRESTORE_HOST } from '../config.js'

let path_v1;

function init(projectId) {  // (string) => ()
  path_v1 = `http://${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents`;
}

/*
* Checks whether we have access.
*
* Resolves to 'true' if access is granted, or an error message, describing why the access failed (as received from
* the emulator's response; may be useful for debugging the tests).
*/
async function action_v1(token, method, tail) {   // (string, 'GET'|..., string) => Promise of true|string

  const uri = `${path_v1}/${tail}`;

  const res = await fetch(uri, {method, headers: { ["Authorization"]: `Bearer ${token}` }})
    .catch( err => {
      const msg = `Failed to talk with Firestore emulator REST API: ${uri}`;
      console.error(msg, err);
      throw err;
    });

  // Success:
  //    200 with a JSON body
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'get' @ L21", "status": "PERMISSION_DENIED" } }
  //
  const status = res.status;

  if (status !== 200 && status !== 403) {
    const body = await res.text();
    const msg = `Unexpected response from '${uri}' (${res.status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }

  if (is2xx(status)) {
    return true;

  } else if (status === 403) {   // access denied
    // Note: response's 'error.message' can be helpful in test debugging (if you think the rule should pass).
    const json = await res.json();
    const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    return s;
  }
}

function is2xx(v) { return v >= 200 && v <= 299; }

export {
  init,
  action_v1
}
