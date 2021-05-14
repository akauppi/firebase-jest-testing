/*
* sample/test-rules/visitedC.test.js
*/
import { describe, expect, beforeAll } from '@jest/globals'

import { collection, serverTimestamp } from 'firebase-jest-testing/firestoreRules'

const SERVER_TIMESTAMP = serverTimestamp();

const anyDate = new Date();   // a non-server date

describe("'/visited' rules", () => {
  let unauth_visitedC, auth_visitedC, abc_visitedC, def_visitedC;

  beforeAll(  () => {         // note: applies only to tests in this 'describe' block
    const coll = collection('projects/1/visited');

    unauth_visitedC = coll.as(null);
    auth_visitedC = coll.as({uid:'_'});
    abc_visitedC = coll.as({uid:'abc'});
    def_visitedC = coll.as({uid:'def'});
  });

  //--- VisitedC read rules ---

  test('unauthenticated access should fail', () => Promise.all([
    expect( unauth_visitedC.get() ).toDeny()
  ]));

  test('user who is not part of the project shouldn\'t be able to read', () => Promise.all([
    expect( auth_visitedC.get() ).toDeny()
  ]));

  test('project members may read each other\'s visited status', () => Promise.all([
    expect( abc_visitedC.doc("abc").get() ).toAllow(),
    expect( def_visitedC.doc("abc").get() ).toAllow(),   // collaborator

    expect( abc_visitedC.doc("def").get() ).toAllow(),
    expect( def_visitedC.doc("def").get() ).toAllow()    // collaborator
  ]));

  //--- VisitedC write rules ---

  test('only the user themselves can set their value (to server timestamp)', async () => {
    const d_serverTime = { at: SERVER_TIMESTAMP };
    const d_otherTime = { at: anyDate };

    await Promise.all([
      expect( abc_visitedC.doc("abc").set( d_serverTime )).toAllow(),
      expect( def_visitedC.doc("abc").set( d_serverTime )).toDeny(),   // other user

      expect( abc_visitedC.doc("abc").set( d_otherTime )).toDeny(),
      expect( def_visitedC.doc("abc").set( d_otherTime )).toDeny(),   // other user

      // Also 'update' should work but actual code is expected to use 'set'
      expect( abc_visitedC.doc("abc").update( d_serverTime )).toAllow(),
      expect( def_visitedC.doc("abc").update( d_serverTime )).toDeny()   // other user
    ]);
  });

  //--- VisitedC delete rules ---
  //
  // In practise, write rules inhibit deletion, but this is not absolutely required (so we don't test).

});
