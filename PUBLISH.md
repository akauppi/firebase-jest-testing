# Publish

```
$ npm login
```

```
$ npm publish --tag beta [--dry-run]
...
Enter OTP: ...
+ firebase-jest-testing@0.0.1-beta.1
```

>Note: Once stable, remove the `publishConfig.tag` entry from `package.json`.

View [https://www.npmjs.com/package/firebase-jest-testing](https://www.npmjs.com/package/firebase-jest-testing).

Check you don't have uncommitted files (`git status`); commit them.
 
```
$ git tag 0.0.1-beta.1    	# what you published
$ git push --tags
```

That's it!

