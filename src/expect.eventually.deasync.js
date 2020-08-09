/*
* Extensions to Jest 'expect':
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
* The ideology of Cypress testing framework has influenced the idea to make this. -> https://docs.cypress.io
*/
import { expect, afterAll } from '@jest/globals'

import { spawnSync } from 'child_process'

const timeSliceMs = 100;

// We cannot know when Jest has timed out on a certain test. To avoid warnings (of open handles, but also of e.g. trying
// to log when everything's done), clear the timeouts once we hear tests are over.
//
const cleanup = new Set();    // map of timers still ticking

afterAll( () => {
  cleanup.forEach( h => clearTimeout(h) );
});

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

/*** REMOVE
function sleepSync(ms) {
  const sleep = spawnSync('sleep', [ms/1000]);
}
***/

/*
* Make 'expect.eventually' as a _synchronous_ element. Waits until the (internal) promise resolves.
*
* Moving between async approach to a non-async outer layer is *not* normal. We use the 'deasync' package for this
* (read its use case -> https://www.npmjs.com/package/deasync) and did consider sleep, generators etc. first.
*
* We *could* provide a Promise to the test. This leads to either of these syntaxes:
*
*   <<
*       await expect(eventually( _ => a !== undefined )).resolves.toBe();    // works!
*   <<
*
*   <<
*       await expect.eventually( _ => a !== undefined );
*   <<
*
* Both of them require the test writer to use 'await' (or to remember to return the Promise). By using 'deasync' we
* get away from this, into:
*
*   <<
*       expect.eventually( _ => a !== undefined );
*   <<
* */
expect.eventuallyPromise = (cond) => {       // (() => Boolean) => Promise of ()  ; resolves on pass
  const prom = eventually(cond);

  return expect(prom).resolves.toBe();
}

expect.eventually = (cond) => {       // (() => Boolean) => ()    ; returns on pass
  const prom = eventually(cond);

  throw new Error("not implemented");
  //return expect(prom).resolves.toBe();
}

function never(cond) {   // (() => Boolean) => ()   ; returns only if failing

  throw new Error("not implemented");
}

export {
  eventually,
  never
}