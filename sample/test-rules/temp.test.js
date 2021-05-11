/*
* TEMP
*
* Test if we can use the REST API, at all...
*
* Known data:
*   projectId: "bunny"
*   docPath:    abc/
*/
import { describe, expect, beforeAll } from '@jest/globals'

import { dbAuth, serverTimestamp } from 'firebase-jest-testing/firestoreRules'

const SERVER_TIMESTAMP = serverTimestamp();

const anyDate = new Date();   // a non-server date

describe("TEMP", () => {
  let unauth_visitedC, auth_visitedC, abc_visitedC, def_visitedC;

  beforeAll(  () => {         // note: applies only to tests in this 'describe' block
    const coll = dbAuth.collection('projects/1/visited');

    unauth_visitedC = coll.as(null);
    auth_visitedC = coll.as({uid:'_'});
    abc_visitedC = coll.as({uid:'abc'});
    def_visitedC = coll.as({uid:'def'});
  });

  //--- VisitedC read rules ---

  test.only ('temp #1 - should be able to read Jolly Jumper, as \'abc\'', async () => {
    const coll = dbAuth.collection('projects');

    await expect( coll.as({uid:'abc'}).doc("1").get() ).toAllow();
  });

  test.only ('temp #2 - should NOT be able to read a non-existing doc', async () => {
    const coll = dbAuth.collection('projects');

    await expect( coll.as({uid:'abc'}).doc("7").get() ).toDeny();
  });

  test.only ('temp #3 - should NOT be able to read Jolly Jumper, as a visitor', async () => {
    const coll = dbAuth.collection('projects');

    await expect( coll.as({uid:'abc__'}).doc("1").get() ).toDeny();
  });



  test('unauthenticated access should fail', async () => {
    await expect( unauth_visitedC.get() ).toDeny();
  });

  test('user who is not part of the project shouldn\'t be able to read', async () => {
    await expect( auth_visitedC.get() ).toDeny();
  });

  test('project members may read each other\'s visited status', async () => {
    await expect( abc_visitedC.doc("abc").get() ).toAllow();
    await expect( def_visitedC.doc("abc").get() ).toAllow();   // collaborator

    await expect( abc_visitedC.doc("def").get() ).toAllow();
    await expect( def_visitedC.doc("def").get() ).toAllow();   // collaborator
  });

  //--- VisitedC write rules ---

  test('only the user themselves can set their value (to server timestamp)', async () => {
    const d_serverTime = { at: SERVER_TIMESTAMP };
    const d_otherTime = { at: anyDate };

    await expect( abc_visitedC.doc("abc").set( d_serverTime )).toAllow();
    await expect( def_visitedC.doc("abc").set( d_serverTime )).toDeny();   // other user

    await expect( abc_visitedC.doc("abc").set( d_otherTime )).toDeny();
    await expect( def_visitedC.doc("abc").set( d_otherTime )).toDeny();   // other user
  });

  //--- VisitedC delete rules ---
  //
  // In practise, write rules inhibit deletion, but this is not absolutely required (so we don't test).

});
