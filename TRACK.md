# Track

## Concurrently: piping 

- [ ] [Weird hanging bug with --kill-others](https://github.com/kimmobrunfeldt/concurrently/issues/104)

If solved, could enable emulator output filtering also for CI.
 

## Jest cannot handle package `exports` ⚠️

- [Support package exports in `jest-resolve`](https://github.com/facebook/jest/issues/9771) (Jest #9771)
- [Support ESM resolution](https://github.com/browserify/resolve/issues/222) (browserify/resolve #222)

Found ways to come around the limitation (see "work around").

It seems that Jest is approaching ES modules (and `exports` as part of that) with two fronts: one is a native ES module resolver that may or may not be in active development (mentioned in Apr 2020). The mainstream seems to be the `browserify` resolver, which should bring these features eventually to Jest.

All in all, it looks way too deep waters for this project. Let's just wait it out - if you are more eager, please check the situation and help SimenB with the work in Jest!!!

<!-- disabled
**Direction:**

I'd rather see users of this repo helping SimenB with the native resolver:

>I'm currently working on support for ESM natively in Jest, and while we have a version today that sorta works, it's not a compliant implementation. (author of Jest, 25-Apr-20)
-->

**Work around:**

A custom resolver allows us to use the package *almost* as ES modules. It reflects the `exports` section in `package.json`, which is important for testability.

<details><summary>`sample/hack-jest/self-resolver.cjs`</summary>

```
const pkg = require("../../package.json");
const pkgName = pkg.name;   // "firebase-jest-testing"

const exps = pkg.exports;

const tmp = Object.entries(exps).map( ([k,v]) => {
  return [
    k.replace(/^\./, pkgName ),
    v.replace(/^\.\//, '../../')
  ];
});

const lookup = new Map(tmp);
  // e.g. 'firebase-jest-testing' -> '../../src/index.js'

const res = ( request, options ) => {   // (string, { ..see above.. }) => ...

  if (request.startsWith(pkgName)) {
    const hit = lookup.get(request);
    if (!hit) throw new Error("No 'exports' lookup for: "+ request);    // better than assert (causes the right module to be mentioned in the error message)

    return options.defaultResolver( hit, options );   // turned to requiring the file
  } else {
    return options.defaultResolver( request, options );
  }
};

module.exports = res;
```
</details>

<details><summary>`sample/jest.config.default.js`</summary>

```
  // Resolves the subpackage paths using the package's 'exports' (until Jest does...).
  resolver: "../hack-jest/self-resolver.cjs"
```
</details>

Pros:

- this setup allows us to use the library; without needing to sacrifice proper ES module publishing practices
- use of modules exactly as they should be

Cons:

- **does not restrict access to non-exported code** (important since the point of `exports` is encapsulation!)
- requires downstream apps to replicate the hack, until proper `exports` support is there

Turning off the `resolver` in Jest config is enough to see whether it's still required.


## firebase-js-sdk #2895 ☠️

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- not a reply in 14 <!--was: 13,4--> months #sniff 😢

>Note: The issue is clearly in a wrong project - it should be in `firebase-tools`.

The "change" could be e.g. Firebase emulatore REST API recognizing a `dryRun` flag in the URL. If this were to be used, all behaviour would be as-normal (delete, update, set), but no changes would actually be placed in the data.

We've already built a stable work-around. The benefit would be simplified code (and a ~5% speed improvement).


## `node-fetch` v3

[v3 Roadmap](https://github.com/node-fetch/node-fetch/issues/668)

>Situation 13-May-21: 7 checkboxes (only) missing; `beta.9` is the latest release


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


## Cloud Functions: allow functions to be defined as ESM

- [ ] [Add support for parsing function triggers from ES modules](https://github.com/firebase/firebase-tools/pull/3485) (pr)

   Once that's deployed, we can try changing `sample/functions/package.json` to be `type: "module"`.
   
## Concurrently

- [SIGINT is sent twice when pressing Ctrl-C, causing dirty shutdown](https://github.com/kimmobrunfeldt/concurrently/issues/283)

   Have seen this. Not sure it's `concurrently`, though.
