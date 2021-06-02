/*
* src/firestoreRules/lockMe.js
*
* Locking mechanism within the Firestore project.
*
* Context: tests
*
* Implementation notes:
*   Locking via Firestore database is done only to synchronize between the Node.js environments (JEST runs multiple,
*   in parallel). Within the environment, Promise based locking is in effect. This should reduce the locking overhead,
*   and waiting time for one.
*
*   The implementation is not fair across environments. Any environment that claims the lock will pend all others,
*   until it's through. We'll track the lock waiting times to see whether fairness is an issue.
*/
import { strict as assert } from 'assert'
import { performance } from 'perf_hooks'

import {dbAdmin} from '../firestoreAdmin/dbAdmin'

// Note: Node.js 15+ has this (but it's not worth abandoning Node.js 14, just yet).
//      https://nodejs.org/api/timers.html#timers_timerspromises_settimeout_delay_value_options
//
//    Use: 'await setTimeout(ms)'
//
//import { setTimeout } from 'timers/promises'

const lockDoc = "_/.lock";    // name doesn't matter - just keep away from application collections

const t00 = performance.now();   // time of loading

const pid = process.pid;
function now00_DEBUG(vid) { return `[${ (performance.now() - t00).toFixed(0) } ${pid}${vid ? `.${vid}`:''}]: ` }

let nextVisitor_DEBUG=1;  // identifies visitors (within the execution environment)

function vidGen_DEBUG() {
  const x = nextVisitor_DEBUG;
  nextVisitor_DEBUG = nextVisitor_DEBUG + 1;
  return x;
}

// Queue of pending Promises, within this environment.
//
const queue = [];   // Array of true| /*resolve*/ () => ()    ; resolve functions for the pending promises (head is the one running, or waiting for the global lock)

let waits_PROF;     // Array of ms
let opsTook_PROF;   // Array of ms

let currentOpStart_PROF;   // ms

// Check that no two callers (per Node environment) can be in the lock, at once.
let imInside_DEBUG = false;

/*
* Claim the lock, among others accessing the same Firestore project.
*
* Returns:
*   Promise of a 'release' function that the caller must call, to release the lock.
*/
async function claimLock() {    // () => Promise of /*release*/ () => ()
  const vid_DEBUG = vidGen_DEBUG();

  const t0 = performance.now();

  await (queue.length ? (    // Lock is already held by this env, or being waited upon; append to the pending queue.
    new Promise(resolve => {
      queue.push(resolve);

    }).then( _ => {   // awakened; things to do before the operation
      assert(!imInside_DEBUG); imInside_DEBUG = true;
    })
  ) : (   // Queue is empty; claim the global lock
    queue.push(true),   // marker that we are already claiming the lock (must be set before first 'await')

    assert(!imInside_DEBUG), imInside_DEBUG = true,

    // Profile the number of local locks, and the durations they waited + operations executed.
    waits_PROF = [],
    opsTook_PROF = [],

    claimGlobalLock()   // IDE note: "missing await" is false warning; ignore
      .then( _ => {   // DEBUG
        assert(imInside_DEBUG);
      })
  ));

  const dt = trunc( performance.now() - t0 );
  waits_PROF.push(dt);

  //console.log(now00_DEBUG(vid_DEBUG) + `Lock received after ${dt}ms`);    // 246

  currentOpStart_PROF = performance.now();
  return release;

  // Proceed the queue; release the global lock if no more entries.
  //
  // Called by the locked operation, when it's done.
  //
  function release() {
    assert(queue.length);
    queue.shift();

    assert(imInside_DEBUG); imInside_DEBUG = false;

    assert(currentOpStart_PROF);
    opsTook_PROF.push( trunc(performance.now() - currentOpStart_PROF) );
    currentOpStart_PROF = undefined;

    if (queue.length) {   // more to go
      const resolveNext = queue[0];   // keep in the queue to show we have the global lock
      resolveNext();
    } else {
      /*await*/ releaseGlobalLock();    // free-running tail

      // Report the profiling about this larger locking
      //
      const [waitMedian, waitMax] = getMedMax(waits_PROF);
      const [opMedian, opMax] = getMedMax(opsTook_PROF);

      // PROFILING analysis:
      //
      // - The FIRST global lock takes ~250ms; subsequent within the same run 25..40ms.
      // - Local locks are fast (<10ms); their waits happen in parallel with the global locking and thus that time does
      //   not count.
      // - Operations are 1..25ms, each
      //
      if (false) console.info("Locking profiles:", {
        waits: waits_PROF,          // 246, 253, 254 (getting global lock is the decisive one; others wait alongside it)
        waitMedian,                 // 253
        waitMax,                    // 254
        opsTook: opsTook_PROF,      // 1, 2, 24 ms
        opMedian,                   // 2
        opMax                       // 24
      })
    }
  }
}

function getMedMax(a) {   // (Array of ms) => [ms,ms]
  const a2 = [...a].sort( (a,b) => a-b );    // numeric sort; note: WITHOUT affecting 'a' (we want to log in the right order)
  const med = a2[ Math.floor(a2.length/2) ];
  const max = a2[ a2.length-1 ];

  return [med,max];
}

//--- Global lock ---

let weAreLocked_ASSERT = false;

// Claim the lock, among Node.js environments.
//
// Resolves when we have the lock.
//
async function claimGlobalLock() {  // () => Promise of ()
  assert(!weAreLocked_ASSERT);

  let retries=0;
  while(true) {
    const gotIt = await tryCreate(lockDoc,{});
    if (gotIt) {
      weAreLocked_ASSERT = true;
      return;

    } else {
      if (retries && retries %10 === 0) {
        console.debug(now00_DEBUG() + `Still waiting after ${retries} retries...`);
      }

      retries = retries + 1;

      // Wait until the document is seen to have been removed. Then, try again.
      //
      await waitUntilDeleted(lockDoc);
    }
  }
}

async function releaseGlobalLock() {
  assert(weAreLocked_ASSERT);
  weAreLocked_ASSERT = false;

  const t0rel = performance.now();

  await dbAdmin.doc(lockDoc).delete();

  //console.debug(`Releasing took: ${ trunc(performance.now() - t0rel) }ms`);   // 15.3, 21.8, 85, 113
}

/*
* Try to create a document, atomically.
*
* Returns 'true' if succeeded; 'false' if the document already exists.
*/
async function tryCreate(docPath, o) {   // (string, object) => Promise of Boolean

  // "Creates a document referred to by this 'DocumentReference' with the provided object values. The write fails
  // if the document already exists."
  //
  const ret = await dbAdmin.doc(docPath).create(o).then( _ =>
    true
  )
  .catch(async err => {
    if (err.code === 6) {   // { code: 6, message: "6 ALREADY_EXISTS: entity already exists: [...]" }
      return false;
    }
    throw err;    // unknown exception
  });

  return ret;
}

/*
* Wait until a document no longer exists.
*
* Note: Not using 'eventually' at least as long as its API is in flux (also, we don't need a timeout).
*/
function waitUntilDeleted(docPath) {    // (string) => Promise of ()

  return new Promise( (resolve) => {
    const unsub = dbAdmin.doc(docPath).onSnapshot( ss => {
      if (!ss.exists) resolve();
      unsub();
    });
  })
}

function trunc(ms) {    // (number) => number
  return Math.round(ms*10) / 10;

  // Note: Don't use '.toFixed' because it returns a string
  //return ms.toFixed(1);
}

export {
  claimLock
}
