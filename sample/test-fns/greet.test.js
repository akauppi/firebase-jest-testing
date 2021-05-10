/*
* sample/test-fns/greet.test.js
*/
import { test, expect, describe, beforeAll, afterAll } from '@jest/globals'

function fail(msg) { throw new Error(msg); }    // Jest doesn't offer one

// Client SDK (not 'firebase-admin')
//
import { initializeApp, deleteApp } from '@firebase/app'
import { getFunctions, useFunctionsEmulator, httpsCallable } from '@firebase/functions'

let myApp;
let fns;

import firebaseJson from '../../firebase.json'
const FUNCTIONS_EMULATOR_PORT = firebaseJson.emulators.functions.port ||
    fail("Cannot read Functions emulator port from './firebase.json'");

const projectId = process.env["GCLOUD_PROJECT"] || fail("No 'GCLOUD_PROJECT' env.var.");

beforeAll( () => {
  myApp = initializeApp({
    projectId,
    //auth: null    // unauth is enough
  }, "testing");

  fns = getFunctions(myApp);
  useFunctionsEmulator(fns, "localhost", FUNCTIONS_EMULATOR_PORT );
});

afterAll( async () => {
  await deleteApp(myApp);

  //console.log("!!! Clear for exit.");   // gets here. However, does not return back to command line #BUG
} );

describe ('Cloud Function callables', () => {

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = httpsCallable(fns,"greet");
    const data = (await fnGreet(msg)).data;

    expect(data).toBe("Greetings, Jack.");
  });
});
