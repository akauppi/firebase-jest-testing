/*
* src/promiseTools.js
*
* A promise that can be triggered from outside. For Jest tests to use.
*
* Based on:
*   - "Resolve Javascript Promise outside function scope" (StackOverflow)
*     -> https://stackoverflow.com/questions/26150232/resolve-javascript-promise-outside-function-scope
*/
import { afterAll } from '@jest/globals'

const cleanup = new Set();   // promises not yet resolved (does it even matter??)

afterAll( () => {
  cleanup.forEach( h => clearTimeout(h) );
});

/*
* A 'Promise'-look-alike that can time out.
*
* - Can also be resolved from the outside.
*
* On time out:
*   - if 'onTimeout' has been given, resolves with it
*   - if none has been given, rejects
*
* Times out with '.resolve(undefined)'. Use other values in your code to differ from a timeout.
*/
function bestBeforePromise({ /*timeoutMs,*/ onTimeout }) {   // ({ timeoutMs: <int>, onTimeout: () => any }) => Promise-like

  let resLeak, rejLeak;
  const promise = new Promise((res, rej) => {
    resLeak = res;
    rejLeak = rej;
  });

  /***
  function clear(h) {
    clearTimer(h);
    cleanup.delete(h);
  }

  // Note: 'setTimeout' needs a 'clearTimeout' even when it triggers. Otherwise, Jest claims there is an open handle.
  //
  const timer = setTimeout( () => {
    clear(timer);    // seems clearing is needed, also when the timer rings

    if (onTimeout) resLeak( onTimeout() );
    else rejLeak( new Error("timed out") );

    //console.debug("!!! Timed out");
  }, timeoutMs );
  ***/

  return {
    resolve(v) {
      //clear(timer);
      resLeak(v);
    },
    then: promise.then.bind(promise),   // these should make it look like 'Promise' in JavaScript
    catch: promise.catch.bind(promise),
    [Symbol.toStringTag]: 'Promise'
  }
}

export { bestBeforePromise }
