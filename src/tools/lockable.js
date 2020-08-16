/*
* src/tools/lockable.js
*
* Execute tasks, one at a time, with OS level locking.
*
* Note: There are multiple candidates for OS-level locking in Node, but unfortunately no one-to-rule-them-all.
*   - node.js itself doesn't provide locking support
*   - fs-ext
*     - uses 'gyp' and therefore we'd get the pains that induces (at least on macOS & Homebrew)
*   - proper-lockfile
*   - ...
*
*   Did this module so that changing the underlying implementation is easy, if there is a need.
*/
//import { lock } from 'proper-lockfile'    // "does not provide an export named 'lock'"
import m from 'proper-lockfile';
import {strict as assert} from "assert"; const lock = m.lock;

import { writeFileSync, existsSync } from 'fs'

/*
* Create a locking wrapper around a promise provided by 'genProm'.
*
* - The payload promise is created only once a lock is gained.
* - The lock is automatically released after the payload promise completes.
*
* If the lock file does not yet exist, we create it.
*/
async function lockable(lockFn, genProm) {   // (string, () => Promise of any) => Promise of any }

  // 'proper-lockfile' 'lock()' does not pend the Promise until lock is claimed, but throws an error. We seem to be
  // the ones needing to do the waiting...
  //
  // Resolves when: lock is claimed; value is a 'release' function.
  //
  async function isLocked() {   // () => Promise of () => Promise of ()

    return await new Promise((resolve, reject) => {

      (function me() {
        lock(lockFn).then( release => {
          resolve(release);    // wakes the party pending on the Promise
        }
        ).catch( err => {   // "Lock file is already being held" ... { code: 'ELOCKED', ... }
          if (err.code === 'ELOCKED') {
            setTimeout( me, 20);    // try again (indefinitely)
          } else {
            throw err;    // not seen
          }
        });
      })();
    });
  }

  const release = await isLocked();
  //console.debug("LOCKED!", release);

  try {
    return await genProm();   // runs the code
  }
  finally {
    const ignore = release().then( _ => {
      //console.debug("UNLOCKED!");

    }).catch( err => {    // let that run free
      console.error("Problem releasing a lock:", err);
    });
  }
}

export {
  lockable
}
