from typing import Any, Dict, List, Optional


def apply_filters(
    properties: List[Dict[str, Any]],
    location: Optional[str | List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    min_bathrooms: Optional[int] = None,
    amenities: Optional[List[str]] = None,
    sort_by: str = "price",
    sort_order: str = "asc",
) -> List[Dict[str, Any]]:
    results = []
    for item in properties:
        # Handle location as string or array
        if location:
            item_location = item.get("location", "").lower()
            # Extract city name from location (e.g., "New York, NY" -> "New York")
            item_city = item_location.split(",")[0].strip()
            
            if isinstance(location, list):
                # Check if item location matches any location in the array
                # Match if the city name matches (handles "New York" matching "New York, NY")
                # Also handle cases where location might be "New York City" matching "New York"
                location_matches = any(
                    loc_lower == item_city or 
                    item_city.startswith(loc_lower) or
                    loc_lower in item_city or
                    item_city in loc_lower
                    for loc in location
                    for loc_lower in [loc.lower()]
                )
                if not location_matches:
                    continue
            else:
                # Handle location as string (original behavior)
                # Check if location string contains the city name
                location_str = str(location).lower()
                if location_str != item_city and not item_city.startswith(location_str) and location_str not in item_city and item_city not in location_str:
                    continue
        price = item.get("price")
        if min_price is not None and (price is None or price < min_price):
            continue
        if max_price is not None and (price is None or price > max_price):
            continue
        if min_bedrooms is not None and item.get("bedrooms", 0) < min_bedrooms:
            continue
        if min_bathrooms is not None and item.get("bathrooms", 0) < min_bathrooms:
            continue
        if amenities:
            item_amenities = set(map(str.lower, item.get("amenities", [])))
            desired = set(map(str.lower, amenities))
            if not desired.issubset(item_amenities):
                continue
        results.append(item)

    reverse = sort_order == "desc"
    if sort_by == "price":
        results.sort(key=lambda x: x.get("price") or 0, reverse=reverse)
    elif sort_by == "bedrooms":
        results.sort(key=lambda x: x.get("bedrooms") or 0, reverse=reverse)
    return results


def paginate(items: List[Dict[str, Any]], page: int, page_size: int) -> List[Dict[str, Any]]:
    start = (page - 1) * page_size
    end = start + page_size
    return items[start:end]

