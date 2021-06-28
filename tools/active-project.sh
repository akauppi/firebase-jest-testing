#!/bin/bash

# tools/active-project.sh
#
# Check, whether there is an active Firebase project for the working directory.
#
# Requires:
#   - grep
#
# Return code:
#   0: active project found
#   1: no active project
#
# Note:
#   Don't use 'npx firebase-tools use', since it's way too slow (3s). Our approach is 3ms.
#

# Just checking whether the current dir is on some line (simplistic, but enough). The entry would be in '.activeProjects'
# as a key.
#
FIREBASE_CONFIG=~/.config/configstore/firebase-tools.json
  #
  # Is this the same for all supported systems? (Linux, WSL2)?

cat $FIREBASE_CONFIG | grep -q \"$(pwd)\"
if [[ $? -eq 0 ]] ; then
  # has active project
  exit 0
elif [[ $? -eq 1 ]] ; then
  exit 1
else
  echo 2&>1 "ERROR in detection of Firebase CLI active project"
  exit -2
fi
