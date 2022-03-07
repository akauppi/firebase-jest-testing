#!/bin/bash
set -eu -o pipefail

# List possibly outdated dependencies, in all the subpackages.
#
PATHS=". package sample sample/functions sample.dc"

for _PATH in $PATHS
do
  # '|| true': carry on even if there are listed entries
  npm --prefix "$_PATH" outdated || true
done
