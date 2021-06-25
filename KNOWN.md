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
|`har-validator`|`firebase-tools@9.12.0`, via `request`|
|`request`|`firebase-tools@9.12.0`|
|`uuid`|`firebase-tools@9.12.0`, via `request` and `universal-analytics`|

## "Unable to fetch project Admin SDK" -warning

When launching the Emulators:

```
⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
```

This is because of [these lines](https://github.com/firebase/firebase-tools/blob/806479510cfb1328d8cfe9bb4a2a6e830d91ca61/src/emulator/adminSdkConfig.ts#L37-L40) and the fact that we're not using `demo-*` as the project id.

The author feels that Firebase could shut up this warning, *if there is no active Firebase project*. That obviously makes a project id "fake".

>The convention of `demo-` is a larger than Firebase (GCP) convention. It's great - but not necessarily something that needs to creep in to our user base. It's One More Magic Thing 🧙‍♀️to know.

