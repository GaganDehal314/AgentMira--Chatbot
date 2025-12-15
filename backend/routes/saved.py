from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorCollection

from backend.db import get_saved_collection
from backend.models import saved_property_doc
from backend.schemas import SavePropertyRequest, SavedProperty
from backend.services.data_loader import PropertyDataLoader

router = APIRouter(prefix="/users", tags=["saved"])
data_loader = PropertyDataLoader()


@router.get("/{user_id}/saved", response_model=list[SavedProperty])
async def get_saved_properties(
    user_id: str, saved_collection: AsyncIOMotorCollection = Depends(get_saved_collection)
) -> list[SavedProperty]:
    saved_cursor = saved_collection.find({"userId": user_id})
    saved_list = await saved_cursor.to_list(length=1000)
    by_id = {p["id"]: p for p in data_loader.load()}

    results: list[SavedProperty] = []
    for saved in saved_list:
        pid = saved.get("propertyId")
        prop = by_id.get(pid)
        if prop:
            results.append(SavedProperty(**prop))
    return results


@router.post("/{user_id}/saved", status_code=201)
async def save_property(
    user_id: str,
    payload: SavePropertyRequest,
    saved_collection: AsyncIOMotorCollection = Depends(get_saved_collection),
) -> dict:
    properties = data_loader.load()
    if not any(p["id"] == payload.property_id for p in properties):
        raise HTTPException(status_code=404, detail="Property not found")

    await saved_collection.update_one(
        {"userId": user_id, "propertyId": payload.property_id},
        {"$set": saved_property_doc(user_id, payload.property_id)},
        upsert=True,
    )
    return {"status": "saved"}


@router.delete("/{user_id}/saved/{property_id}", status_code=204)
async def delete_saved_property(
    user_id: str,
    property_id: str,
    saved_collection: AsyncIOMotorCollection = Depends(get_saved_collection),
) -> None:
    await saved_collection.delete_one({"userId": user_id, "propertyId": property_id})

