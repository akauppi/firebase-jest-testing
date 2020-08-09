/*
* test/eventual.deasync.test.js
*
* EXPERIMENTAL! Test 'expect.eventually' and 'expect.never' when 'deasync' module is available.
*/
import { test, expect, describe, beforeAll, afterAll, jest } from '@jest/globals'

import '../src/expect.eventually.deasync.js'

/*
* 'expect.eventually' with an approach that does not use a Promise.
*/
describe("expect.eventually (deasync approach)", () => {

  test("'expect.eventually' should pass when a signal comes in time", async () => {
    let a;
    setTimeout(() => {
      a = 10;
    }, 500 /*ms*/);

    expect.eventually(_ => a !== undefined);    // should pass in ~500ms
  });

  // tbd. Gets stuck; needs to be provided the test timeout info

  test("'expect.eventually' should fail when a signal does not come", async () => {
    expect.eventually(_ => false);    // should fail with test timeout
  }, 500 /*ms*/);

  test.skip("'expect.eventually' should (fail and) not give a warning about open handles when a signal does not come in time", async () => {
    // i.e. timeout is controlled by the test timeout, not yet-another setting.

    let a;
    setTimeout(() => {
      a = 10;
    }, 9999999 /*ms*/);

    expect.eventually(_ => a !== undefined);  // should fail with test timeout
  }, 1000 /*ms*/);

});
