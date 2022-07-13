#!/usr/bin/env node

/*
* Usage:
*   <<
*     $ wait-for [<host>:]<port-int>
*   <<
*
* Waits until the named port becomes available.
*
* Used 'wait-on' npm package earlier, but it misbehaves with Firebase Hosting, since some version (of emulation,
* or the tool, not sure).
*
* - Firebase Hosting DOES NOT PROVIDE 'HEAD' (but gives 404), for paths where 'GET' gives 200. This is the main cause.
* - 'wait-on' uses Axios (or something) that, EVEN WITH 'http-get://' still checks with a 'HEAD' first (this is wait-on's
*   part of the miss).
*
* It seems faster to do a simple tool, than push for the fix upstream, or find tools. :S
*/
const t0 = Date.now();

const url = (() => {
  const arg = process.argv.slice(2) || failExit("Missing '[host:]port' param.");

  const [_,c1,c2] = /^(?:(.+):)?(\d+)$/.exec(arg) || [];
  if (!c2) {
    failExit( `Bad param (expecting '[host:]port'): ${arg}`);
  }

  // tbd. check both with Node.js built-in fetch
  // Undici needs '127.0.0.1' to be able to check port 5002 (checking 6767 works also with 'localhost').
  //
  const defHost = '127.0.0.1';    // 'localhost'

  return `http://${c1 || defHost}:${c2}`;
})();

const POLL_INTERVAL_MS = 150;

function areWeThereYet() {
  fetch(url).then( res => {
    if ((res.status >= 200 && res.status < 300) || (res.status === 404)) {    // ':5002' (Functions end point) provides 404 when up
      console.log(`${url} open after ${ ( (Date.now()-t0)/1000 ).toFixed(1) }s`);
      process.exit(0);

    } else {
      console.error("Returned status:", res.status);    // 300..5xx
      process.exit(4);
    }

  }).catch( err => {
    const { code } = err.cause;

    if (code === 'ECONNREFUSED') {    // port not open (yet)
      setTimeout(areWeThereYet, POLL_INTERVAL_MS);

    } else {
      console.error("Unexpected error:", err);
      process.exit(-9);   // better to fail (and exit also the 'npm' command)
    }
  })
}

areWeThereYet();

function failExit(msg) {    // () => never
  console.error( `ERROR: ${msg}` );
  process.exit(-2);
}
