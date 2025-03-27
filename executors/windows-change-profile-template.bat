@echo off

:: EDIT THIS SECTION
set server_folder_path=EDIT_HERE
set profile_index=PROFILE_ID
:: END OF EDITING SECTION, DO NOT TOUCH THE FOLLOWING CODE

set file_name=config.json
cd /d "%server_folder_path%"
cd /d ..
cd /d executors
cd /d scripts
python update_profile.py "%server_folder_path%" "%file_name%" "%profile_index%"
if %errorlevel% neq 0 (
    echo ERR :: An error occured when executing update_config.py file.
    pause
) else (
    echo OK :: Configuration changed successfully.
    exit
)