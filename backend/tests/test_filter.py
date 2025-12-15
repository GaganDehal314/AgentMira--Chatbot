from backend.services.filter import apply_filters


def test_filter_by_location_and_bedrooms():
    properties = [
        {"id": "1", "location": "Austin, TX", "price": 400000, "bedrooms": 3},
        {"id": "2", "location": "San Francisco, CA", "price": 900000, "bedrooms": 2},
    ]
    results = apply_filters(properties, location="Austin", min_bedrooms=3)
    assert len(results) == 1
    assert results[0]["id"] == "1"


def test_filter_by_amenities_subset():
    properties = [
        {"id": "1", "amenities": ["pool", "gym"]},
        {"id": "2", "amenities": ["parking"]},
    ]
    results = apply_filters(properties, amenities=["pool"])
    assert len(results) == 1
    assert results[0]["id"] == "1"

