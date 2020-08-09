/*
* sample.fns/callables.test.js
*/
import { test, expect, describe, beforeAll, afterAll } from '@jest/globals'

import { fns } from './tools/fns.js'

describe ('Cloud Function callables', () => {
  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = fns.httpsCallable("greet");

    const data = (await fnGreet(msg)).data;

    expect(data).toBe("Greetings, Jack.");
  });
});
