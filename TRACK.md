# Track


<!-- don't care
## firebase-js-sdk #2895 ☠️

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- not a reply in 14 <_!--was: 13,4--_> months #sniff 😢

>Note: The issue is clearly in a wrong project - it should be in `firebase-tools`.

The "change" could be e.g. Firebase emulatore REST API recognizing a `dryRun` flag in the URL. If this were to be used, all behaviour would be as-normal (delete, update, set), but no changes would actually be placed in the data.

We've already built a stable work-around. The benefit would be simplified code (and a ~5% speed improvement).
-->


## Firebase: deprecated `npm` dependencies

- [npm WARN deprecated request@2.88.2: request has been deprecated](https://github.com/firebase/firebase-tools/issues/2215)

When doing a fresh `npm install`, this shows up:

```
$ npm install
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
...
```

>We have made a decision not to rush and try to remove request from the codebase all at once as that will almost certainly introduce bugs. Instead we are moving away piece-by-piece as we fix other things.

Mentioned in `KNOWN.md`.


## Firebase emulators: passing Security Rules `debug()` info to the clients

I've raised the idea in Firebase JS SDK [#4793](https://github.com/firebase/firebase-js-sdk/issues/4793) and got the comment:

> I filed an internal feature request for this matter, however we can't provide definite timelines [...]

- [ ] Check again / ask ~ Jul 2021
- [ ] Maybe move the matter to [firebase-tools](https://github.com/firebase/firebase-tools/issues) if making it takes time (it's currently in wrong place since not a matter for the JS client)


## Jest requires `--experimental-vm-modules`

- [ ] [Roadmap for stabilization of vm modules](https://github.com/nodejs/node/issues/37648) (Node.js)

<!-- hidden
According to [Comment in Jest #9430](https://github.com/facebook/jest/issues/9430#issuecomment-851060583):

>After updating to jest v27 (and ts-jest v27), I no longer need `NODE_OPTIONS=--experimental-vm-modules` to run tests in a project with package.json type key set to "module".
   
For us, that is not true.
-->

The [Jest docs](https://jestjs.io/docs/next/ecmascript-modules) mention that `--experimental-vm-modules` is needed.

Track the Node.js issue, and see when we can strip the parameters.


## Jest should not require `--detectOpenHandles` 🏓

- [ ] [Jest does not exit tests cleanly with Firebase Firestore, an older version does. (Potentially jsdom related, repro *is* included.)](https://github.com/facebook/jest/issues/11464) (Jest)

- Also in [Jest + @firebase/rules-unit-testing has unstopped asynchronous operations](https://github.com/firebase/firebase-js-sdk/issues/4884) (Firebase JS SDK)

  >Further digging showed that the gRPC BackoffTimeout was the cause; Jest exits as soon as it finishes. [...]
  
This is about any Firebase gRPC using client. All we can do is wait, and track the Jest issue...

**Work-around**:

Have `--detectOpenHandles` in the Jest parameters.

<!-- Editor's note:
Earned the ping-pong emoji because seemingly neither on Firebase nor Jest turf
-->


## Jest FR: tapping to the test timeout

- [Expecting a Promise *not* to complete, in Jest
](https://stackoverflow.com/questions/67822996/expecting-a-promise-not-to-complete-in-jest) (SO)

The SO entry is stale (no answers; Jun 2021). Looks like a case not currently supported (Jest 27).

- [ ] Prepare a PR to Jest that would implemente this. `#contribute`

  See detailed description in [Jest problems](./Jest%20problems.md).


<!-- hidden
## Concurrently

- [SIGINT is sent twice when pressing Ctrl-C, causing dirty shutdown](https://github.com/kimmobrunfeldt/concurrently/issues/283)

   Have seen this. Not sure it's `concurrently`, though.
-->

## Jest: tapping to timeouts

- [Better timeout errors through deadline checking](https://github.com/facebook/jest/issues/10895)

   That issue has a proposal for tapping to the Jest timeouts. 

   Would it be possible to get a `beforeTimeout` callback?


## Firebase CLI: cribs about npm version

- [Unnecessary [...] warning if multiple sets of versions](https://github.com/firebase/firebase-tools/issues/3699)

   Finally reported that.
   
   Let's see when we get the initial comment. ⏱ Aug 2021.

## Node.js: Native `fetch`

- ["Fetch API has landed into Node.js"](https://news.ycombinator.com/item?id=30161626) (discussion; Feb 22)

- [ ] Which Node.js version brings that
- [ ] evaluate and consider letting `node-fetch` go (once we can demand such node version)
