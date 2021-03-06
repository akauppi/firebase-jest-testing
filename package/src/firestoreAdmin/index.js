/*
* src/firestoreAdmin/index.js
*
* Context:
*   From tests
*/
import {dbAdmin, /*eventually,*/ preheat_EXP} from "./dbAdmin.js"

/*
* Note: Just doing 'const { collection, doc } = dbAdmin' does not work.
*/
function collection(path) {
  return dbAdmin.collection(path);
}

function doc(path) {
  return dbAdmin.doc(path);
}

export {
  collection,
  doc,
  //eventually,
  //
  preheat_EXP
}
