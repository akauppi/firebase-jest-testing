# Developer notes

## Tailing `firestore-debug.log`

Firestore prints out sometimes important information in the said file. You can follow it by:

```
$ tail -f -n 100  firestore-debug.log
```

## No `package/package-lock.json`

This is an implementation choice that can be switched, if need be. Currently, since there's so few dependencies (`node-fetch`), the author disabled creating the file. It's intended to keep the set of dependencies the same on all developer's (and CI) machines. If this is ever a problem, let's bring it back.


## Seeing Firestore contents after `rules-test` runs

The `rules-test` dataset is intended to be read-only, protected by the locks.

If - for debugging this code - you ever need to see what the database contents became, just change the `--project` id in the `package.json` to `rules-test`:

```
    "start": "firebase emulators:start --project=rules-test --config firebase.json --only functions,firestore",
```

The default is `fns-test` so that functions tests would work.
