/*
* src/projectId.js
*
* Dig current Firestore projectId from '.firebaserc' (needed for showing data in the Emulator UI)
*/
import { strict as assert } from 'assert'
import fs from 'fs'

// Firebase (8.7.0) requires 'firebase.json' and '.firebaserc' to exist in the same directory. Thus, we make
// 'FIREBASE_JSON' steer also the detection of '.firebaserc' (this is really fishy).
//
const fn = process.env["FIREBASE_JSON"] && (() => {
    const tmp = process.env["FIREBASE_JSON"].replace(/[^/]+$/, '.firebaserc');
    return tmp;
  })() || '.firebaserc';

const projectId = (() => {
  const o = JSON.parse(
    fs.readFileSync(fn, 'utf8')
  );
  const vs = Object.values(o["projects"]);
  assert(vs.length === 1);

  return vs[0];
})();

export {
  projectId
}
