import random
import requests
import os
from dotenv import load_dotenv

load_dotenv(override=True)
from typing import Dict
import re
import aiohttp

from tenacity import retry, stop_after_attempt, wait_exponential


@retry(wait=wait_exponential(multiplier=1, min=4, max=60), stop=stop_after_attempt(6))
async def firecrawl_search(query: str, params: Dict = {}):
    FIRECRAWL_KEY = os.environ.get("FIRECRAWL_KEY")
    if not FIRECRAWL_KEY:
        raise ValueError("Firecrawl API key not configured.")
    url = "https://api.firecrawl.dev/v1/search"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {FIRECRAWL_KEY}",
    }
    data = {"query": query}
    for key, value in params.items():
        data[key] = value

    proxy = os.environ.get("PROXY_ADDR")

    async with aiohttp.ClientSession() as session:
        if proxy:
            async with session.post(
                url=url,
                headers=headers,
                json=data,
                proxy=proxy,
            ) as response:
                res = await response.json()
        else:
            async with session.post(url=url, headers=headers, json=data) as response:
                res = await response.json()
        return res