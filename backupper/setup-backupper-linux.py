import json
import subprocess
import os

def get_config():
    settings_path = './settings/bk-config.json'
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"ERR > File \"{settings_path}\" does not exists!")
    with open(settings_path, 'r') as file:
        config = json.load(file)
    return config

def read_script_path():
    config = get_config()
    return config["backupper_script_path"]

def get_cron_expression():
    config = get_config()
    return config["cron_expression"]


def setup_cronjob(script_path, cron_exp):
    cron_command = f"{cron_exp} /usr/bin/python3 {script_path}"
    print(f"COM > {cron_command}");
    try:
        result = subprocess.run(['crontab', '-l'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        existing_cron = result.stdout if result.returncode == 0 else ''
        
        if cron_command not in existing_cron:
            new_cron = existing_cron + '\n' + cron_command + '\n'
            subprocess.run(['crontab'], input=new_cron, text=True)
            print("LOG > HorizonGram Backupper successfully scheduled")
        else:
            print("LOG > HorizonGram Backupper already scheduled. You can delete it by executing: $ crontab -e")
    except Exception as e:
        print("ERR > Error during configuration :: ", str(e))


if __name__ == "__main__":
    try:
        cron_exp = get_cron_expression()
        script_path = read_script_path()
        print(f"Script principale trovato: {script_path}")
        setup_cronjob(script_path, cron_exp)
    except Exception as e:
        print("Errore:", e)
