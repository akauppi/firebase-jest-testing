# Known Issues

## Deprecation warnings

```
$ npm update
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
```

These are due to:

|||
|---|---|
|`har-validator`|`firebase-tools@9.14.0`, via `request`|
|`request`|`firebase-tools@9.14.0`|
|`uuid@3.4.0`|`firebase-tools@9.14.0`, via `request` and `universal-analytics`|

## WSL2 warnings

```
$ npm install
npm WARN optional SKIPPING OPTIONAL DEPENDENCY: fsevents@~2.3.2 (node_modules/chokidar/node_modules/fsevents):
npm WARN notsup SKIPPING OPTIONAL DEPENDENCY: Unsupported platform for fsevents@2.3.2: wanted {"os":"darwin","arch":"any"} (current: {"os":"linux","arch":"x64"})
npm WARN @firebase/database-compat@0.1.2 requires a peer of @firebase/app-compat@0.x but none is installed. You must install peer dependencies yourself.
```

`firebase-admin` 10.0.0 should fix the last warning. It seems unnecessary.


## Warning about Node version

```
⚠  Your requested "node" version "14 || ^16" doesn't match your global version "16"
```

One sees this line if the `functions/package.json` node engine definition field has anything but `"12"` or `"14"`.

Why is this?

We use:

```
  "engines": {
    "node": "14 || ^16"
  },
```

Firebase Emulators should parse such a string and be pleased, if one of the conditions is suitable.

Why don't we use `"14"`?

That causes problems (errors) in development, if the development machine runs Node 16.

### What do the `npm` docs say?

- v7 (current) > package.json > [engine](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#engines) (npm Docs)

   The sample `"node": ">=0.10.3 <15"` implies that normal Node versioning would be in play, here.

   There is **no explicit mention** about needing to support `||` but since Node itself is fine with such a syntax, so should be a tool (Firebase CLI). Firebase is now playing more narrow-minded than its runtime environment.

>See [TRACK](TRACK.md) for the GitHub Issue where this has been reported.
