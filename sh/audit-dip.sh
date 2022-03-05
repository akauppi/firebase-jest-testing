#!/bin/bash
set -eu -o pipefail

# Provide audit info, without changing repo.
#
PATHS=". sample sample/functions package"

false   # NOT TESTED!!! tbd.

for _PATH in $PATHS
do
  (cd "$_PATH" && \
    rm .npmrc && \
    npm install && \
    (npm audit || true) && \
    \
    git restore .npmrc && \
    rm package-lock.json \
  )
done
