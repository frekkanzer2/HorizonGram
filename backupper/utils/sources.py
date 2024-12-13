import os
import re

def read_backup_sources():
    script_dir = os.path.dirname(os.path.abspath(__file__)).replace('utils', '')
    file_path = os.path.join(script_dir, 'settings/sources.txt')
    try:
        with open(file_path, 'r') as file:
            sources = [line.strip() for line in file if line.strip()]
        return sources
    except FileNotFoundError:
        raise FileNotFoundError(f"ERR > File '{file_path}' not found")
        return []
    except Exception as e:
        raise Exception(f"ERR > An error occurred :: {e}")

def get_sources_foldernames(sources):
    return [f"1bkp1{source.replace('/', '2')}" for source in sources]

def get_structured_bkp_folders(complex_sources):
    paths, aliases = complex_sources
    result = []
    try:
        for path, alias in zip(paths, aliases):
            items = []
            for root, _, files in os.walk(path):
                for file in files:
                    items.append(os.path.relpath(os.path.join(root, file), path))
            result.append({
                "path": path,
                "alias": alias,
                "items": items
            })
    except Exception as e:
        raise Exception(f"ERR > An error occurred :: {e}")
    return result

def __modify_filename_with_cloud_syntax(filename):
    if ".tar.gz" in filename:
        filename = filename.replace(".tar.gz", ".tarxDOTxgz")
    occurrences = re.findall(r'\.', filename)
    if occurrences and len(occurrences) > 1:
        filename = re.sub(r'\.(?=.*\.)', '-', filename)
    filename = filename.replace('.', 'xDOTx')
    return filename

def ignore_uploaded_files(sources, remote_bkp_folders):
    filtered_sources = []
    for source in sources:
        remote_files = remote_bkp_folders.get(source['alias'], {}).keys()
        source['items'] = [__modify_filename_with_cloud_syntax(item) for item in source['items']]
        filtered_items = [
            item for item in source['items']
            if item not in remote_files
        ]
        if filtered_items:
            filtered_sources.append({
                'path': source['path'],
                'alias': source['alias'],
                'items': filtered_items
            })
    return filtered_sources