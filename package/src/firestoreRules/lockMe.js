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

import { createUnlimited, deleteUnlimited } from '../firestoreAdmin/unlimited'

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
const queue = [];   // Array of true|() => ()    ; resolve functions for the pending promises (already running one remains in the queue)

let waits_PROF;     // Array of ms
let opsTook_PROF;   // Array of ms

let currentOpStart_PROF;   // ms

/*
* Claim the lock, among others accessing the same Firestore project.
*
* Returns:
*   Promise of a 'release' function that the caller must call, to release the lock.
*/
async function claimLock() {    // () => Promise of /*release*/ () => ()
  const vid_DEBUG = vidGen_DEBUG();

  const t0 = performance.now();

  if (queue.length) {   // Lock is already held by this env, or being waited upon; append to the pending queue.
    return new Promise(resolve => {
      queue.push(resolve)

    }).then( _ => {   // awakened; things to do before the operation
      const dt = trunc( performance.now() - t0 );
      waits_PROF.push(dt);

      //console.log(now00_DEBUG(vid_DEBUG) + `Lock received after ${dt}ms`);    // 253, 254 | 7, 11, 19.5
      currentOpStart_PROF = performance.now();

    }).then( _ => release );    // provide the 'release' to the caller (calling which will activate the code above.. it's a bit twisted 🍭)

  } else {    // Queue is empty; claim the global lock
    queue.push(true);   // marker that we are already claiming the lock (must be set before first 'await')

    // Profile the number of local locks, and the durations they waited + operations executed.
    waits_PROF = [];
    opsTook_PROF = [];

    await claimGlobalLock();

    const dt = trunc( performance.now() - t0 );
    waits_PROF.push(dt);
    //console.log(now00_DEBUG(vid_DEBUG) + `Lock (global) received after ${dt}ms`);    // 246

    currentOpStart_PROF = performance.now();
    return release;
  }

  // Proceed the queue; release the global lock if no more entries.
  //
  // Called by the locked operation, when it's done.
  //
  function release() {
    assert(queue.length);
    queue.shift();

    assert(currentOpStart_PROF);
    opsTook_PROF.push( trunc(performance.now() - currentOpStart_PROF) );
    currentOpStart_PROF = undefined;

    if (queue.length) {   // more to go
      const resolveNext = queue[0];   // keep in the queue to show we have the global lock
      resolveNext(release);
    } else {
      releaseGlobalLock();    // free-running tail

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
      console.info("Locking profiles:", {
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
    const gotIt = await createUnlimited(lockDoc,{}).then( _ =>
      true
    )
    .catch(async err => {
      if (err.code === 6) {     //err.message.startsWith("6: ALREADY EXISTS:"
        return false;
      }
      throw err;    // unknown exception
    });

    if (gotIt) {
      weAreLocked_ASSERT = true;
      return;

    } else {
      if (retries && retries %10 === 0) {
        console.debug(now00_DEBUG() + `Still waiting after ${retries} retries...`);
      }

      retries = retries + 1;

      // Firestore operations seem to take ~10..30ms and the env having the lock likely has multiple of them, queued.
      // There's no point in pinging the lock doc too frequently.
      //
      await soon(5);
    }
  }
}

async function releaseGlobalLock() {
  assert(weAreLocked_ASSERT);
  weAreLocked_ASSERT = false;

  const t0rel = performance.now();

  await deleteUnlimited(lockDoc);

  //console.debug(`Releasing took: ${ trunc(performance.now() - t0rel) }ms`);   // 15.3, 21.8, 85, 113
}

function trunc(ms) {    // (number) => number
  return Math.round(ms*10) / 10;

  // Note: Don't use '.toFixed' because it returns a string
  //return ms.toFixed(1);
}

function soon(ms) {   // (int) => Promise of ()
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  claimLock
}