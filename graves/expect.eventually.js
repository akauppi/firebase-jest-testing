/*
* Extensions to Jest 'expect':
*
* '.eventuallyPromise':
*   - within the remaining lifespan of the test, ensure that the condition is true at least once
*
* '.after':
*
* '.neverPromise':
*   - within the remaining lifespan of the test, ensure that the condition does not become true
*
* These tools are suitable for integration tests, where reactions to a change are affected by things outside of the
* control of the existing 'node.js' context. This means e.g. listening to changes indirectly caused in a database,
* by server-side functions.
*
* Note!:
*   Without outside packages ('deasync' in particular -> https://github.com/abbr/deasync ) the calling test _MUST_
*   handle the promise. It looks like we cannot implement mere 'expect.eventually', unless we use the 'deasync' package
*   that interacts with Node internal event queue, allowing other execution to continue while we wait.
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
*       await expect(eventually( _ => ...condition... )).resolves.toBe();
*   <<
*
* Note: Ability to be called slightly before a Jest test times out would allow us to turn timeouts into pass/fail.
*   See 'PROBLEMS.md'.
*/
async function eventually(cond) {   // (() => Boolean) => Promise of ()    ; resolves if 'cond' becomes true, otherwise does not
  let timer;

  let prom = new Promise( (resolve,reject) => {

    /* HYPOTHETICAL API that would allow us to reject a test instead of it timing out.
    jest.onTimeout( () => {
      reject();
    });
    */

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
* NOTE!!! 'await' is needed.
* */
expect.eventually /*Promise*/ = (cond) => {       // (() => Boolean) => Promise of ()  ; resolves on pass
  const prom = eventually(cond);

  return expect(prom).resolves.toBe();
}

/*
* Make sure something has happened after a delay.
*
* Usage:
*   <<
*       const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
*         ...
*       await sleep(300).then( expect(...condition...) );
*   <<
*
* Note: Above is so simple it's best to just copy-paste the code to one's tests, instead of providing library support.
*
* NOTE!!! 'await' is needed.
*/

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

  // Q: Is there any way to sniff the current test's timeout value?

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
