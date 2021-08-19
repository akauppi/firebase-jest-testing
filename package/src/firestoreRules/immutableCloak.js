/*
* src/firestoreRules/immutableCloak.js
*/
import { performance } from 'perf_hooks'

import { dbAdmin } from '../firestoreAdmin/dbAdmin'
import { claimLock } from './lockMe'

import { readTemp } from '../intercom/index'

// A: Read from database, cache
// B: Read from disk, prepared by 'intercom'
//
// B is slightly faster (~3.4s vs. ~3.7s for 'npm run test:rules:all'), and also scales better (no additional locking).
//
const USE_B = true;

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
      USE_B ? await getPrimed_B(docPath) : await getPrimed_A(docPath)
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

//--- Caching (A) ---
//
// The rest of the code has to do with how we know what to place back if Firestore mutable operation succeeded.

// Data we've already seen (or all of it, in case 'B').
//
const cache = new Map();    // (string) => null|object    // 'null' a place-holder for missing (cannot store 'undefined')

/*
* Read from Firestore object-by-object, on-demand.
*
* This turned out to be a decent solution, compared to reading all of the data at launch. The reason: Jest loads each
* test separately, so any global initialization or pre-fetch would happen N times. With the caching approach, only the
* data that really is used (per test) is read (once).
*/
async function getPrimed_A(docPath) {  // (string) => Promise of object|undefined

  if (!docPath.startsWith('/')) { docPath = '/'+docPath }

  if (!cache.has(docPath)) {
    const t0 = performance.now();

    const dss = await dbAdmin.doc(docPath).get();   // DocumentSnapshot
    const v = dss.data();
      // "Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist."

    //console.log(`Read from Firestore: ${performance.now() - t0}ms`);    // 42, 44 ms

    cache.set(docPath, v || null);
  }
  return cache.get(docPath) || undefined;   // move 'null' back to 'undefined'
}

//--- Intercom (B) ---
//
// At import, read the
//
const dataProm = USE_B && readTemp();    // Promise of { <docPath>: object }

async function getPrimed_B(docPath) {   // (string) => Promise of object|undefined

  if (!docPath.startsWith('/')) { docPath = '/'+docPath }

  const data = await dataProm;
  return data[docPath];
}

export {
  immutableCloak
}
