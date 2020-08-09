/*
* EXPERIMENTAL
*
* 'expect.eventually' so that we wouldn't need a Promise API.
*
* Why?
*   - may look more natural as simply 'expect.eventually( _ => ...condition... )' ?
*
* Need feedback, whether this is preferred over 'await expect.eventually(...)'.
*/
import { expect, afterAll } from '@jest/globals'

const timeSliceMs = 100;

import deasync from 'deasync'

/** disabled. Uncertain if this is needed or not.
/*
* Delay the overall Jest exit a bit.
*
* Without this, tests sometime pass but often there's this:
*   <<
*     Assertion failed: (handle->type == UV_TCP || handle->type == UV_TTY || handle->type == UV_NAMED_PIPE), function uv___stream_fd, file ../deps/uv/src/unix/stream.c, line 1622.
*   <<
*_/
afterAll( () => {

  //deasync.sleep(0);
});
*/

/*
* Pass if 'cond()' becomes true, at some point within the test's timeout period.
*
* NOTE: This code GETS STUCK on timeout, without the '.onTimeout' hook from Jest. DO NOT USE!!!
*/
expect.eventually = (cond) => {       // (() => Boolean) => ()  ; returns on pass
  let counter= 0;
  let timedOut = false;

  /* HYPOTHETICAL. Jest (26.2) does not have '.onTimeout'
  jest.onTimeout( () => {
    timedOut = true;
  });
  */

  // Note: The '.loopWhile' only checks with us occasionally, in our tests 5 times within 500ms. This means it should
  //    not consume CPU a lot.
  //
  deasync.loopWhile(_ => {
    ++counter;
    return (!timedOut) && (!cond());
  });    // lets node.js event queue run on each loop

  //console.debug("Finished with loops: ", counter);    // 5

  if (timedOut) {
    throw new Error("Timed out");
  }

  // tbd. Is there any benefit of making a dummy 'expect'?
  //expect(true).toBeTruthy();
}

/*
* Pass if 'cond()' remains false, throughout the the test's timeout period (measured in samples).
*/
expect.never = (cond) => {       // (() => Boolean) => ()  ; returns on pass
  let counter= 0;
  let timedOut = false;

  /* HYPOTHETICAL
  jest.onTimeout( () => {
    timedOut = true;
  });
  */

  deasync.loopWhile(_ => {
    ++counter;
    return (!timedOut) && cond();
  });    // lets node.js event queue run on each loop

  //console.debug("Finished with loops: ", counter);    // 5

  if (!timedOut) {
    throw new Error("Condition happened before timeout");
  }

  // tbd. Is there any benefit of making a dummy 'expect'?
  //expect(true).toBeTruthy();
}
