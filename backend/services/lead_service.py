# services/lead_service.py
# All DB operations for leads.
# Uses raw asyncpg — no ORM, consistent with the rest of the codebase.
#
# leads table DDL is in create_leads.sql
import logging
from datetime import datetime

import asyncpg

from models.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse

logger = logging.getLogger(__name__)


async def create_lead(db: asyncpg.Connection, data: LeadCreate) -> LeadResponse:
    row = await db.fetchrow(
        """
        INSERT INTO leads
            (vertical, name, email, phone, location, issue,
             pest_type, damage_type, source, session_id, notes,
             stage, appt_booked)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new',FALSE)
        RETURNING *
        """,
        data.vertical, data.name, data.email, data.phone,
        data.location, data.issue, data.pest_type, data.damage_type,
        data.source, data.session_id, data.notes,
    )
    return _row_to_response(row)


async def get_leads(
    db:       asyncpg.Connection,
    vertical: str | None  = None,
    score:    str | None  = None,
    stage:    str | None  = None,
    limit:    int         = 50,
    offset:   int         = 0,
) -> LeadListResponse:
    filters = []
    params  = []
    i = 1

    if vertical:
        filters.append(f"vertical = ${i}"); params.append(vertical); i += 1
    if score:
        filters.append(f"score = ${i}");    params.append(score);    i += 1
    if stage:
        filters.append(f"stage = ${i}");    params.append(stage);    i += 1

    where = ("WHERE " + " AND ".join(filters)) if filters else ""

    rows = await db.fetch(
        f"""
        SELECT * FROM leads
        {where}
        ORDER BY created_at DESC
        LIMIT ${i} OFFSET ${i+1}
        """,
        *params, limit, offset,
    )
    total = await db.fetchval(f"SELECT COUNT(*) FROM leads {where}", *params)

    return LeadListResponse(
        total = total,
        leads = [_row_to_response(r) for r in rows],
    )


async def update_lead(
    db:      asyncpg.Connection,
    lead_id: int,
    data:    LeadUpdate,
) -> LeadResponse | None:
    # Build SET clause only for fields that were actually provided
    updates = data.model_dump(exclude_none=True)
    if not updates:
        row = await db.fetchrow("SELECT * FROM leads WHERE id = $1", lead_id)
        return _row_to_response(row) if row else None

    set_parts = []
    params    = []
    i = 1
    for key, val in updates.items():
        set_parts.append(f"{key} = ${i}")
        params.append(val)
        i += 1

    params.append(lead_id)
    row = await db.fetchrow(
        f"""
        UPDATE leads
        SET {", ".join(set_parts)}, updated_at = NOW()
        WHERE id = ${i}
        RETURNING *
        """,
        *params,
    )
    return _row_to_response(row) if row else None


def _row_to_response(row) -> LeadResponse:
    return LeadResponse(
        id             = row["id"],
        vertical       = row["vertical"],
        name           = row["name"],
        email          = row["email"],
        phone          = row["phone"],
        location       = row["location"],
        issue          = row["issue"],
        pest_type      = row["pest_type"],
        damage_type    = row["damage_type"],
        source         = row["source"],
        session_id     = row["session_id"],
        score          = row["score"],
        stage          = row["stage"],
        appt_booked    = row["appt_booked"],
        appt_confirmed = row["appt_confirmed"],
        notes          = row["notes"],
        created_at     = row["created_at"],
        updated_at     = row["updated_at"],
    )