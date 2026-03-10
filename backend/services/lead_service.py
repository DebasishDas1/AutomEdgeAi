# services/lead_service.py
# SQLAlchemy AsyncSession — matches Lead ORM model in database.py exactly.
import logging
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Lead
from models.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse

logger = logging.getLogger(__name__)


async def create_lead(db: AsyncSession, data: LeadCreate) -> LeadResponse:
    row = Lead(
        name       = data.name,
        phone      = data.phone,
        email      = data.email,
        source     = data.source,
        vertical   = data.vertical,
        issue      = data.issue,
        city       = data.city,
        user_id    = data.user_id,
        session_id = data.session_id,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return LeadResponse.model_validate(row)


async def get_leads(
    db:       AsyncSession,
    vertical: str | None = None,
    score:    str | None = None,
    stage:    str | None = None,
    limit:    int        = 50,
    offset:   int        = 0,
) -> LeadListResponse:
    q = select(Lead)
    if vertical:
        q = q.where(Lead.vertical == vertical)
    if score:
        q = q.where(Lead.score == score)
    if stage:
        q = q.where(Lead.stage == stage)

    count_q  = select(func.count()).select_from(q.subquery())
    total    = (await db.execute(count_q)).scalar_one()

    rows     = (await db.execute(q.order_by(Lead.created_at.desc()).limit(limit).offset(offset))).scalars().all()

    return LeadListResponse(
        total = total,
        leads = [LeadResponse.model_validate(r) for r in rows],
    )


async def update_lead(
    db:      AsyncSession,
    lead_id: UUID,
    data:    LeadUpdate,
) -> LeadResponse | None:
    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    row    = result.scalar_one_or_none()
    if row is None:
        return None

    updates = data.model_dump(exclude_none=True)
    for key, val in updates.items():
        setattr(row, key, val)

    await db.commit()
    await db.refresh(row)
    return LeadResponse.model_validate(row)