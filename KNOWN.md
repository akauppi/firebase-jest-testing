# Known Issues


## Lots of vulnerabilities?!

Within `sample` (native running of Firebase Emulators), yes, there are:

```
$ npm install

> postinstall
> npm --prefix functions install

npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: undefined,
npm WARN EBADENGINE   required: { node: '16' },
npm WARN EBADENGINE   current: { node: 'v17.5.0', npm: '8.4.1' }
npm WARN EBADENGINE }

up to date, audited 231 packages in 828ms

10 packages are looking for funding
  run `npm fund` for details

4 vulnerabilities (3 moderate, 1 high)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.

up to date, audited 1331 packages in 58s

37 packages are looking for funding
  run `npm fund` for details

22 vulnerabilities (17 moderate, 5 high)

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

>**Update:** On 26-Sep-2022, the count is `29 vulnerabilities (22 moderate, 7 high)`.

22 are too many to even track. I wouldn't take this kind of risks in my project... plus it looks untidy.

Within `sample.dc`, not so:

```
$ npm install

> postinstall
> npm --prefix ../sample/functions install

npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: undefined,
npm WARN EBADENGINE   required: { node: '16' },
npm WARN EBADENGINE   current: { node: 'v17.5.0', npm: '8.4.1' }
npm WARN EBADENGINE }

added 230 packages, and audited 231 packages in 12s

11 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

up to date, audited 1 package in 13s

found 0 vulnerabilities
```



## Deprecation warnings

```
$ npm update
npm WARN deprecated uuid@3.4.0: Please upgrade  to version 7 or higher.  Older versions may use Math.random() in certain circumstances, which is known to be problematic.  See https://v8.dev/blog/math-random for details.
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
```

These are due to:

|||
|---|---|
|`request`|`firebase-tools@9.14.0` .. `10.1.2`|
|`uuid@3.4.0`|`firebase-tools@9.14.0` .. `10.1.2`, via `request` and `universal-analytics`|

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


## CI warnings

```
$ cd ci
$ gcloud builds submit ..
...
Step #2: Jest has detected the following 2 open handles potentially keeping Jest from exiting:
Step #2: 
Step #2:   ●  MESSAGEPORT
Step #2: 
Step #2:       at Object.<anonymous> (../../node_modules/node-domexception/index.js:6:12)
Step #2:           at async Promise.all (index 16)
Step #2:           at async Promise.all (index 2)
Step #2:           at async Promise.all (index 0)
Step #2:           at async Promise.all (index 2)
Step #2:           at async Promise.all (index 1)
Step #2: 
Step #2: 
Step #2:   ●  MESSAGEPORT
Step #2: 
Step #2:       at Object.<anonymous> (../../node_modules/node-domexception/index.js:6:12)
Step #2:           at async Promise.all (index 16)
Step #2:           at async Promise.all (index 2)
Step #2:           at async Promise.all (index 0)
Step #2:           at async Promise.all (index 2)
Step #2:           at async Promise.all (index 1)
Step #2:       at TestScheduler.scheduleTests (../../node_modules/@jest/core/build/TestScheduler.js:333:13)
Step #2:       at runJest (../../node_modules/@jest/core/build/runJest.js:404:19)
Step #2:       at _run10000 (../../node_modules/@jest/core/build/cli/index.js:320:7)
Step #2:       at runCLI (../../node_modules/@jest/core/build/cli/index.js:173:3)
Step #2: 
Finished Step #2
```

This is annoying and noisy - but notice that the CI run still succeeds.

```
ID                                    CREATE_TIME                DURATION  SOURCE                                                                                    IMAGES  STATUS
43b835fa-d4bd-4843-aa4d-15ed61483ff9  2022-02-27T19:59:19+00:00  2M17S     gs://ci-builder_cloudbuild/source/1645991958.175113-59a148405f4647f589f5e86062abb79a.tgz  -       SUCCESS
```
