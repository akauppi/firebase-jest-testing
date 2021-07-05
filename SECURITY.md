# Security


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
