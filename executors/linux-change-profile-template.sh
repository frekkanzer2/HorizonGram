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

if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "ERR :: No Python installation found. Please install it." >&2
    exit 1
fi

echo "INFO :: Detected Python installation: $PYTHON_CMD"
$PYTHON_CMD update_profile.py "$SERVER_FOLDER_PATH" "$SETTINGS_FILE" "$PROFILE_INDEX"

if [ $? -eq 0 ]; then
    echo "OK :: Configuration changed successfully. Please restart Horizongram."
else
    echo "ERR :: An error occured when executing update_config.py file." >&2
    exit 1
fi