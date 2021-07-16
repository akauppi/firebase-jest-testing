/*
* firestoreRules/shadow.js
*
* At load, read the whole (primed) Firestore database into memory, and provide access to it.
*
* References:
*   - "How to read your entire dataset in Firestore" (blog, Jan 2021)
*     -> https://medium.com/firebase-tips-tricks/how-to-read-your-entire-firestore-data-set-with-the-admin-sdk-159d6af82ded
*/
import { performance } from 'perf_hooks'
import { Timestamp } from 'firebase-admin/firestore'

import { dbAdmin } from '../firestoreAdmin/dbAdmin'

const USE_PARALLEL = false;    // true is better (455 vs. 667 ms)

function fail(msg) { throw new Error(msg); }

/*
* Visit all collections given, recursively, alternating between calls to 'visitDocs' and us.
*/
async function visitCollections(colls, onDocument) {    // (Array of CollectionReference, DocumentReference => ())

  async function handle(coll) {   // (CollectionReference) => Promise of ()
    const docs = await coll.listDocuments();
    if (docs.length > 0) await visitDocs(docs, onDocument);
  }

  if (USE_PARALLEL) {
    const proms = colls.map(handle);
    await Promise.all(proms);
  } else {
    for( const coll of colls ) {
      await handle(coll);
    }
  }
}

/*
* Visit all documents given, recursively, alternating between calls to 'visitCollections' and us.
*/
async function visitDocs(docs, onDocument) {    // (Array of DocumentReference, DocumentReference => ()) => Promise of ()

  async function handle(doc) {   // (DocumentReference) => Promise of ()
    onDocument(doc);

    const colls = await doc.listCollections();
    if (colls.length > 0) await visitCollections(colls, onDocument);
  }

  if (USE_PARALLEL) {
    const proms = docs.map(handle);
    await Promise.all(proms);
  } else {
    for( const doc of docs ) {
      await handle(doc);
    }
  }
}

//---
// 'init()' is called (and waited upon) before the tests run.
//
let m;    // undefined | Map of string -> { ...Firestore doc (with 'Timestamp' fields converted to 'Date') }

async function init() {   // () => Promise of ()
  const mm = new Map();

  async function onDocument(doc) {    // (DocumentReference) => Promise of ()
    const ss = await doc.get();
    const o = ss.data();    // object|undefined

    if (o) {
      // Convert possible 'Timestamp's to JS 'Date'
      //
      const tmp = convertTimestamps(o);

      mm.set(doc.path, tmp);
    }
  }

  const t0 = performance.now();

  const tmp = await dbAdmin.listCollections();
  await visitCollections(tmp, onDocument);

  console.log(`Read all ${tmp.size} collections in ${performance.now() - t0}ms (${ USE_PARALLEL ? 'parallel':'sequential' })`);   // 534, 555, 634 ms

  m = mm;
}

/*
* Reading
*/
function getPrimed_sync(docPath) {   // (string) => object|undefined
  if (!m) fail("Primed data not shadowed: was 'init()' called?");

  return m.get(docPath);
}

/*
* Reading Firestore objects provides 'Timestamp' fields, instead of converting to JS native 'Date' objects.
* We want Dates.
*/
function convertTimestamps(o) {   // (object) => object

  const entries2 = Object.entries(o).map( ([k,v]) => {
    if (v instanceof Timestamp) {
      return [k, v.toDate()];

    } else if (typeof v === 'object') {
      return [k, convertTimestamps(v)];

    } else {
      return [k,v];
    }
  });

  return Object.fromEntries(entries2);
}

export {
  init,
  getPrimed_sync
}
