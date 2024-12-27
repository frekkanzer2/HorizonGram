@echo off

:: EDIT THIS SECTION
set file_path=SERVER_FOLDER_PATH
set profile_index=PROFILE_ID
:: END OF EDITING SECTION, DO NOT TOUCH THE FOLLOWING CODE

set file_name=config.json
cd /d "%file_path%"
cd /d ..
cd /d executors
cd /d scripts
python update_profile.py "%file_path%" "%file_name%" "%profile_index%"
if %errorlevel% neq 0 (
    echo ERR :: An error occured when executing update_config.py file.
    pause
) else (
    echo OK :: Configuration changed successfully.
    exit
)