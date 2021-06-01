# Track

## Jest cannot handle package `exports` ⚠️

- <strike>[jest-resolve can't handle "exports"](https://github.com/facebook/jest/issues/10422) (Jest #10422)</strike>
- [Support package exports in `jest-resolve`](https://github.com/facebook/jest/issues/9771) (Jest #9771)
- [Support ESM resolution](https://github.com/browserify/resolve/issues/222) (browserify/resolve #222)

Found ways to come around the limitation (see "work around").

The issues state:

>Duplicate of #9771. I haven't had time to work on ESM support in general for the last few months, and the immediate future doesn't look any more promising in that regard, unfortunately... Any help via PRs or research is of course welcome.

<p></p>
>I chatted with @ljharb about this, and a future version of resolve will support this. So we don't have to implement anything here. Will just hook it up when resolve is released with support for it 🎉

It's a bit more complex than that. It seems that Jest is approaching ES modules (and `exports` as part of that) with two fronts: one is a native ES module resolver that may or may not be in active development (mentioned in Apr 2020). The mainstream seems to be the `browserify` resolver, which should bring these features eventually to Jest.

All in all, it looks way too deep waters for this project. Let's just wait it out - if you are more eager, please check the situation and propose updates to this doc / this repo - or help SimenB with the work in Jest!!!

**Direction:**

I'd rather see users of this repo helping SimenB with the native resolver:

>I'm currently working on support for ESM natively in Jest, and while we have a version today that sorta works, it's not a compliant implementation. (author of Jest, 25-Apr-20)

**Work around:**

A custom resolver allows us to use the package *almost* as ES modules. It reflects the `exports` section in `package.json`, which is important for testability.

`sample/hack-jest/self-resolver.cjs`:

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

`sample/jest.config.default.js`:

```
  // Resolves the subpackage paths using the package's 'exports' (until Jest does...).
  resolver: "../hack-jest/self-resolver.cjs"
```

Pros:

- this setup allows us to use the library; without needing to sacrifice proper ES module publishing practices
- use of modules exactly as they should be

   Turning off the `resolver` in Jest config is enough to see whether it's still required.

Cons:

- **does not restrict access to non-exported code** (important since the point of `exports` is encapsulation!)
- requires downstream apps to replicate the hack, until proper `exports` support is there


## firebase-js-sdk #2895

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- not a reply in 13 <!--was: 4--> months #sniff 😢

The "change" could be e.g. Firebase emulatore REST API recognizing a `dryRun` flag in the URL. If this were to be used, all behaviour would be as-normal (delete, update, set), but no changes would actually be placed in the data.

If we get that, it's easy to build a REST client around it. We can be the client that allows people to benefit from this. Of course, `@firebase/rules-unit-testing` can also do it, if they see value in the approach.

>Update 13-May-21: 
>
>Going to build a locking mechanism, likely using Firebase itself for it. Such extra code could be removed if immutability control ever gets to the official APIs.


## `node-fetch` v3

[v3 Roadmap](https://github.com/node-fetch/node-fetch/issues/668)

>Situation 13-May-21: 7 checkboxes (only) missing; `beta.9` is the latest release


<!-- See KNOWN.md
## Deprecated `npm` dependencies

- [Replace request with something better](https://github.com/jsdom/jsdom/issues/2792) (jsdom); affects JEST

   - [x] `jsdom` [#3092](https://github.com/jsdom/jsdom/pull/3092)
   - [x] JEST using the updated `jsdom`

- [npm WARN deprecated request@2.88.2: request has been deprecated](https://github.com/firebase/firebase-tools/issues/2215) (firebase-tools)

When doing a fresh `npm install`, this shows up:

```
$ npm install
npm WARN deprecated request-promise-native@1.0.9: request-promise-native has been deprecated because it extends the now deprecated request package, see https://github.com/request/request/issues/3142
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
...
```
-->

## Firebase emulators: passing Security Rules `debug()` info to the clients

I've raised the idea in Firebase JS SDK [#4793](https://github.com/firebase/firebase-js-sdk/issues/4793) and got the comment:

> I filed an internal feature request for this matter, however we can't provide definite timelines [...]

- [ ] Check again / ask ~ Jul 2021
- [ ] Maybe move the matter to [firebase-tools](https://github.com/firebase/firebase-tools/issues) if making it takes time (it's currently in wrong place since not a matter for the JS client)


## Firebase docs: return schema of `httpsCallable` on the wire

- [httpsCallable REST API interface uses field result instead of data - conflicts with the docs](https://github.com/firebase/firebase-tools/issues/3377)

Check if they acknowledge the issue and whether the schema should be as in the docs.


## Modular `firebase-admin` (alpha)

A modular version of `firebase-admin` is currently [in alpha](https://modular-admin.web.app).

Let's take it into use, once it's stable.


## Jest requires `--experimental-vm-modules`

- [ ] [Roadmap for stabilization of vm modules](https://github.com/nodejs/node/issues/37648) (Node.js)

According to [Comment in Jest #9430](https://github.com/facebook/jest/issues/9430#issuecomment-851060583):

>After updating to jest v27 (and ts-jest v27), I no longer need `NODE_OPTIONS=--experimental-vm-modules` to run tests in a project with package.json type key set to "module".
   
For us, that is not true.

>According to @SimenB, here are the issues that should probably be taken care of before we unflag and mark vm modules as stable

Track the Node.js issue, and see when we can strip the parameters.


## Jest should not require `--detectOpenHandles`

- [ ] [Jest does not exit tests cleanly with Firebase Firestore, an older version does. (Potentially jsdom related, repro *is* included.)](https://github.com/facebook/jest/issues/11464) (Jest)

Also in Firebase JS SDK: [Jest + @firebase/rules-unit-testing has unstopped asynchronous operations](https://github.com/firebase/firebase-js-sdk/issues/4884)

  >Further digging showed that the gRPC BackoffTimeout was the cause; Jest exits as soon as it finishes. [...]
  
This is about any Firebase gRPC using client. All we can do is wait, and track the Jest issue...

