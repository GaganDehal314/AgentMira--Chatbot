from fastapi import APIRouter

from backend.schemas import (
    CompareAddressesRequest,
    ComparePredictionResponse,
    PredictedProperty,
)
from backend.services.data_loader import PropertyDataLoader
from backend.services.model import price_model

router = APIRouter(prefix="/compare", tags=["compare"])
data_loader = PropertyDataLoader()


def pick_property(address: str, properties: list[dict], used_ids: set[str]) -> dict:
    address_norm = address.lower()
    for prop in properties:
        if prop["id"] in used_ids:
            continue
        loc = str(prop.get("location", "")).lower()
        title = str(prop.get("title", "")).lower()
        if loc in address_norm or address_norm in loc or title in address_norm:
            used_ids.add(prop["id"])
            return prop
    # fallback to first unused
    for prop in properties:
        if prop["id"] not in used_ids:
            used_ids.add(prop["id"])
            return prop
    return properties[0]


def map_features(prop: dict) -> dict:
    title = str(prop.get("title", "")).lower()
    amenities = [a.lower() for a in prop.get("amenities", [])]
    size = prop.get("size") or prop.get("size_sqft") or 1800
    property_type = "Condo" if "condo" in title or "apartment" in title else "SFH"
    has_pool = any("pool" in a for a in amenities)
    has_garage = any("garage" in a for a in amenities)
    school_rating = _school_rating_from_location(prop.get("location", ""))
    year_built = _year_from_price(prop.get("price"))

    return {
        "property_type": property_type,
        "lot_area": int(size if property_type == "SFH" else 0),
        "building_area": int(size if property_type == "Condo" else 0),
        "bedrooms": int(prop.get("bedrooms") or 2),
        "bathrooms": int(prop.get("bathrooms") or 1),
        "year_built": year_built,
        "has_pool": has_pool,
        "has_garage": has_garage,
        "school_rating": school_rating,
    }


def _school_rating_from_location(location: str) -> int:
    city = location.lower()
    table = {
        "new york": 9,
        "miami": 8,
        "los angeles": 8,
        "austin": 7,
        "san francisco": 9,
        "chicago": 7,
        "dallas": 7,
        "seattle": 9,
        "boston": 9,
    }
    for key, rating in table.items():
        if key in city:
            return rating
    return 7


def _year_from_price(price) -> int:
    try:
        if price and price > 1000000:
            return 2018
        if price and price > 700000:
            return 2015
        if price and price > 400000:
            return 2012
        return 2008
    except Exception:
        return 2010


@router.post("/predict", response_model=ComparePredictionResponse)
async def compare_predict(payload: CompareAddressesRequest) -> ComparePredictionResponse:
    properties = data_loader.load()
    used_ids: set[str] = set()
    prop_a = pick_property(payload.address_a, properties, used_ids)
    prop_b = pick_property(payload.address_b, properties, used_ids)

    enriched = []
    for prop in [prop_a, prop_b]:
        features = map_features(prop)
        predicted_price = price_model.predict_price(features, fallback_price=prop.get("price"))
        enriched.append(
            PredictedProperty(
                **prop,
                size_sqft=prop.get("size_sqft") or prop.get("size"),
                predicted_price=predicted_price,
                features=features,
            )
        )

    return ComparePredictionResponse(properties=enriched)


