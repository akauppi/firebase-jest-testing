/*
* test/eventual.test.js
*
* Test 'expect.eventually' and 'expect.never' that are tools for effortless integration testing, using Jest.
*/
import { test, expect, describe, beforeAll, afterAll, jest } from '@jest/globals'

import '../src/expect.eventually.js'

describe("'expect' support for integration tests", () => {

  test.skip("'expect(eventually(...))' should pass when a signal comes in time", async () => {
    let a;
    setTimeout( () => {
      a = 10;
    }, 500 /*ms*/);

    //console.debug("[TEST] starting wait...");
    //await expect(eventually( _ => a !== undefined )).resolves.toBe();    // should pass in ~500ms
    //console.debug("[TEST] wait passed.");

    await expect.eventuallyPromise( _ => a !== undefined );    // should pass in ~500ms
  });

  test.skip("'expect.eventually' should fail when a signal does not come", async () => {
    await expect.eventuallyPromise( _ => false );    // should fail with test timeout
  }, 500 /*ms*/);

  test.skip("'expect.eventually' should (fail and) not give a warning about open handles when a signal does not come in time", async () => {
    // i.e. timeout is controlled by the test timeout, not yet-another setting.

    let a;
    setTimeout( () => {
      a = 10;
    }, 9999999 /*ms*/);

    await expect.eventuallyPromise( _ => a !== undefined );  // should fail with test timeout
  }, 1000 /*ms*/);

  //---

  test("'expect.never' should pass when the signal does not arrive before test times out", async () => {
    await expect.neverPromise( _ => false );    // should pass in ~500ms
  },500 /*ms*/);

  test("'expect.never' should fail when the signal does arrive", async () => {
    let a;
    setTimeout( () => {
      a = 10;
    }, 100 /*ms*/);

    await expect.neverPromise( _ => a !== undefined );  // should fail in ~100ms
  });
});
