def read_backup_sources():
    file_path = "settings/sources.txt"
    try:
        with open(file_path, 'r') as file:
            sources = [line.strip() for line in file if line.strip()]
        return sources
    except FileNotFoundError:
        raise FileNotFoundError(f"ERR > File '{file_path}' not found")
        return []
    except Exception as e:
        raise Exception(f"ERR > An error occurred :: {e}")
        return []

def get_sources_foldernames(sources):
    return [f"1bkp1{source.replace('/', '2')}" for source in sources]