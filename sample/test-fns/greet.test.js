/*
* sample/test-fns/greet.test.js
*/
import { test, expect, describe } from '@jest/globals'

import { httpsCallable } from 'firebase-jest-testing/firebaseClientLike'

describe ('Cloud Function callables', () => {

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = httpsCallable("greet");
    const { data } = await fnGreet(msg);

    expect(data).toBe("Greetings, Jack.");
  });
});
