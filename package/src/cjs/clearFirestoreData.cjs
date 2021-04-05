/*
* src/cjs/clear.cjs
*
* Based on '@firebase/rules-unit-testing' sources.
*
* Wanting to have our own, separate implementation, since a) this is different from testing rules, b) the official
* implementation on 'require' is using deprecated dependencies [1].
*
* [1]: https://github.com/request/request#deprecated
*     "As of Feb 11th 2020, request is fully deprecated."
*
* Note: Once Jest 'globalSetup' can take ES modules, make this into one.
*/
const assert = require('assert').strict;
const fetch = require('node-fetch');

const { FIRESTORE_HOST } = require("./config.cjs");

/*
*/
async function clearFirestoreData(opts) {   // ({ projectId: string }) => Promise of ()
  const {projectId} = opts;

  assert(projectId, "No 'projectId' to clear");

  const uri = `http://${FIRESTORE_HOST}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const body = JSON.stringify({
    database: `projects/${projectId}/databases/(default)`
  });

  let res;
  try {
    res = await fetch(uri, {method: 'DELETE', body});
  }
  catch(err) {
    const msg = `Failed to send DELETE to Firestore emulator at: ${uri}`;
    console.error(msg, err);
    throw err;    // original code passes such error (from 'require') on
  }

  if (res.status != 200) {    // '@firebase/rules-unit-tests' only tests for 200 (not 2xx)
    const msg = `Failed to 'DELETE' a Firestore project's data (status=${res.status}): ${res.body()}`;
    console.error(msg, err);
    throw new Error(msg);
  }
}

module.exports = clearFirestoreData;

