#!/usr/bin/env node

/*
* Usage:
*   <<
*     $ wait-for [<host>:]<port-int>
*   <<
*
* Waits until the named port becomes available.
*
* Used 'wait-on' npm package earlier, but it misbehaves with Firebase Hosting, starting some version (of emulation,
* or the tool, not sure).
*
* - Firebase Hosting DOES NOT PROVIDE 'HEAD' (but gives 404), for paths where 'GET' gives 200. This is the main cause.
* - 'wait-on' uses Axios (or something) that, EVEN WITH 'http-get://' still checks with a 'HEAD' first (this is wait-on's
*   part of the miss).
*
* It seems faster to do a simple tool, than push for the fix upstream, or find tools. :S
*
* NOTE!!!
*   The author recommends 'wait-for-it' command line tool, if Docker (Compose) is used for development/testing.
*   Here, we are not requiring developers to have Docker; thus the self-made tool.
*/
import fetch from 'node-fetch'

const t0 = Date.now();

const url = (() => {
  const arg = process.argv.slice(2) || failExit("Missing '[host:]port' param.");

  const [_,c1,c2] = /^(?:(.+):)?(\d+)$/.exec(arg) || [];
  if (!c2) {
    failExit( `Bad param (expecting '[host:]port'): ${arg}`);
  }
  return `http://${c1 || 'localhost'}:${c2}`;
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

  }).catch( err => {    // FetchError => ()

    if (err.code === 'ECONNREFUSED') {    // port not open (yet)
      setTimeout(areWeThereYet, POLL_INTERVAL_MS);

    /*** trying without it! Could be because we did not wait for Functions end point, then.
    } else if (err.code === 'ECONNRESET') {   // "request to http://localhost:4000/ failed, reason: socket hang up" (type: 'system'; errno: 'ECONNRESET', code: 'ECONNRESET')
      // This came when Firebase is running under Docker, and getting ready for action (but not quite, yet..)
      setTimeout(areWeThereYet, POLL_INTERVAL_MS);
    ***/

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
