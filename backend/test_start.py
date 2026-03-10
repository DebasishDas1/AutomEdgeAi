import asyncio
import sys

from core.database import AsyncSessionLocal
from services.workflow_service import workflow_service

async def main():
    async with AsyncSessionLocal() as db:
        try:
            res = await workflow_service.start_session(db, "hvac", "test")
            print("SUCCESS:", res)
        except Exception as e:
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
