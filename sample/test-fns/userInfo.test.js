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
    //  - 'eventually' only passes when the right kind of object is there.
    //
    //await expect( waitForIt("projects/1/userInfo/abc", shallowEqualsGen(william)) ).resolves.not.toThrow();

    // Style 2:
    //  - 'eventually' passes on first valid doc, checking is done outside of 'expect'.
    //
    await expect( waitForIt("projects/1/userInfo/abc") ).resolves.toContainObject(william);
  });

  // Variant that works with Jest 27
  test('Central user information is not distributed to a project where the user is not a member', async () => {

    // Write in 'userInfo' -> should NOT turn up in project 1.
    //
    await collection("userInfo").doc("xyz").set({ displayName: "blah", photoURL: "https://no-such.png" });

    await sleepMs(300);   // give time
    await expect( doc("projects/1/userInfo/xyz").get().then( ss => ss.exists ) ).resolves.toBe(false);
  }, 9999);

  /*
  test.ideally('Central user information is not distributed to a project where the user is not a member', async () => {

    // Write in 'userInfo' -> should NOT turn up in project 1.
    //
    await collection("userInfo").doc("xyz").set({ displayName: "blah", photoURL: "https://no-such.png" });

    await expect( waitForIt("projects/1/userInfo/xyz") ).timesOut;   // tbd. needs Jest extension or mod!
  });*/
});

/*
* Generates a function that returns 'true' if the two objects have same values; shallow.
*/
function shallowEqualsGen(o2) {   // (obj) => (obj) => boolean
  return o1 => Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every(k => o1[k] === o2[k]);
}

/*
* Provide a Promise that resolves, if the right kind of change takes place in the watched doc.
*/
function waitForIt(docPath, predicate) {    // (string, ((object) => any)? ) => Promise of {...Firestore document }
  return new Promise( (resolve) => {

    const unsub = doc(docPath).onSnapshot( ss => {
      const o = ss.exists ? ss.data() : null;
      if (!o) return;

      if (!predicate || predicate(o)) {
        resolve(o);
        unsub();
      }
    });
  });
}

const sleepMs = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });
