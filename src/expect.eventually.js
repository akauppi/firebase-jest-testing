/*
* Extensions to Jest 'expect', _without_ outside dependencies.
*
* '.eventually':
*   - within the remaining lifespan of the test, ensure that the condition is true at least once
*
* '.never':
*   - within the remaining lifespan of the test, ensure that the condition does not become true
*
* These tools are suitable for integration tests, where reactions to a change are affected by things outside of the
* control of the existing node.js context. This means e.g. listening to changes indirectly caused in a database.
*
* Usage:
*   <<
*     import '.../expect.eventually.js'
*   <<
*
* Note: Without outside packages ('deasync' in particular) the calling test _MUST_ be 'async' and it _MUST_ do 'await'
*     on the returned test.
*/
import { expect, afterAll, jest } from '@jest/globals'

const timeSliceMs = 100;

// To avoid warnings (of open handles, but also of e.g. trying to log when everything's done), clear the timeouts once
// we hear tests are over.
//
const cleanup = new Set();    // timers still ticking

afterAll( () => {
  cleanup.forEach( h => clearTimeout(h) );
});

/*
* An internal implementation. Could be used as:
*   <<
*       await expect(eventually( _ => ...condition... )).resolves.toBe();     // clumsy
*   <<
*/
async function eventually(cond) {   // (() => Boolean) => Promise of ()    ; resolves if 'cond' becomes true, otherwise does not
  let timer;

  let prom = new Promise( (resolve,reject) => {
    function check() {
      if (cond()) {
        console.debug("[eventually] Condition passes:", cond);
        resolve();
        cleanup.delete(timer);
      } else {
        //console.debug("[eventually] Waiting..");
        timer = setTimeout(check, timeSliceMs);   // try again
        cleanup.add(timer);
      }
    }
    check();    // immediate first try, then tik-tok
  });

  await prom;
}

/*
* Make sure some condition happens, within the timeout period of the test.
*
* Usage:
*   <<
*       await expect.eventually( _ => ...condition... );
*   <<
*
* NOTE!!! 'await' is needed. If you omit it, the test will succeed instantly (since it's not waiting for a promise).
*     Be aware! A way to bypass that is to use the 'deasync' version.
* */
expect.eventuallyPromise = (cond) => {       // (() => Boolean) => Promise of ()  ; resolves on pass
  const prom = eventually(cond);

  return expect(prom).resolves.toBe();
}

/*
* Make sure some condition does not happen, within the timeout period of the test.
*
* Usage:
*   <<
*       await expect.never( _ => ...condition... );
*   <<
*
* NOTE!!! 'await' is needed.
*
* NOTE: There is no way to get the current Jest test's timeout (is there?) so we ask the test to provide it in the 'ms'
*     parameter. (it would normally be also the last param of the test, to override
*/
expect.neverPromise = (cond) => {       // (() => Boolean, Number) => Promise of ()  ; resolves on pass
  const prom = eventually(cond);

  // Jest API: would LOVE ❤️ to get metadata about the currently executing test.
  //jest.currentTest.timeoutMs    // e.g. 500

  // ..or having an 'onTimeout' callback that could be defined within a test (i.e. here), to be called once/if the test
  // times out. (and the return value could turn such a test into a success).

  // Note: Promise is running. If the condition never happens, Jest would end the test in a timeout. We want that
  //    to be a success.

  return expect(prom).rejects.toBe();

  /***
  //return expect.eventuallyPromise(_ => !cond());

  const prom = eventually(_ => {
    const v = cond();
    console.debug("Polling condition:", v);
    return !v;
  });

  return expect(prom).resolves.toBe();
  ***/
}

export {
  eventually
}
