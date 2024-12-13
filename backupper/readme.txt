This readme will be deleted in the release version.

SERVER AUTO-START SETUP
1. Extract HorizonGram on server root (for example: /horizongram/)
2. Install PM2 for nodejs server startup on linux startup
$ npm install -g pm2
3. Start the server with pm2
$ pm2 start <HORIZONGRAM_SERVER_PATH>
EXAMPLE $ pm2 start /horizongram/server/server.js
4. Save PM2 configuration
$ pm2 save
$ pm2 startup
5. Select systemd: it will print out a sudo env command with a variable
EXAMPLE > sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-user --hp /home/your-user
6. Copy and paste into the terminal the sudo env command proposed by PM2
7. Save and restart
$ pm2 save
$ sudo reboot
8a. After reboot, check if the server is executing by curling it
$ curl http://localhost:3000/api/status
8b. Or you can check PM2 logs
$ pm2 logs

BACKUPPER AUTO-START SETUP
1. Install python3 and pip
2. Install python3 requirements by running the following command:
$ pip3 install -r requirements.txt
3. Create the following file:
$ touch ./settings/sources.txt
4. Add in the sources file every path you want to backup
5. Duplicate bk-config-template.json and rename it bk-config.json
6. In ./settings/bk-config.json set the backupper execution path and some other params
7. Go into the backupper folder and execute it
$ python3 setup-backupper-linux.py

EXECUTION
The backupper will execute by the configured cron.
If you want to run it manually, execute the command:
$ python3 <BACKUPPER_ABSOLUTE_PATH>
EXAMPLE $ python3 /horizongram/backupper/backupper.py