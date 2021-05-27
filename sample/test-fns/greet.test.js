/*
* sample/test-fns/greet.test.js
*/
import { test, expect, describe, beforeAll } from '@jest/globals'

import { httpsCallable, setRegion } from 'firebase-jest-testing/firebaseClientLike'

const region = "mars-central2";

describe ('Cloud Function callables', () => {

  beforeAll( () => {
    setRegion(region)
  });

  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = httpsCallable("greet");
    const { data } = await fnGreet(msg);

    expect(data).toBe("Greetings, Jack.");
  });
});
