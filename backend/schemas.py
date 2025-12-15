from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class Property(BaseModel):
    id: str
    title: str
    price: float
    location: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size: Optional[float] = None
    size_sqft: Optional[float] = None
    amenities: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)


class PropertySearchRequest(BaseModel):
    location: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_bedrooms: Optional[int] = None
    min_bathrooms: Optional[int] = None
    amenities: Optional[List[str]] = None
    sort_by: str = "price"
    sort_order: str = "asc"
    page: int = 1
    page_size: int = 10


class PropertySearchResponse(BaseModel):
    total: int
    page: int
    page_size: int
    results: List[Property]


class SavePropertyRequest(BaseModel):
    property_id: str


class SavedProperty(Property):
    saved: bool = True


class CompareRequest(BaseModel):
    property_ids: List[str]


class CompareAddressesRequest(BaseModel):
    address_a: str
    address_b: str


class PredictedProperty(Property):
    predicted_price: float
    features: Dict[str, Any]


class ComparePredictionResponse(BaseModel):
    properties: List[PredictedProperty]


class NLPRequest(BaseModel):
    text: str

