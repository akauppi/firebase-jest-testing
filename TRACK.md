# Track

## Firebase: deprecated `npm` dependencies

- [npm WARN deprecated request@2.88.2: request has been deprecated](https://github.com/firebase/firebase-tools/issues/2215)

In `sample`, when doing a fresh `npm install`, this shows up:

```
$ npm install
npm WARN deprecated har-validator@5.1.3: this library is no longer supported
npm WARN deprecated debug@4.1.1: Debug versions >=3.2.0 <3.2.7 || >=4 <4.3.1 have a low-severity ReDos regression when used in a Node.js environment. It is recommended you upgrade to 3.2.7 or 4.3.1. (https://github.com/visionmedia/debug/issues/797)
npm WARN deprecated debug@4.1.1: Debug versions >=3.2.0 <3.2.7 || >=4 <4.3.1 have a low-severity ReDos regression when used in a Node.js environment. It is recommended you upgrade to 3.2.7 or 4.3.1. (https://github.com/visionmedia/debug/issues/797)
npm WARN deprecated debug@4.1.1: Debug versions >=3.2.0 <3.2.7 || >=4 <4.3.1 have a low-severity ReDos regression when used in a Node.js environment. It is recommended you upgrade to 3.2.7 or 4.3.1. (https://github.com/visionmedia/debug/issues/797)
npm WARN deprecated debug@4.1.1: Debug versions >=3.2.0 <3.2.7 || >=4 <4.3.1 have a low-severity ReDos regression when used in a Node.js environment. It is recommended you upgrade to 3.2.7 or 4.3.1. (https://github.com/visionmedia/debug/issues/797)
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
npm WARN deprecated @manifoldco/swagger-to-ts@2.1.0: This package has changed to openapi-typescript
...
...
```

>We have made a decision not to rush and try to remove request from the codebase all at once as that will almost certainly introduce bugs. Instead we are moving away piece-by-piece as we fix other things.

Mentioned in `KNOWN.md`.


## Firebase emulators: passing Security Rules `debug()` info to the clients

I've raised the idea in Firebase JS SDK [#4793](https://github.com/firebase/firebase-js-sdk/issues/4793) and got the comment:

> I filed an internal feature request for this matter, however we can't provide definite timelines [...]

Nothing's going to happen for that, in the Firebase Issues. It's a graveyard!

- [ ] Check again / ask ~ <strike>Jul 2021</strike> 2024
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

>Note: I (Asko) "solved" this by going to Docker Compose and being able to dictate the Node versions, there.

## Node.js: Native `fetch`

- ["Fetch API has landed into Node.js"](https://news.ycombinator.com/item?id=30161626) (discussion; Feb 22)

   - Node 17.5 has it, but behind a feature flag: `--experimental-fetch`

- [ ] Track node.js releases; when it's been **stable** without needing the feature flag, for **two major releases** ;) we can let the `undici` imports go. 

	- 18.4.0 has it, without a flag

<!--
		```
		$ node -e "console.log(fetch)"
[AsyncFunction: fetch]
		```
-->

## Undici: `fetch` trouble with `localhost`

- [ ] [TypeError: fetch failed](https://github.com/nodejs/undici/issues/1248) (closed; might still be valid?)

   Found a cure, for now (see `config.js`). Once the issue may be resolved, remove the cure.
   
   Note: They claim it cannot be `undici`. Would require more debugging... `#notime`
