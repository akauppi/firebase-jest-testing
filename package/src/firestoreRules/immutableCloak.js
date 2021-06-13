/*
* src/firestoreRules/immutableCloak.js
*/
import { dbAdmin } from '../firestoreAdmin/dbAdmin'
import { claimLock } from './lockMe'

/*
* Run the 'op', but:
*   - only once we know no other op is executed at the same time
*   - restore the effects (if successful) before letting other ops run
*
* docPath:  For operations that change the database contents (set, update, delete), the docPath that should be restored.
*
* Return value resolves to..
*   true: access was granted
*   string: access denied, reason in the string
*/
async function immutableCloak(docPath, op) {   // (string?, () => Promise of true|string) => Promise of true|string

  return withinLock( async _ => {
    const was = docPath && await getUnlimited(docPath);

    const ret = await op();

    if (docPath) {
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

/*
* What's currently in a certain Firestore path?
*
* NOTE: Each read from Firestore takes 12..32 ms. (shaving them off made 'npm run test:rules:all' run in 4.0s instead of 5.0s!!)
*/
async function getUnlimited(docPath) {  // (string) => Promise of undefined|object

  const dss = await dbAdmin.doc(docPath).get();   // DocumentSnapshot
  return dss.data();
  // "Retrieves all fields in the document as an Object. Returns 'undefined' if the document doesn't exist."
}

function __getUnlimited(docPath) {  // (string) => undefined|object

  // 'docPath' we get is like "project/1" but the docs seem to have a preceding slash.
  //
  const tmp = docPath.startsWith('/') ? docPath : `/${docPath}`;

  const v= stash.get(tmp);
  return v;
}

export {
  immutableCloak
}
