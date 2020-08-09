/*
* test/eventual.test.js
*
* Test 'expect.eventually' and 'expect.never' that are tools for effortless integration testing, using Jest.
*/
import { test, expect, describe, beforeAll, afterAll, jest } from '@jest/globals'

import '../src/expect.eventually.js'

/*
* 'expect.eventually' with an approach that works on plain Jest
*/
describe("expect.eventually (promise approach)", () => {

  test("'expect.eventually' should pass when a signal comes in time", async () => {
    let a;
    setTimeout(() => {
      a = 10;
    }, 500 /*ms*/);

    await expect.eventuallyPromise(_ => a !== undefined);    // should pass in ~500ms
  });

  // Test is skipped, since we cannot expect a timeout, in Jest.
  //
  test.skip("'expect.eventually' should fail with timeout when a signal does not come", async () => {
    await expect.eventuallyPromise(_ => false);    // should fail with test timeout
  }, 500 /*ms*/);

  // Test is skipped, since we cannot expect a timeout, in Jest.
  //
  test.skip("'expect.eventually' should (fail with timeout and) not give a warning about open handles when a signal does not come in time", async () => {
    // i.e. timeout is controlled by the test timeout, not yet-another setting.

    let a;
    setTimeout(() => {
      a = 10;
    }, 9999999 /*ms*/);

    await expect.eventuallyPromise(_ => a !== undefined);  // should fail with test timeout
  }, 1000 /*ms*/);

});

/*
* After approach is simply some code to make Jest wait, until performing the test.
*
* This is useful, until we would get 'expect.never' to work. Differences:
*
*   - after approach needs an explicit timeout to be given; with 'never' we'd like to use the test's own timeout
*   - there is no polling while waiting
*/
describe('after approach', () => {

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  test("After approach when the condition becomes true during the wait", async () => {
    let a;
    setTimeout( () => {
      a = 10;
    }, 100 /*ms*/);

    await sleep(200).then( _ => expect(a).toBe(10) );    // should pass
  });
})

/*
* 'expect.never' is likely NOT doable with Jest (26.2) in the way we'd like... -> 'PROBLEMS.md'
*
* These tests show how we would like it to work.
*/
describe.skip('expect.never', () => {

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
