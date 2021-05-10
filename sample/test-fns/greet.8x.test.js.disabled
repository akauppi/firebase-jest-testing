/*
* sample/test-fns/greet.8x.test.js
*
* This variant uses Firebase 8.x API (works).
*/
import { test, expect, describe, beforeAll, afterAll } from '@jest/globals'

function fail(msg) { throw new Error(msg); }    // Jest doesn't offer one

// Client SDK (not 'firebase-admin')
//
import { firebase } from '@firebase/app'
import '@firebase/functions'

import firebaseJson from '../../firebase.json'
const FUNCTIONS_EMULATOR_PORT = firebaseJson.emulators.functions.port ||
    fail("Cannot read Functions emulator port from './firebase.json'");

let myApp;
let fns;

const projectId = process.env["GCLOUD_PROJECT"] || fail("No 'GCLOUD_PROJECT' env.var.");

beforeAll( () => {
  myApp = firebase.initializeApp({
    projectId,
    //auth: null    // unauth is enough
  }, "testing");

  fns = firebase.functions(myApp);
  fns.useEmulator("localhost", FUNCTIONS_EMULATOR_PORT );
});

afterAll( async () => {
  await myApp.delete();
} );

describe ('Cloud Function callables', () => {

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = fns.httpsCallable("greet");
    const data = (await fnGreet(msg)).data;

    expect(data).toBe("Greetings, Jack.");
  });
});
