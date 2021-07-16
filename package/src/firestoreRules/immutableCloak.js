/*
* src/firestoreRules/immutableCloak.js
*/
import { performance } from 'perf_hooks'
import { beforeAll } from '@jest/globals'

import { dbAdmin } from '../firestoreAdmin/dbAdmin'
import { claimLock } from './lockMe'

import { init, getPrimed_sync } from './shadow'

// Two implementations to test against:
//  A: cache the ones we've already read
//    - ~20..35 ms per each new access to primed data
//  B: cache all of primed data, at launch
//    - ~400ms up-front, but reference to primed data is instantaneous
//
// Overall, the speeds are likely to be about the same, since each rules doc ends up being read once (there's no batch
// reading in Firestore; but there is -> https://firebase.google.com/docs/firestore/reference/rest/v1beta1/projects.databases.documents/batchGet)
//
// Anyhow, even 400ms is kind of stupid, for ~10 JSON fields. If this becomes an issue in a larger project, let's
// pass the path of the primed data in an env.var. and read it from the disk, directly.
//
const USE_B = false;

if (USE_B) {
  await init();   // top level await
}

/*
* Run the 'op', but:
*   - only once we know no other op is executed at the same time
*   - restore the effects (if successful) before letting other ops run
*
* docPath:
*   docPath that should be restored (for operations set, update, delete); 'null' for read operations.
*
* Resolves to:
*   true: access was granted
*   string: access denied, reason in the string
*/
async function immutableCloak(docPath, op) {   // (string|null, () => Promise of true|string) => Promise of true|string

  return withinLock( async _ => {
    const was = docPath && (
      USE_B ? getPrimed_B(docPath) : await getPrimed_A(docPath)
    );

    const ret = await op();
    if (ret === true && docPath) {
      if (was) {
        await dbAdmin.doc(docPath).set(was);
      } else {
        await dbAdmin.doc(docPath).delete();
      }
    }

    return ret;
  });
}

async function withinLock(f) {    // (() => Promise of x) => Promise of x

  const release = await claimLock();    // () => ()
  try {
    return await f();
  }
  finally {
    release();    // free running tail
  }
}

//--- Caching ---
//
// The rest of the code has to do with how we know what to place back if Firestore mutable operation succeeded.

// Data we've already seen (or all of it, in case 'B').
//
const cache = new Map();    // (string) => null|object    // 'null' a place-holder for missing (cannot store 'undefined')

/*
* A: Read from Firestore object-by-object, on-demand.
*/
async function getPrimed_A(docPath) {  // (string) => Promise of object|undefined

  if (!cache.has(docPath)) {
    const t0 = performance.now();

    const dss = await dbAdmin.doc(docPath).get();   // DocumentSnapshot   // takes XXX ms
    const v = dss.data();
      // "Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist."

    //console.log(`Read from Firestore: ${performance.now() - t0}ms`);    // 42, 44 ms

    cache.set(docPath, v || null);
  }
  return cache.get(docPath) || undefined;   // move 'null' back to 'undefined'
}

function getPrimed_B(docPath) {   // (string) => object|undefined

  return getPrimed_sync(docPath);
}

export {
  immutableCloak
}
