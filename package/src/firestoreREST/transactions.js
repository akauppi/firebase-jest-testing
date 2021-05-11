/*
* src/firestoreREST/transactions.js
*/
import { FIRESTORE_HOST, projectId } from "../config";
import fetch from "node-fetch";

function fail(msg) { throw new Error(msg); }

const path_v1 = `http://${FIRESTORE_HOST}/v1/projects/${projectId}/databases/(default)/documents`;

/*
* Begins a transaction and returns the id provided for it, by the Firestore service.
*/
async function beginTransaction_v1(token) {    // (string) => Promise of string
  const method = 'POST';

  const res = await fetch(`${path_v1}:beginTransaction`, {method, headers: { ["Authorization"]: `Bearer ${token}` }})
    .catch( err => {
      const msg = `Failed to talk with Firestore emulator REST API: ${method} ${path_v1}`;
      console.error(msg, err);
      throw err;
    });

  const status = res.status;

  if (status === 200) {
    const json = await res.json();

    console.debug("!!!", json); // DEBUG
    throw new Error("11")

  } else {
    const msg = `Unexpected status (not 200): ${status}, ${ await res.text() }`;
    console.error(msg);
    throw new Error(msg);
  }
}

export {
  beginTransaction_v1
}