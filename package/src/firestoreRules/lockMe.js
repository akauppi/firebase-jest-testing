/*
* src/firestoreRules/claimLock.js
*
* Locking mechanism within the Firestore project.
*
* Context: tests
*
* OPTIMIZATION:
*   The locking is not optimal.
*     - the waits could be queued, _within the node environment_. This would make it fairer (and able to wake up
*       with less lag). In this scenario, a node environment would lock the access to itself, and release only
*       once there are no pending entries in its queue.
*/
import { createUnlimited, deleteUnlimited } from '../firestoreAdmin/unlimited'

import { performance } from 'perf_hooks'

// Note: Node.js 15+ has this (but it's not worth abandoning Node.js 14, just yet).
//      https://nodejs.org/api/timers.html#timers_timerspromises_settimeout_delay_value_options
//
//    Use: 'await setImmediate()'
//
//import { setImmediate } from 'timers/promises'

const lockDoc = "_/.lock";    // name doesn't matter - just keep away from application collections

const t00 = performance.now();   // time of loading

function now00() { return `[${ (performance.now() - t00).toFixed(0) }]: ` }

let nextVisitor=1;

// Fast check in case we know without exercising Firestore that the lock would be set (i.e. set by some function in
// our Node.js environment).
//
let claimedByUs = false;

/*
* Claim the lock, among others accessing the same Firestore project.
*
* Note: This mechanism is obviously easy to bypass. It relies on the parties asking for the lock. :)
*
* Returns:
*   Promise of a 'release' function that the caller must call, to release the lock.
*/
async function claimLock() {    // () => Promise of () => ()
  const visitor = nextVisitor;
  nextVisitor = nextVisitor +1;

  //console.debug(now00() + `!!! Claiming the lock (${visitor})`);

  const t0claim = performance.now();

  // Create the lock document, if it doesn't already exist.
  //
  let retries=0;
  while(true) {
    const gotIt = claimedByUs ? false : await createUnlimited(lockDoc,{}).then( _ =>
        true
      )
      .catch(async err => {
        if (err.code === 6) {     //err.message.startsWith("6: ALREADY EXISTS:"
          return false;
        }
        throw err;    // unknown exception
      });

    if (gotIt) {
      claimedByUs = true;   // quick fail others
      break;

    } else {
      retries = retries + 1;
      await soon(0);

      if (retries && retries %10 === 0) {
        console.debug(now00() + `Still waiting... (${visitor}) ${recursiveCount}`);
      }
    }
  }

  //console.debug(now00() + `Lock acquired (${visitor})`, { retries, waitedMs: performance.now() - t0claim });

  async function release() {
    //console.debug(now00() + `Releasing the lock (${visitor})`);

    const t0rel = performance.now();

    claimedByUs = false;
    await deleteUnlimited(lockDoc);

    //const tNow = performance.now();
    //console.debug(`Releasing took: ${ trunc(tNow - t0rel) }ms`);   // 15.3, 21.8, 85, 113
    //console.debug(`Overall claim took: ${ trunc(tNow - t0claim) }ms`);   // 15.3, 21.8, 85, 113, 137, 323
  }
  return release;
}

function trunc(ms) {
  return ms.toFixed(1);
}

function soon(ms) {   // (int) => Promise of ()
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  claimLock
}