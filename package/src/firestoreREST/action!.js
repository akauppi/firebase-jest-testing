/*
* src/firestoreREST/action!.js
*
* Handle the actual REST API access, including authentication.
*/
import fetch from 'node-fetch'

import { FIRESTORE_HOST } from '../config.js'

let baseUri_v1;

function init(projectId) {  // (string) => ()
  baseUri_v1 = `http://${FIRESTORE_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
}

/*
*/
async function action_v1(token, method, tail) {   // (string, 'GET'|..., string) => Promise of Result

  const res = await fetch(`${uri_v1}/${tail}`, {method, headers: { ["Authorization"]: `Bearer ${token}` }})
    .catch( err => {
      const msg = `Failed to talk with Firestore emulator REST API: ${uri}`;
      console.error(msg, err);
      throw err;
    });

  if (!is2xx(res.status)) {
    const body = await res.text();
    const msg = `Non-2xx status from '${uri}' (${res.status}): ${body}`;
    console.error(msg);
    throw new Error(msg);
  }

  console.debug("Received:", await res.text());   // DEBUG

  return res;   // Caller doesn't really need any info; we pass the 'res' for now. tbd.
}

function is2xx(v) { return v < 200 || v > 299; }

export {
  init,
  action_v1
}
