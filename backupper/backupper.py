import asyncio
from apis.status import check_server_status
from apis.folders import fetch_folder_names, create_folder, get_backup_folders_and_files
from utils.sources import read_backup_sources, get_sources_foldernames, get_structured_bkp_folders, ignore_uploaded_files
from apis.upload import upload_files

async def main():
    try:
        await check_server_status()
        print("LOG > Successfully connected to HorizonGram")
        ### FOLDERS MANAGEMENT ###
        sources = read_backup_sources()
        if len(sources) == 0:
            print("LOG > No folders found into sources file, so there's nothing to backup")
            return
        aliases = get_sources_foldernames(sources)
        print("LOG > The following folders will be backupped on HorizonGram")
        [print(f">> {source}") for source in sources]
        print("LOG > The obtained sources will be managed by HorizonGram with the following aliases")
        [print(f">> {alias}") for alias in aliases]
        existing_folders = [fname for fname in (await fetch_folder_names()) if fname.startswith('1bkp1')]
        for alias in aliases:
            if alias not in existing_folders:
                await create_folder(alias)
                print(f"LOG > Folder {alias} successfully created")
            else:
                print(f"LOG > Folder creation skipped: {alias} already exists on HorizonGram")
        sources = (sources, aliases)
        remote_bkp_folders = await get_backup_folders_and_files()
        ### END OF FOLDERS MANAGEMENT ###
        sources = get_structured_bkp_folders(sources)
        sources = ignore_uploaded_files(sources, remote_bkp_folders)
        if len(sources) > 0:
            print(f"LOG > Diff start ::")
            for source in sources:
                print(f">> FOLD :: {source['path']} <> {source['alias']}")
                for item in source['items']:
                    print(f">>> IT :: {item.replace('xDOTx', '.')}")
            print(f"LOG > Diff end")
        else:
            print("LOG > Empty diff, there's nothing to backup")
        await upload_files(sources)
    except FileNotFoundError as fe:
        print(fe)
        print("ERR > Follow the setup guide for further informations")
        return
    except Exception as e:
        print(e)
        return

if __name__ == "__main__":
    asyncio.run(main())
