#!/usr/bin/env python3
# run_migration.py
# Run with: uv run python run_migration.py
# Fully idempotent. Safe to run many times.

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from core.config import settings

async def migrate():
    print("\n🚀 Starting database migrations...\n")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    async with engine.begin() as conn:

        # ----- Ensure required extensions -----
        print("• Ensuring Postgres extensions...")
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
        print("  ✓ pgcrypto")

        # ----- chat_sessions updates -----
        print("• Updating chat_sessions...")
        await conn.execute(
            text("ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS form_data JSONB")
        )
        print("  ✓ form_data")

        # ----- leads updates -----
        print("• Updating leads table...")
        await conn.execute(
            text("ALTER TABLE leads ADD COLUMN IF NOT EXISTS score VARCHAR")
        )
        await conn.execute(
            text("ALTER TABLE leads ADD COLUMN IF NOT EXISTS summary TEXT")
        )
        print("  ✓ score")
        print("  ✓ summary")

        # ----- bookings table -----
        print("• Ensuring bookings table exists...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                business VARCHAR NOT NULL,
                vertical VARCHAR NOT NULL,
                team_size VARCHAR,
                message TEXT,
                scheduled_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """))

        # Extra defensive add-columns (table might be old)
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS message TEXT"))
        await conn.execute(text("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ"))
        print("  ✓ bookings table ready")

        # ----- workflow_events table -----
        print("• Ensuring workflow_events table exists...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS workflow_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                lead_id UUID NOT NULL REFERENCES leads(id),
                step INTEGER NOT NULL,
                label VARCHAR NOT NULL,
                status VARCHAR NOT NULL DEFAULT 'active',
                timestamp_str VARCHAR,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """))

        await conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_workflow_events_lead_id ON workflow_events(lead_id)")
        )
        print("  ✓ workflow_events table ready")

        # ----- cleanup stale chat_sessions -----
        print("• Cleaning stale chat_sessions...")
        result = await conn.execute(text("""
            DELETE FROM chat_sessions 
            WHERE state ? 'name' 
              AND coalesce(state->>'name', '') <> ''
        """))
        print(f"  ✓ Removed {result.rowcount} stale sessions")

    await engine.dispose()

    print("\n🎉 All migrations completed successfully.\n")


if __name__ == "__main__":
    asyncio.run(migrate())