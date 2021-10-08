# Troubles

## Docker Compose

DC is only needed for developing the CI workflow. However, if you use it you may experience these problems. Here's the way out:

### "network [...] not found"?

```
$ docker compose run test
...
[+] Running 2/0
 ⠿ Container firebase-jest-testing_emul_1     Running                                                                                                                                                                                       0.0s
 ⠿ Container firebase-jest-testing_warm-up_1  Created                                                                                                                                                                                       0.0s
[+] Running 0/0
 ⠋ Container firebase-jest-testing_warm-up_1  Starting                                                                                                                                                                                      0.0s
Error response from daemon: network 59197e13d14eb0ea4fc6b11ce5c2a26c15e1ae631dfddeb73d77adfc57d188d5 not found
```

This was persistent. Even restart of the host didn't help.

```
$ docker compose up --force-recreate
```

That solved it. 

<!--
Reference: [docker-compose up fails if network attached to container is removed](https://github.com/docker/compose/issues/5745)
-->

### Maintenance

```
$ docker compose down --remove-orphans
```

May do good, at times!

<!--
The author had 74 (!) orphans.
-->
