import asyncio
from apis.status import check_server_status
from utils.sources import read_backup_sources, get_sources_foldernames

async def main():
    try:
        await check_server_status()
        print("LOG > Successfully connected to HorizonGram")
    except Exception as e:
        print(e)
        return
    sources = read_backup_sources()
    if len(sources) == 0:
        print("LOG > No folders found into sources file, so there's nothing to backup")
        return
    aliases = get_sources_foldernames(sources)
    print("LOG > The following folders will be backupped on HorizonGram")
    [print(f">> {source}") for source in sources]
    print("LOG > The obtained sources will be saved on HorizonGram with the following aliases")
    [print(f">> {alias}") for alias in aliases]

if __name__ == "__main__":
    asyncio.run(main())
