import json
import subprocess
import os


def read_script_path():
    settings_path = './settings/bk-config.json'
    
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"ERR > File \"{settings_path}\" does not exists!")
    
    with open(settings_path, 'r') as file:
        config = json.load(file)

    return config["backupper_script_path"]


def setup_cronjob(script_path):
    cron_command = f"0 0 1,15 * * /usr/bin/python3 {script_path}"
    print(f"COM > {cron_command}");
    try:
        result = subprocess.run(['crontab', '-l'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        existing_cron = result.stdout if result.returncode == 0 else ''
        
        if cron_command not in existing_cron:
            new_cron = existing_cron + '\n' + cron_command + '\n'
            subprocess.run(['crontab'], input=new_cron, text=True)
            print("LOG > HorizonGram Backupper successfully scheduled")
        else:
            print("LOG > HorizonGram Backupper already scheduled")
    except Exception as e:
        print("ERR > Error during configuration :: ", str(e))


if __name__ == "__main__":
    try:
        script_path = read_script_path()
        print(f"Script principale trovato: {script_path}")
        setup_cronjob(script_path)
    except Exception as e:
        print("Errore:", e)
