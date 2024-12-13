import os
import json

def get_server_api_url():
    settings_path = './settings/bk-config.json'
    
    if not os.path.exists(settings_path):
        raise FileNotFoundError(f"ERR > File \"{settings_path}\" does not exists!")
    
    with open(settings_path, 'r') as file:
        config = json.load(file)

    return f"http://{config["server_address"]}:{config["server_port"]}/api"