/*
* src/storageAdmin/storageAdmin.js
*
* Context:
*   Always called within tests
*/
import { strict as assert } from 'assert'
import {PRIME_ROUND} from '../config.js'
assert(!PRIME_ROUND);

import { adminApp } from '../adminApp.js'   // "modular API" (10.x)
import { getStorage } from 'firebase-admin/storage'

/*
* All the exposed methods operate on this one Storage Admin app. This hides emulator configuration from the rest.
*/
const storageAdmin = (_ => {
  return getStorage(adminApp);    // was: 'adminApp.storage()' (9.x)
})();

export {
  storageAdmin,
}
