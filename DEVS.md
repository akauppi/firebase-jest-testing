# Developer notes

## Tailing `firestore-debug.log`

Firestore prints out sometimes important information in the said file. You can follow it by:

```
$ tail -f -n 100  firestore-debug.log
```

## No `package/package-lock.json`

This is an implementation choice that can be reconsidered, if things change.

Currently, since there's so few dependencies (`node-fetch`), the author disabled creating the file.


## Rules tests: seeing Firestore contents

The `rules-test` dataset is intended to be read-only, protected by the locks.

If &ndash; for debugging this code &ndash; you ever need to see what the database contents became, just change the `--project` id in the `package.json` to `rules-test`:

```
  "start": "firebase emulators:start --project=rules-test",
```

Change the project id eventually back, so that functions tests work.

>Note: With a project name that doesn't start `demo-`, you'll get all kinds of warnings.
