/*
* sample/test-fns/callables.test.js
*/
import { test, expect, describe, beforeAll, afterAll } from '@jest/globals'

//import { fns } from 'firebase-jest-testing'
import { fns } from '../../src/fns.js'

describe ('Cloud Function callables', () => {
  test ('returns a greeting', async () => {
    const msg = 'Jack';

    const fnGreet = fns.httpsCallable("greet");

    const data = (await fnGreet(msg)).data;

    expect(data).toBe("Greetings, Jack.");
  });
});
