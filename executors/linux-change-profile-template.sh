#!/bin/bash

# edit this section
SERVER_FOLDER_PATH="EDIT_HERE"
PROFILE_INDEX=EDIT_HERE
# end of edit section

SETTINGS_FILE="config.json"
cd "$SERVER_FOLDER_PATH" || exit
cd ..
cd executors
cd scripts
python3 update_profile.py "$SERVER_FOLDER_PATH" "$SETTINGS_FILE" "$PROFILE_INDEX"

if [ $? -eq 0 ]; then
    echo "OK :: Configuration changed successfully."
else
    echo "ERR :: An error occured when executing update_config.py file." >&2
    exit 1
fi