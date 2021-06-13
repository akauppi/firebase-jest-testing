/*
* sample/test-fns/userInfo.test.js
*
* Test that '/projectsC/.../userInfoC' gets updated, by cloud functions, when the global '/userInfoC' changes (if
* users are in the project).
*/
import { test, expect, describe } from '@jest/globals'

import './matchers/toContainObject'
import { collection, eventually } from "firebase-jest-testing/firestoreAdmin"

describe("userInfo shadowing", () => {

  // Note: We don't declare 'async done => ...' for Jest. That is an oxymoron: only either 'done' or the end of an
  //    async/await body would resolve a test but not both.
  //
  test('Central user information is distributed to a project where the user is a member', async () => {
    const william = {
      displayName: "William D.",
      photoURL: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Dalton_Bill-edit.png"
    };

    // Write in 'userInfo' -> causes a Cloud Function to update 'projectC/{project-id}/userInfo/{uid}'
    await collection("userInfo").doc("abc").set(william);

    // Style 1:
    //  - 'eventually' only passes when the right kind of object is there.
    //
    await expect( eventually("projects/1/userInfo/abc", o => o && shallowEquals(o,william)) ).resolves.not.toThrow();

    // Style 2:
    //  - 'eventually' passes on first valid doc, checking is done outside of 'expect'.
    //
    //await expect( eventually("projects/1/userInfo/abc") ).resolves.toContainObject(william);
  });

  test('Central user information is not distributed to a project where the user is not a member', async () => {

    // Write in 'userInfo' -> should NOT turn up in project 1.
    //
    await collection("userInfo").doc("xyz").set({ displayName: "blah", photoURL: "https://no-such.png" });

    await expect( eventually("projects/1/userInfo/xyz", o => !!o, 300 /*ms*/) ).resolves.toBeUndefined();

    // Ideally:
    //await expect( eventually("projects/1/userInfo/xyz") ).resolves.toBeUndefined()
    //
    //Within 'eventually', code would:
    //  <<
    //    beforeTimeout( () => { /*resolve the Promise with 'undefined'*/ } );
    //  <<
    //
    // This would allow us to steer the wait by the Jest normal timeout parameter, instead of having two.

  }, 9999 /*ms*/ );
});

/*
* Returns 'true' if the two objects have same values; shallow.
*/
function shallowEquals(o1,o2) {   // (obj,obj) => boolean
  return Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every(k => o1[k] === o2[k]);
}
