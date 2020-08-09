# Ideas for Firebase Emulation

## The emulator could expose its configuration

It would be helpful if a running emulator had a config REST API end point, where test setup could check "what's up".

*`GET` `http://localhost:4000/config` ->*

```
{
  firestore: { 
    port: 6767 
  }  
}
```

ES6 import allows URLs so reading this from test setup becomes a one-liner.

**Benefits**

This would allow detaching launching (and configuring) of emulation from the code using it. Using code wouldn't need to have constants in it - or read the `firebase.json` which now can be renamed or placed in subdirs.

**Work-arounds**

Tried many; nothing quite suits.

Ended up with a setup where `.firebaserc` is sniffed for the project id (needed, even for pure emulation) and `firebase.json` for the Firestore emulation port.

If `firebase.json` is not under its default name, such name must be given by `FIREBASE_JSON` (own convention!) env.var.

This works, but feels clumsy. Thus this suggestion.

