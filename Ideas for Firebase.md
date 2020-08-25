# Ideas for Firebase Emulation

## The emulator could expose its configuration

The Firebase emulator configuration story needs to be more firm. Currently (Firebase 8.8.1) configuration is found in a number of places.

- place it all in `firebase.json`
- allow command line overrides for `firebase emulator:exec`
- allow a central place for discovery of such settings

*`GET` `http://localhost:4000/config` ->*

```
{
  firestore: { 
    port: 6767 
  }  
}
```

ES `import` allows URLs so reading this from test setup becomes a one-liner.

**Benefits**

This would allow detaching launching (and configuring) of emulation from the code using it. Using code wouldn't need to have constants in it - or read the `firebase.json` which now can be renamed or placed in subdirs.

**Work-arounds**

Tried many; nothing quite suits.

Ended up with a combination of reading `firebase.json` contents and `FIRESTORE_EMULATOR_HOST` env.var.

This works, but feels clumsy. Thus the suggestion.


## Command line overrides for most `firebase.json` values

For `firebase.json`, command line overrides for **all** (or most) of the config entries would take away the need to have two config files in one's project[^1]. There'd only be the main file (at root) and commands such as starting an emulator could override the fields they need.

[^1]: We got away from that :)

