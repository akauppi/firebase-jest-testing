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

