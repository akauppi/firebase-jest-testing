/*
* sample/test-fns/greet.test.js
*/
import { test, expect, describe, beforeAll, afterAll } from '@jest/globals'

function fail(msg) { throw new Error(msg); }    // Jest doesn't offer one

import { httpsCallable } from 'firebase-jest-testing/firebaseClientLike'

describe ('Cloud Function callables', () => {

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = httpsCallable("greet");
    const { data } = await fnGreet(msg);

    expect(data).toBe("Greetings, Jack.");
  });
});
