#!/bin/bash

# tools/filter-emulators.sh
#
# Output a command for filtering unnecessary warnings (as we think) from the Firebase Emulators console output.
#
# THIS MUST ONLY BE CALLED WHEN THERE'S NO ACTIVE PROJECT.
#
# Reasoning:
#
#   Without an active project (and no other means of authentication, such as tokens), the emulators won't be able
#   to reach the cloud instance, and there's no need for the warnings. Rrright???
#
# Ideally...: 🤞
#
#   - Firebase would have a more "offline first" approach to testing, meaning the _safest_ configuration is also the
#     _easiest_ to set up.
#   - Firebase Emulators would _not call Wolf!_ if there's not one around. (imagine wolf emoji!)
#

# <<
#   ⚠  functions: The following emulators are not running, calls to these services from the Functions emulator will affect production: auth, database, hosting, pubsub, storage
#   ⚠  functions: Unable to fetch project Admin SDK configuration, Admin SDK behavior in Cloud Functions emulator may be incorrect.
# <<
WARN1_KEY="The following emulators are not running"
WARN2_KEY="Unable to fetch project Admin SDK configuration"

# Note:
#   - Need to give the keys as a single 'grep -v'. Piping through multiple 'grep -v's for some reason hides all output.
#   - Multiple approaches with quotes and '\ ' failed; led to using '.'. Works. :P
#
echo "grep -v ${WARN1_KEY// /.}\\|${WARN2_KEY// /.}"

>&2 echo "(( Some Firebase Emulator warnings SUPPRESSED. ))"
