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


## Unnecessary emulator warnings

There are a number of warnings in the emulator output that don't seem reasonable.

This is due to a different notion of what makes a project "offline" - between what Firebase [documents](https://firebase.google.cn/docs/emulator-suite/connect_functions?hl=en&%3Bauthuser=3&authuser=3#choose_a_firebase_project) and what the author intuitively chose.

||Firebase|this repo|
|---|---|---|
|active project exists (`firebase use`)|real project; non-emulated access leads to the cloud|not used| 
|no active project|not used|our "offline" project; but we get warnings| 
|`demo-...` project id|offline project; safe|no special naming pattern| 

Calling a project `demo-`something makes sense, in the cloud world, and has been used within GCP for a while.

But any such magic naming convention comes at a cost. Developers need to be aware of this - it needs to be documented - and so forth. Firebase aims at having a lesser learning footprint than GCP, which make the author think *...wish...* that maybe also the middle case (currently undocumented, as per the link above; it says *"A real project is one you configured and activated in the Firebase console..."*) could be treated, in the future, as a demo project by Firebase Emulators.

>In the mean time, it seems suitable to start using the `demo-*` GCP convention so that we are not encouraging risky use of the library, by accident.

Here are the messages we don't think "offline" testing deserves to see:

```
⚠  emulators: You are not currently authenticated so some features may not work correctly. Please run firebase login to authenticate the CLI.
...
⚠  functions: You are not signed in to the Firebase CLI. If you have authorized this machine using gcloud application-default credentials those may be discovered and used to access production services.
```

Occurs only in CI.

```
⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: auth, database, hosting, pubsub, storage
...
⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
```

Occurs both in development and CI.


## Warning about Node version

```
⚠  Your requested "node" version "14 || ^16" doesn't match your global version "16"
```

Unrelated to the other warnings.

One sees this line if the `functions/package.json` node engine definition field has more than a single number.

Why is this?

We use:

```
  "engines": {
    "node": "14 || ^16"
  },
```

..meaning "compatible with either Node 14 or anything compatible with Node 16". Firebase Emulators should parse such a string and be pleased, if one of the conditions is a suitable number.

Why don't we use `"14"`?

That causes problems (errors) in development, if the development machine runs Node other than 14.

What do `npm` docs say about this field? 

- v7 (current) > package.json > [engine](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#engines) (npm Docs)

   Sample is: `"node": ">=0.10.3 <15"`
   
   There's no special mention about only having a number, so presumably the normal `npm` versioning syntax applies.

