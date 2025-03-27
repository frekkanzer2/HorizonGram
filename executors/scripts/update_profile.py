import json
import sys
import os

if len(sys.argv) != 4:
    exit(1)

file_path = sys.argv[1]
file_name = sys.argv[2]
new_setting = sys.argv[3]

settings_path = os.path.join(file_path, "settings")
settings_path = os.path.join(settings_path, file_name)

if not os.path.exists(settings_path):
    exit(1)

with open(settings_path, 'r') as file:
    try:
        config = json.load(file)
    except json.JSONDecodeError as e:
        exit(1)

config["active_account_index"] = int(new_setting)

with open(settings_path, 'w') as file:
    json.dump(config, file, indent=4)
