=== IGNORE THIS FOLDER, DO NOT USE IT! ===

This readme will be deleted in the release version.

SETUP
Install python3 and pip
Install python3 requirements by running the following command:
$ pip3 install -r requirements.txt
Create the following file:
$ touch ./settings/sources.txt
Add in the sources file every path you want to backup
Duplicate bk-config-template.json and rename it bk-config.json
In ./settings/bk-config.json set the backupper execution path and some other params
Run:
$ python3 setup-backupper-linux.py

EXECUTION
The backupper will execute by the configured cron.
If you want to run it manually, execute the command:
$ python3 backupper.py