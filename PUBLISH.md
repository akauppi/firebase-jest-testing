# Publish

Instructions about publishing the package.

## Requirements

- npm user id

```
$ npm login
```

## Steps

```
$ npm publish
```

>Deep note: `tag: alpha` and `access: public` come from the `publishConfig` section in `package.json`.

### Testing the outcome

To see what files would end up being published:

```
$ npm pack
...
npm notice === Tarball Contents === 
npm notice 1.1kB LICENSE          
npm notice 2.0kB src/db.js        
npm notice 1.3kB src/eventually.js
npm notice 1.3kB src/fns.js       
npm notice 200B  index.js         
npm notice 553B  src/prime.js     
npm notice 406B  src/projectId.js 
npm notice 3.8kB package.json     
npm notice 91B   CHANGELOG.md     
npm notice 3.4kB README.md        
npm notice 499B  README.npm.md    
npm notice === Tarball Details === 
...
```

If you see unwanted files, edit the `.npmignore` or `files` in `package.json`.

