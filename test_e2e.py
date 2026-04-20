
import asyncio
import httpx
import sys

async def test_api():
    base_url = "http://127.0.0.1:8000"
    idea = "AI habit tracker"

    print(f"Testing {base_url} with idea: '{idea}'")
    
    # 1. Check health first
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(f"{base_url}/health")
            print(f"Health check: {resp.status_code} {resp.json()}")
        except Exception as e:
            print(f"Health check failed: {e}")
            sys.exit(1)

        # 2. Call search endpoint
        try:
            payload = {"idea": idea}
            print(f"sending POST {base_url}/api/validate/step1-search with {payload}")
            resp = await client.post(
                f"{base_url}/api/validate/step1-search",
                json=payload,
                timeout=30.0
            )
            if resp.status_code == 200:
                data = resp.json()
                print(f"Success! Queries generated: {data.get('queries')}")
                results = data.get("results", [])
                print(f"Found {len(results)} competitors:")
                for r in results:
                    print(f" - [{r.get('position')}] {r.get('title')} ({r.get('link')})")
            else:
                print(f"Failed with status {resp.status_code}")
                print(resp.text)
        except Exception as e:
            print(f"Search endpoint failed: {e}")
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(test_api())
