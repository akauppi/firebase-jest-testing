# Troubles(hooting)

## Stuck at "there are left over .."

```
$ cloud-build-local --dryrun=false ..
2021/03/24 16:03:52 Warning: there are left over step containers from a previous build, cleaning them.
```

If this happens to you (and nothing more is output).

<!-- was; now, restarting Docker seems to be enough
```
$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS                    PORTS               NAMES
bcbc08b57442        busybox             "sh"                     4 hours ago         Exited (0) 4 hours ago                        cloudbuild_vol_59342577-7885-416e-b3aa-a310d84af208-helper
...
```

Pick the container id with `cloudbuild_` in its name.

Restart Docker.

```
$ docker container stop bcbc08b57442
$ docker container rm bcbc08b57442
```
-->

Restart Docker. 

Retry.

After the restart, the cleanup logic seems to pass, reliably.
