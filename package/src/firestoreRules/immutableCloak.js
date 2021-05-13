/*
* src/firestoreRules/immutableCloak.js
*/

import { getUnlimited } from '../firestoreAdmin/getUnlimited'
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
function immutableCloak(docPath, op) {   // (string, () => Promise of true|string) => Promise of true|string
  let was;
  if (docPath) {
    was = getUnlimited(docPath);
  }

  return claimLock().then( async releaseLock => {
    const ret = await op();

    if (docPath) {
      if (was) {
        await setUnlimited(docPath,was);
      } else {
        await deleteUnlimited(docPath);
      }
    }
    await releaseLock();
    return ret;
  });
}