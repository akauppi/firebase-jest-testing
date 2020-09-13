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

