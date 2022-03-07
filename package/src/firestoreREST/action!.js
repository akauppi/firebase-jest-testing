/*
* src/firestoreREST/action!.js
*
* Handle the actual REST API access, including authentication.
*/
import { fetch } from 'undici'

import { path_v1 } from './common'

/*
* Checks whether we have access.
*
* Resolves as:
*   true: access granted
*   string: access denied (reason)
*/
async function get_v1(token, docPath) {   // (string|null, string) => Promise of true|string
  return await myFetch(docPath,'GET',token);
}

/*
* Delete a document, using Firestore REST API
*
* Resolves as:
*   true: deletion succeeded
*   string: access denied (reason)
*/
async function delete_v1(token, docPath) {   // (string|null, string) => Promise of true|string
  return await myFetch(docPath, 'DELETE', token);
}

/*
* Resolves as:
*   true: access granted
*   string: access denied (reason)
*/
async function myFetch(docPath, method, token) {    // (string, string, string) => true|string  ; throws on unexpected responses
  const uri = `${path_v1}/${docPath}`;

  const res= await fetch(uri, {method, headers: token ? { "Authorization": `Bearer ${token}` } : {} });

  // Access ('GET'):
  //    200 with a JSON body ('Document' Firestore data type)
  //    404 (Not Found) if the doc does not exist
  //
  // Access ('DELETE'):
  //    200
  //
  // No access:
  //    403 (Forbidden) with body (white space added for clarity):
  //      { "error": { "code": 403, "message": "\nfalse for 'get' @ L21", "status": "PERMISSION_DENIED" } }

  const status = res.status;

  // Emulator only provides 200 result (all 2xx would be success).
  //
  if (status === 200 || (method === 'GET' && status === 404)) {
    return true;

  } else if (status === 403) {   // access denied
                                 // Note: response's 'error.message' can be helpful in test debugging (if you think the rule should pass).
    const json = await res.json();
    const s = json.error.message || fail("No 'error.message' in denied response from emulator.");
    return s;

  } else {    // other status codes
    const body = await res.text();
    const msg = `Unexpected response from ${method} ${uri} (${status}): ${body}`;
    throw new Error(msg);
  }
}

export {
  get_v1,
  delete_v1
}
