/*
* src/firestoreAdmin/index.js
*
* Context:
*   From tests
*/
import { strict as assert } from 'assert'

import {dbAdmin, preheat_EXP} from "./dbAdmin.js"

import { afterAll } from '@jest/globals'

const autoUnsubs = new Set();    // Set of () => ()

/*
*/
function collection(path) {
  return dbAdmin.collection(path);

  // assert(ref.listDocuments && ref.doc && ref.onSnapshot );

  // // Not really wanting to limit the API much, but at the same time we should provide 'afterAll' cleanup, regardless
  // // the API used. I.e. not to leak unwrapped 'DocumentReference' - that would be confusing.
  // //
  // return {
  //   doc: (subPath) => doc(`${path}/${subPath}`)     // (string) => DocumentReference -like
  // }
}

/*
* Like Firebase Admin SDK's 'doc'.
*
* By restricting the API surface, we keep version updates or incompatibilities from leaking to test code.
* Also, this allows us to fix some known problems.
*/
function doc(docPath) {   // (string) => DocumentReference like
  return dbAdmin.doc(docPath);

  // assert(ref.set && ref.get && ref.onSnapshot);

  // // Wrap us into the 'unsub' chain, so we can release resources if they are still listened to, once Jest times out.
  // //
  // function onSnapshot(handler) {    // ((...) => ...) => () => Promise of ()   // returned function is 'unsub'
  //   let unsub = ref.onSnapshot(handler);

  //   autoUnsubs.add(unsub);        // tbd. works?

  //   return async () => {    // wrapper around 'unsub'
  //     if (!unsub) fail("'unsub' called twice")

  //     assert(autoUnsubs.has(unsub));
  //     autoUnsubs.delete(unsub);
  //     await unsub();
  //     unsub = null;
  //   };
  // }

  // return {
  //   get: () => ref.get(),     // () => ...
  //   set: (v) => ref.set(v),   // (...) => Promise of ...
  //   onSnapshot
  // }
}

/*
* Close any remaining listeners, when Jest is done.
*
* This counteracts what looks like a Firebase Admin SDK bug (incompatibility with Jest), where a remaining listener
* causes Jest not to be able to return to OS prompt.
*
* Reference:
*   "Jest does not exit tests cleanly with Firebase Firestore, an older version does. [...]" (Jest issues)
*     -> https://github.com/facebook/jest/issues/11464
*/
afterAll( async () => {

  //console.log(`!!! ${ autoUnsubs.size } listeners still running (cleaning them up)`);   // DEBUG

  const proms = Array.from(autoUnsubs) .map( unsub => unsub() );   // Array of Promise of ()
  await Promise.all(proms);
})

export {
  collection,
  doc,
  //
  preheat_EXP
}
