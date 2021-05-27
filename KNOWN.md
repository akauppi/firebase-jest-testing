# Known Issues

## Deprecation warnings

```
$ npm update
npm WARN deprecated har-validator@5.1.5: this library is no longer supported
npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142
```

These are due to:

|||
|---|---|
|`har-validator`|`firebase-tools@9.11.0`, via `request`|
|`request`|`firebase-tools@9.11.0`|
