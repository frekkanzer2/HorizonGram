import aiohttp
import asyncio
import os
from .serverurl import get_server_api_url

CHUNK_SIZE = 20 * 1024 * 1024  # Dimensione del chunk (20 MB)

async def upload_chunk(file_path, chunk, index, alias):
    url = f"{get_server_api_url()}/chunks/upload"
    form_data = aiohttp.FormData()
    form_data.add_field('file', chunk, filename=os.path.basename(file_path))
    form_data.add_field('filename', os.path.basename(file_path))
    form_data.add_field('folder', alias)
    form_data.add_field('chunkno', str(index))

    async with aiohttp.ClientSession() as session:
        async with session.post(url, data=form_data) as response:
            response_data = await response.json()
            if response.status != 200 or response_data.get('message') != 'File successfully uploaded and sent to Telegram':
                raise Exception(f"ERR > Error while loading chunk number {index} of {file_path}: {response_data.get('message')}")

async def process_file(file_path, alias):

    file_size = os.path.getsize(file_path)
    total_chunks = (file_size + CHUNK_SIZE - 1) // CHUNK_SIZE

    try:
        async with aiohttp.ClientSession() as session:
            # Preparazione del file
            preparation_url = f"{get_server_api_url()}/chunks/upload/preparation"
            preparation_data = {
                "filename": os.path.basename(file_path),
                "folder": alias,
                "totalChunks": total_chunks
            }
            async with session.post(preparation_url, json=preparation_data) as prep_response:
                prep_response.raise_for_status()
                prep_result = await prep_response.json()
                if prep_response.status != 200:
                    raise Exception(f"ERR > Error while preparing file {file_path}: {prep_result.get('message')}")

        # Caricamento dei chunk
        with open(file_path, 'rb') as f:
            for index in range(1, total_chunks + 1):
                chunk = f.read(CHUNK_SIZE)
                await upload_chunk(file_path, chunk, index, alias)
                print(f"UPL > Uploaded chunk number {index}/{total_chunks} for {file_path}")

    except Exception as e:
        print(f"ERR > Generic error for file {file_path}: {e}")

async def upload_files(files_structure):
    for entry in files_structure:
        path = entry['path']
        alias = entry['alias']
        for item in entry['items']:
            file_path = os.path.join(path, item.replace("xDOTx", "."))
            # await process_file(file_path, alias)