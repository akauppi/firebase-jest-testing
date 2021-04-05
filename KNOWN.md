# Known Issues

## Deprecation warnings

```
$ npm update
npm WARN deprecated request-promise-native@1.0.9: request-promise-native has been deprecated because it extends the now deprecated request package, see https://github.com/request/request/issues/3142
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
```

These are due to:

|||
|---|---|
|`har-validator`|`@firebase/rules-unit-testing`|
|`request`|`jest-circus`, `@firebase/rules-unit-testing`|
|`request-promise-native`|`jest-circus`|

