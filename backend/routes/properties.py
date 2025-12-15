from fastapi import APIRouter, HTTPException, Query
from typing import Union

from backend.schemas import (
    Property,
    PropertySearchRequest,
    PropertySearchResponse,
    CompareRequest,
)
from backend.services.data_loader import PropertyDataLoader
from backend.services.filter import apply_filters, paginate


router = APIRouter(prefix="/properties", tags=["properties"])
data_loader = PropertyDataLoader()


@router.get("/search", response_model=PropertySearchResponse)
async def search_properties(
    location: Union[str, list[str], None] = Query(None),
    min_price: float | None = None,
    max_price: float | None = None,
    min_bedrooms: int | None = None,
    min_bathrooms: int | None = None,
    amenities: list[str] | None = Query(None),
    sort_by: str = "price",
    sort_order: str = "asc",
    page: int = 1,
    page_size: int = 10,
) -> PropertySearchResponse:
    properties = data_loader.load()
    filtered = apply_filters(
        properties,
        location=location,
        min_price=min_price,
        max_price=max_price,
        min_bedrooms=min_bedrooms,
        min_bathrooms=min_bathrooms,
        amenities=amenities,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    total = len(filtered)
    paged = paginate(filtered, page, page_size)
    return PropertySearchResponse(
        total=total,
        page=page,
        page_size=page_size,
        results=[Property(**item) for item in paged],
    )


@router.get("/{property_id}", response_model=Property)
async def get_property(property_id: str) -> Property:
    properties = data_loader.load()
    for item in properties:
        if item["id"] == property_id:
            return Property(**item)
    raise HTTPException(status_code=404, detail="Property not found")


@router.post("/compare", response_model=list[Property])
async def compare_properties(payload: CompareRequest) -> list[Property]:
    properties = data_loader.load()
    by_id = {p["id"]: p for p in properties}
    results = []
    for pid in payload.property_ids:
        prop = by_id.get(pid)
        if prop:
            results.append(Property(**prop))
    return results

