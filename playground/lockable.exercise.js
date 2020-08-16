/*
* Run 'lockable' manually
*
* Usage:
*   <<
*     $ node playground/lockable.exercise.js [max-sleep-ms]
*   <<
*/
import { lockable } from "../src/tools/lockable.js"

const fn = ".lock.tmp";

const maxSleepMs = process.argv[2] ? parseInt(process.argv[2]) : 3000;

async function randomSleep() {    // () => Promise of ()
  const ms = Math.round( Math.random() * maxSleepMs );
  console.debug(`Sleeping ${ms}ms...`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Don't use 'await' because we want to test a scenario where the codes run in different Node environments (OS level
// locking).

console.debug("1st wait..");
lockable(fn, randomSleep).then( _ => console.debug("1st task done.") );

console.debug("2nd wait..");
lockable(fn, randomSleep).then( _ => console.debug("2nd task done.") );

console.debug("3rd wait..");
lockable(fn, randomSleep).then( _ => console.debug("3rd task done.") );

