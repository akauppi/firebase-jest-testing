# Developer notes

## Tailing `firestore-debug.log`

Firestore prints out sometimes important information in the said file. You can follow it by:

```
$ tail -f -n 100  firestore-debug.log
```

## No `package/package-lock.json`

This is an implementation choice that can be switched, if need be. Currently, since there's so few dependencies (`node-fetch`), the author disabled creating the file. It's intended to keep the set of dependencies the same on all developer's (and CI) machines. If this is ever a problem, let's bring it back.
