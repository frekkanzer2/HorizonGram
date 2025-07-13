@echo off

:: EDIT THIS SECTION
set server_folder_path=EDIT_HERE
set profile_index=PROFILE_ID
:: END OF EDITING SECTION, DO NOT TOUCH THE FOLLOWING CODE

set file_name=config.json

where python3 >nul 2>nul
if %errorlevel% == 0 (
    set "PYTHON_CMD=python3"
    goto RUN_SCRIPT
)
where python >nul 2>nul
if %errorlevel% == 0 (
    set "PYTHON_CMD=python"
    goto RUN_SCRIPT
)

echo ERR :: No Python installation found. Please install it.
pause
exit /b 1

:RUN_SCRIPT
echo INFO :: Detected Python installation: %PYTHON_CMD%
cd /d "%server_folder_path%"
cd /d ..
cd /d executors
cd /d scripts
%PYTHON_CMD% update_profile.py "%server_folder_path%" "%file_name%" "%profile_index%"
if %errorlevel% neq 0 (
    echo ERR :: An error occured when executing update_config.py file.
    pause
) else (
    echo OK :: Configuration changed successfully. Please restart Horizongram.
    pause
)