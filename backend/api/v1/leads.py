# api/v1/leads.py
# Lead management endpoints.
# Leads are created from chat sessions automatically, or manually via this API.
#
# GET  /leads/          — list with filters: vertical, score, stage, limit, offset
# POST /leads/          — create lead directly (non-chat path, e.g. phone intake)
# PATCH /leads/{id}     — update stage, score, notes, contact info
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.deps import get_db
from models.lead import LeadCreate, LeadUpdate, LeadResponse, LeadListResponse
from services import lead_service

logger  = logging.getLogger(__name__)
router  = APIRouter()


@router.post(
    "/",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a lead",
    description=(
        "Creates a lead directly — used for phone intake or manual entry. "
        "Chat-originated leads are created automatically when a session ends."
    ),
)
async def create_lead(
    body: LeadCreate,
    db   = Depends(get_db),
) -> LeadResponse:
    try:
        return await lead_service.create_lead(db, body)
    except Exception as e:
        logger.error(f"create_lead failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create lead.",
        )


@router.get(
    "/",
    response_model=LeadListResponse,
    summary="List leads",
    description=(
        "Returns paginated leads. Filter by vertical, score (hot/warm/cold), "
        "or stage (new/contacted/booked/won/lost)."
    ),
)
async def list_leads(
    vertical: str | None = Query(None, description="hvac | pest_control | plumbing | roofing"),
    score:    str | None = Query(None, description="hot | warm | cold"),
    stage:    str | None = Query(None, description="new | contacted | booked | won | lost"),
    limit:    int        = Query(50,  ge=1, le=200),
    offset:   int        = Query(0,   ge=0),
    db = Depends(get_db),
) -> LeadListResponse:
    try:
        return await lead_service.get_leads(db, vertical, score, stage, limit, offset)
    except Exception as e:
        logger.error(f"list_leads failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch leads.",
        )


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
    summary="Update a lead",
    description=(
        "Partial update — only fields provided are changed. "
        "Used by dashboard to update stage, add notes, or correct contact info."
    ),
)
async def update_lead(
    lead_id: int,
    body:    LeadUpdate,
    db       = Depends(get_db),
) -> LeadResponse:
    try:
        result = await lead_service.update_lead(db, lead_id, body)
    except Exception as e:
        logger.error(f"update_lead failed: lead_id={lead_id} {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update lead.",
        )
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lead not found: {lead_id}",
        )
    return result