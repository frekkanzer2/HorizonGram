import aiohttp
import asyncio
from .serverurl import get_server_api_url

async def get_backup_folders_and_files():
    url = f"{get_server_api_url()}/folder"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()
                data = await response.json()
                filtered_data = {key: value for key, value in data["data"].items() if key.startswith("1bkp1")}
                return filtered_data
    except Exception as e:
        raise Exception(f"ERR > Error connecting to the server: {ex}")

async def fetch_folder_names():
    try:
        url = f"{get_server_api_url()}/folder"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()
                data = await response.json()
                folder_names = list(data["data"].keys())
                return folder_names
    except Exception as ex:
        raise Exception(f"ERR > Error connecting to the server: {ex}")

async def create_folder(name):
    try:
        url = f"{get_server_api_url()}/folder"
        payload = {"name": name}
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as response:
                response.raise_for_status()
                await response.json()
                return
    except Exception as ex:
        raise Exception(f"ERR > Error creating the folder: {ex}")