# Security


## Audit warnings

```
$ npm install
...
3 vulnerabilities (2 low, 1 high)

To address all issues, run:
  npm audit fix

...
26 vulnerabilities (22 moderate, 4 high)
```

<font color=red>That looks BAD</font>.

The bar for this library's production releases is:

- *no* high vulnerabilities 

If they are in libraries, we should wait until those are resolved. <!-- #whisper: this also gives an incentive to keep number of dependencies to the minimum.
-->

Let's see where they arise:

### `@firebase/util`

The list is so long and cryptic, I'm not placing it here...

Firebase **MAY HAVE A SERIOUS (ATTITUDE?) PROBLEM WITH NODE AUDITS** and if you dislike that, going to another serverless stack may be the only option. The name of the library has `firebase` in it, so we're kind of stuck/doomed... 🦤

### `ajv`

```
$ npm list ajv
@local/root@
└─┬ firebase-tools@10.2.0
  ├─┬ @eslint/eslintrc@1.0.5 extraneous
  │ └── ajv@6.12.6 deduped
  ├── ajv@6.12.6
  ├─┬ better-ajv-errors@0.6.7 extraneous
  │ └── ajv@6.12.6 deduped
  ├─┬ eslint@8.6.0 extraneous
  │ └── ajv@6.12.6 deduped
  ├─┬ exegesis@4.1.0
  │ ├─┬ ajv-formats@2.1.1
  │ │ └── ajv@8.8.2
  │ └── ajv@8.8.2
  ├─┬ oas-validator@4.0.8 extraneous
  │ └── ajv@5.5.2 extraneous
  └─┬ request@2.88.2
    └─┬ har-validator@5.1.3
      └── ajv@6.12.6 deduped
```

*See below*

### `jsonpointer`

```
$ npm list jsonpointer
@local/root@
└─┬ firebase-tools@10.2.0
  ├─┬ atlassian-openapi@1.0.13 extraneous
  │ └── jsonpointer@4.1.0 deduped
  ├─┬ better-ajv-errors@0.6.7 extraneous
  │ └── jsonpointer@4.1.0 deduped
  └── jsonpointer@4.1.0 extraneous
```

*See below*

### `nanoid`

Why would `firebase-tools` bring `mocha` to deployment??

```
$ npm list nanoid
@local/root@
└─┬ firebase-tools@10.2.0
  ├─┬ mocha@9.1.3 extraneous
  │ └── nanoid@3.1.25 deduped
  └── nanoid@3.1.25 extraneous
```

>We can contain `firebase-tools` within a Docker VM (see `firebase-ci-builder`), but the author doesn't wish to make Docker a build dependency. It is an option, though...


## Running tests offline

By using `demo-...` project id, the Firebase Emulators are told that the project is to be run offline.



<!-- hidden; using `demo-*`
## Launching Emulators

The Emulators log these lines:

```
$ npm run start
...
⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: auth, database, hosting, pubsub, storage
⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
```

- [ ] What is this about?
- [ ] Does this mean my cloud deployment can be affected, *by running tests locally, or in CI*??

I don't know.

The model we're proposing is one where there is no active Firebase project involved.

You can check this with:

```
$ npx firebase-tools use
No project is currently active.

Run firebase use --add to define a new project alias.
``` 

One would think this means that the emulators are not going to touch the cloud -- but why the warnings?

>There is one way to make the warnings go away. Name your project-id's `demo-` something, and Firebase Emulators treat them as fake ones. That convention is a bit artificial, and is derived from GCP. The author thinks Firebase can do this, simpler!
-->

## Cloud Functions under emulation

A wholly different scenario is what your Cloud Functions might do, under the hood of the emulator.

This is not in the hands of Firebase, since you might access third party APIs from within there.

Be reasonable. This project is not giving you a sample on how to cope with this approach.



**Ideas (since obviously I cannot shut up!):**

- With Docker compose, one can set up an environment that restricts access to the Internet (it's essentially a proxy). One could then white list addresses that the tests are allowed to access, while blocking others.
- This could be beneficial also for not allowing newer images to be loaded, which is something the Firebase Emulators insist on doing (they don't have a global "really, offline!" switch)

The author doesn't see this as valuable enough to develop right now. Samples on how to reach it are welcome, if you did.
