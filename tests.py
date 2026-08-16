import asyncio
from httpx import AsyncClient


hc = AsyncClient(
    http2=True,
    timeout=30.0,
)

async def request():
    response = await hc.get("https://clpzzzz123.replit.app/")
    try:
        response.raise_for_status()
    except Exception as e:
        print(e)


async def main():
    while True:
        groups = [
            request() for i in range(65)
        ]
        await asyncio.gather(*groups)
        print(f"Finished requests: {len(groups)}")

if __name__ == "__main__":
    asyncio.run(main())