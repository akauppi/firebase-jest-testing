/*
* intercom/index.js
*
* Context:
*   - for writing, the Jest setup
*   - for reading, execution of tests
*
* Jest doesn't really give good tools for communication between the Jest Setup and tests. Environment variables are
* limited in size. Using Firestore (db) is *tremendously* slow. Leaves us the file system that we slightly reluctantly
* use for this purpose.
*
* Track:
*   - "Allow to share global state between tests from globalSetup" (Jest Issues)
*     -> https://github.com/facebook/jest/issues/7184
*   - "Per worker setup/teardown" (Jest Issues)
*     -> https://github.com/facebook/jest/issues/8708
*/
import { strict as assert } from 'assert'
import { writeFile, readFile } from 'fs/promises'
import { unlinkSync } from 'fs'

import { PRIME_ROUND, projectId as testProjectId } from '../config.js'

/*
* Write the primed data as a JSON file.
*
* Note: Date objects are serialized so that they can be retrieved back as dates.
*/
async function writeTemp(projectId, data) {   // (string, { <docPath>: { <field>: <value> } }) => Promise of ()
  assert(PRIME_ROUND);

  const path = fn(projectId);
  await writeFile( path, JSON.stringify(data) )

  // Self cleanup
  //
  process.on('exit', () => {
    unlinkSync(path);
  });
}

async function readTemp() {   // () => Promise of object
  assert(!PRIME_ROUND && testProjectId);

  const path = fn(testProjectId)

  const o = await readFile(path, { encoding: "utf8" })
    .then( JSON.parse )

  return deserialize(o);
}

/*
* Craft a (temporary) file name for exchanging data from setup to tests.
*/
function fn(projectId) {    // (string?) => path

  return `node_modules/.${projectId}.data.tmp`;
}

/*
* Serialize/deserialize 'Date' objects so they can be passed from setup to tests.
*
* Serialization:
*   - 'JSON.stringify' nicely converts 'Date' values into ISO 8601 strings.
*
* De-serialization:
*   - convert any ISO 8601 strings to 'Date' (yes, they could have started their life as strings, we won't know)
*/
function deserialize(x) {   // (Array|object|string|number|boolean) => Array|object|string|number|boolean|Date

  if (typeof x === 'string' && ReIsoDate.test(x)) {
    return new Date(x);

  } else if (Array.isArray(x)) {
    return x.map(deserialize);    // recursive

  } else if (typeof x === 'object') {
    const tmp = Object.entries(x).map( ([k,v]) => [k, deserialize(v)] );    // recursive
    return Object.fromEntries(tmp);
  }
  return x;   // unchanged
}

const ReIsoDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

export {
  writeTemp,
  readTemp
}
