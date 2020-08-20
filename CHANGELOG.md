# Changelog

## 20-Aug-20

- using Jest custom resolver to be able to use package `exports`
- picking active project only from `GCLOUD_PROJECT` (well, fallback to run `firebase use`)

## 19-Aug-20 (0.0.1-alpha.3)

- used with `npm link` with an app project
- some `export` changes
- need to publish because Jest might dislike `npm link`

## 17-Aug-20

- `firebase**.json` and `.firebaserc` brought to the root dir
- Everything mentioned in `README` should work.

## 16-Aug-20

- reorganisation to `sample/test-fns`, `sample/test-rules`
- [x] `npm run test:rest:all` passes
- [~] `npm run test:rules:all` passes

## 14-Aug-20

- Security Rules tests implemented (uses ES modules, yay!)
- some tests still fail

## 9-Aug-20

- `npm run test:all` passes
- initial; `expect.eventually` works
