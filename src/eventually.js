/*
* A promise for polling a certain condition. Resolves (with the value of the condition) if the condition becomes
* other than 'undefined'.
*
* Suitable for integration tests where reactions to a change are affected by things outside of the control of the
* existing 'node.js' context. This means e.g. listening to changes indirectly caused in a database, by server-side
* functions.
*/
const timeSliceMs = 100;

// To avoid warnings (of open handles, but also of e.g. trying to log when everything's done), clear the timeouts once
// we hear tests are over.
//
const cleanup = new Set();    // timers still ticking

afterAll( () => {
  cleanup.forEach( h => clearTimeout(h) );
});

async function eventually(cond) {   // (() => any) => Promise of any    ; resolves to the value of 'cond()', if it becomes other than 'undefined'
  let timer;

  let prom = new Promise( (resolve,reject) => {
    function check() {
      const v = cond();
      if (v !== undefined) {
        console.debug("[eventually] passes with:", v);
        resolve(v);
        cleanup.delete(timer);
      } else {
        timer = setTimeout(check, timeSliceMs);   // try again
        cleanup.add(timer);
      }
    }
    check();    // immediate first try, then tick-tock..
  });

  return await prom;
}

export {
  eventually
}
