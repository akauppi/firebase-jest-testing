/*
* src/firestoreREST/action!.js
*
* Handle the actual REST API access, including authentication.
*/
import fetch from 'node-fetch'

import { path_v1 } from './common'

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

  // Access:
  //    200 with a JSON body if 'get' and the doc exists
  //    404 (Not Found) if 'get' and the doc does not exist
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'get' @ L21", "status": "PERMISSION_DENIED" } }

  const status = res.status;

  // Emulator only provides 200 result (all 2xx would be success).
  //
  if (status === 200 || status === 404) {
    return true;

  } else if (status === 403) {   // access denied
    // Note: response's 'error.message' can be helpful in test debugging (if you think the rule should pass).
    const json = await res.json();
    const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    return s;

  } else {    // other status codes
    const body = await res.text();
    const msg = `Unexpected response from '${uri}' (${status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }
}

export {
  action_v1
}
