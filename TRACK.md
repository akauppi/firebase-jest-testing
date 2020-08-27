# Track

## Jest cannot handle package `exports` ⚠️⚠️⚠️

- <strike>[jest-resolve can't handle "exports"](https://github.com/facebook/jest/issues/10422) (Jest #10422)</strike>
- [Support package exports in `jest-resolve`](https://github.com/facebook/jest/issues/9771) (Jest #9771)
- [Support ESM resolution](https://github.com/browserify/resolve/issues/222) (browserify/resolve #222)

<strike>This is a **show stopper** for us, since an application project cannot use our features.</strike>

Correction: Almost a show stopper for us. Found a way to come around the limitation (see "work around").

The issues state:

>Duplicate of #9771. I haven't had time to work on ESM support in general for the last few months, and the immediate future doesn't look any more promising in that regard, unfortunately... Any help via PRs or research is of course welcome.

&nbsp;
>I chatted with @ljharb about this, and a future version of resolve will support this. So we don't have to implement anything here. Will just hook it up when resolve is released with support for it 🎉

It's a bit more complex than that. It seems that Jest is approaching ES modules (and `exports` as part of that) with two fronts: one is a native ES module resolver that may or may not be in active development (mentioned in Apr 2020). The mainstream seems to be the `browserify` resolver, which should bring these features eventually to Jest.

All in all, it looks way too deep waters for this project. Let's just wait it out - if you are more eager, please check the situation and propose updates to this doc / this repo - or help SimenB with the work in Jest!!!

**Direction:**

I'd rather see users of this repo helping SimenB with the native resolver:

>I'm currently working on support for ESM natively in Jest, and while we have a version today that sorta works, it's not a compliant implementation. (author of Jest, 25-Apr-20)

**Work around:**

A custom resolver allows us to use the package *almost* as ES modules. It reflects the `exports` section in `package.json`, which is important for testability.

`sample/hack-jest/custom-resolver.cjs`:

```
const pkg = require("../../package.json");
const pkgName = pkg.name;   // "@akauppi/firebase-jest-testing"

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

`sample/test-fns/jest.config.cjs`,<br />
`sample/test-rules/jest.config.cjs`:

```
  // Without this, wasn't able to get 'exports' to work.
  resolver: "../hack-jest/custom-resolver.cjs",
```

Pros:

- this setup allows us to use the library; without needing to sacrifice proper ES module publishing practices (no turning back!!)
- use of modules exactly as they should be (turning off the `resolver` in Jest config is enough to see whether it's still required).

Cons:

- does not restrict access to non-exported code (not a big deal)
- requires downstream apps to replicate the hack, until proper `exports` support is there


## Jest allowing `globalSetup` to use `import`

We use this in `sample/test-rules/jest.config.cjs`:

```
  globalSetup: "./setup.jest.cjs"
```

Cannot use an ES module there. Tried all kinds of `.mjs` etc. combinations (Aug 2020).

Track:

- [Native support for ES Modules > comment on globalSetup](https://github.com/facebook/jest/issues/9430#issuecomment-653818834)


**Work around:**
 
- Do the priming of `sample/test-rules` using CommonJS - including dependencies.

 
## firebase-js-sdk #2895

- [FR: Immutability when testing Firestore Security Rules](https://github.com/firebase/firebase-js-sdk/issues/2895) 
   - let's see what Firebase authors reply
		- not a reply in 4 months #sniff 😢

The "change" could be e.g. Firebase emulatore REST API recognizing a `dryRun` flag in the URL. If this were to be used, all behaviour would be as-normal (delete, update, set), but no changes would actually be placed in the data.

If we get that, it's easy to build a REST client around it. We can be the client that allows people to benefit from this. Of course, `@firebase/rules-unit-testing` can also do it, if they see value in the approach.


## Jest #10325

- [chore: convert jest-runtime to ESM](https://github.com/facebook/jest/pull/10325)

This may or may not mean that we can use more ESM, once Jest 27 is out. 🤞