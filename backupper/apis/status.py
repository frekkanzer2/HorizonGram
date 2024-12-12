import aiohttp
import asyncio
from .serverurl import get_server_api_url

async def check_server_status():
    try:
        url = f"{get_server_api_url()}/status"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()  # Controlla se lo status code della risposta indica un errore
                # Verifica il contenuto della risposta
                json_response = await response.json()
                if json_response.get("message") == "Server is alive":
                    return True
                else:
                    raise Exception(f"ERR > Unexpected response from server: {json_response}")
    except aiohttp.ClientError as e:
        raise Exception(f"ERR > Error connecting to the server: {e}")
    except Exception as ex:
        raise Exception(f"ERR > Error connecting to the server: {ex}")
