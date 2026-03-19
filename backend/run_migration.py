#!/usr/bin/env python3
# run_migration.py
# Place this in your backend/ root and run: uv run python run_migration.py
# Safe to run multiple times — uses IF NOT EXISTS.

import asyncio
from core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        print("Running migrations...")

        # 1. chat_sessions: form_data column (stores lead form data separately from graph state)
        await conn.execute(text(
            "ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS form_data JSONB"
        ))
        print("✓ chat_sessions.form_data")

        # 2. leads: score column
        await conn.execute(text(
            "ALTER TABLE leads ADD COLUMN IF NOT EXISTS score VARCHAR"
        ))
        print("✓ leads.score")

        # 3. leads: summary column
        await conn.execute(text(
            "ALTER TABLE leads ADD COLUMN IF NOT EXISTS summary TEXT"
        ))
        print("✓ leads.summary")

        # 4. bookings table (new)
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                business VARCHAR NOT NULL,
                vertical VARCHAR NOT NULL,
                team_size VARCHAR,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        print("✓ bookings table")

        # 5. workflow_events table (new)
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
        await conn.execute(text(
            "CREATE INDEX IF NOT EXISTS ix_workflow_events_lead_id ON workflow_events(lead_id)"
        ))
        print("✓ workflow_events table")

        # 6. Clear any old sessions that have name/phone seeded in state
        #    (these will never work correctly — safer to wipe and start fresh)
        result = await conn.execute(text(
            "DELETE FROM chat_sessions WHERE state ? 'name' AND (state->>'name') IS NOT NULL"
        ))
        print(f"✓ Cleared {result.rowcount} stale sessions with seeded contact fields")

        print("\nAll migrations complete. Start the server now.")

    await engine.dispose()

asyncio.run(migrate())