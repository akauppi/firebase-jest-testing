# Known issues

## We may bring in another version of Firebase than the application has

This is presumably okay.

If you do this at the application project:

```
$ npm list firebase
groundlevel-es6-firebase@0.0.1 /Users/asko/Git/GroundLevel-es6-firebase-web
├─┬ @akauppi/firebase-jest-testing@0.0.1-alpha.10
│ └─┬ @firebase/rules-unit-testing@1.0.0
│   └── firebase@7.19.0 
└── firebase@7.20.0 
```

There are two Firebase libraries, here. But they don't collide since one (7.20.0) is used for the app whereas the other (7.19.0) is brought in as a `buildDependency` and only used for the tests.


## Vulnerability warning on `node-fetch` < 2.6.1

It's brought to apps using us, via the dependencies. We've upgraded to `3.0.0-beta.9` which is safe of this, but need the following deps to also update:

- [ ] firebase
- [ ] @firebase/functions > isomorphic-fetch

- See [Node-Fetch downstream security vulnerability](https://github.com/firebase/firebase-js-sdk/issues/3768)

```
$ npm list node-fetch
firebase-jest-testing@0.0.1-beta.2 /Users/asko/Git/firebase-jest-testing
├─┬ firebase@7.20.0
│ ├─┬ @firebase/firestore@1.16.7
│ │ └── node-fetch@2.6.0 
│ └─┬ @firebase/functions@0.4.51
│   └─┬ isomorphic-fetch@2.2.1
│     └── node-fetch@1.7.3 
├─┬ firebase-admin@9.1.1
│ ├─┬ @google-cloud/firestore@4.2.0
│ │ └─┬ google-gax@2.7.0
│ │   └── node-fetch@2.6.1 
│ └─┬ @google-cloud/storage@5.2.0
│   ├─┬ @google-cloud/common@3.3.2
│   │ └─┬ teeny-request@7.0.0
│   │   └── node-fetch@2.6.1 
│   └─┬ gaxios@3.1.0
│     └── node-fetch@2.6.1 
└── node-fetch@3.0.0-beta.9 
```

