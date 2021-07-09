/*
* sample/test-fns/userInfo.test.js
*
* Test that '/projectsC/.../userInfoC' gets updated, by cloud functions, when the global '/userInfoC' changes (if
* users are in the project).
*/
import { test, expect, describe, beforeAll } from '@jest/globals'

import './matchers/toContainObject'
import { collection, doc, preheat_EXP } from "firebase-jest-testing/firestoreAdmin"

describe("userInfo shadowing", () => {

  // Have this, to move ~320ms of test execution time away from the reports (shows recurring timing). To show first
  // (worst) timing, don't do this.
  //
  beforeAll( () => {
    preheat_EXP("projects/1/userInfo");
  })

  test('Central user information is distributed to a project where the user is a member', async () => {
    const william = {
      displayName: "William D.",
      photoURL: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dalton_Bill-edit.png"
    };

    // Write in 'userInfo' -> causes a Cloud Function to update 'projectC/{project-id}/userInfo/{uid}'
    //
    await collection("userInfo").doc("abc").set(william);

    // Style 1:
    //  - 'docListener' only passes when the right kind of object is there.
    //
    //await expect( docListener("projects/1/userInfo/abc", shallowEqualsGen(william)) ).resolves.toBeDefined();

    // Style 2:
    //  - 'eventually.doc' passes on first valid doc, checking is done outside of 'expect'.
    //
    await expect( docListener("projects/1/userInfo/abc") ).resolves.toContainObject(william);
  });

  test('Central user information is not distributed to a project where the user is not a member', async () => {

    // Write in 'userInfo' -> should NOT turn up in project 1.
    //
    await collection("userInfo").doc("xyz").set({ displayName: "blah", photoURL: "https://no-such.png" });

    await sleepMs(300);   // give time
    await expect( doc("projects/1/userInfo/xyz").get().then( ss => ss.exists ) ).resolves.toBe(false);
  }, 9999);

  // ideally:
  //await expect(prom).not.toComplete;    // ..but with cancelling such a promise

  // ..or:
  //await expect(prom).timesOut;    // ..but with cancelling such a promise
});

/*
* Generates a function that returns 'true' if the two objects have same values; shallow.
*/
function shallowEqualsGen(o) {   // (obj) => (obj) => boolean
  return o1 => Object.keys(o1).length === Object.keys(o).length &&
    Object.keys(o1).every(k => o1[k] === o[k]);
}

function docListener(docPath, filter) {   // (string, ((object) => falsy|object)?) => Promise of object

  return new Promise( (resolve) => {

    const unsub = doc(docPath).onSnapshot( ss => {
      const o = ss.exists ? (filter || (o => o))( ss.data() ) : null;
      if (!o) return;

      resolve(o);
      unsub();
    });
  });
}

const sleepMs = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
