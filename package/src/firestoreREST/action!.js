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
async function action_v1(token, method, tail) {   // (string|null, 'GET'|..., string) => Promise of true|string
  const res = await myFetch(tail,method,token);
    // fine with the default error

  const status = res.status;

  // Access:
  //    200 with a JSON body ('Document' Firestore data type) if 'get' and the doc exists
  //    404 (Not Found) if 'get' and the doc does not exist
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'get' @ L21", "status": "PERMISSION_DENIED" } }

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
    const msg = `Unexpected response from ${method} ${uri} (${status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }
}

/*
* Delete a document, using Firestore REST API
*
* Resolves as:
*   true: deletion succeeded
*   string: access denied (reason)
*/
async function delete_v1(token, docPath) {   // (string|null, string) => Promise of true|string

  const res = await myFetch(docPath, 'DELETE', token);

  const status = res.status;

  // Access:
  //    200 with a JSON body (...)
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'get' @ L21", "status": "PERMISSION_DENIED" } }

  // Emulator only provides 200 result (all 2xx would be success).
  //
  if (status === 200) {
    return true;

  } else if (status === 403) {   // access denied
                                 // Note: response's 'error.message' can be helpful in test debugging (if you think the rule should pass).
    const json = await res.json();
    const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    return s;

  } else {    // other status codes
    const body = await res.text();
    const msg = `Unexpected response from ${method} ${uri} (${status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }
}

async function myFetch(docPath, method, token) {
  const uri = `${path_v1}/${docPath}`;

  return await fetch(uri, {method, headers: token ? { ["Authorization"]: `Bearer ${token}` } : {} });
}

export {
  action_v1,
  delete_v1
}
