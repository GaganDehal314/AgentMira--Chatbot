import pytest
from fastapi.testclient import TestClient

from backend.app import create_app
from backend.db import get_saved_collection


class FakeCursor(list):
    async def to_list(self, length: int | None = None):
        return list(self)


class FakeSavedCollection:
    def __init__(self):
        self.items = {}

    def find(self, query):
        user_id = query.get("userId")
        return FakeCursor([{"userId": user_id, "propertyId": pid} for pid in self.items.get(user_id, set())])

    async def update_one(self, query, update, upsert=False):
        user_id = query["userId"]
        pid = query["propertyId"]
        self.items.setdefault(user_id, set()).add(pid)
        return None

    async def delete_one(self, query):
        user_id = query["userId"]
        pid = query["propertyId"]
        if user_id in self.items and pid in self.items[user_id]:
            self.items[user_id].remove(pid)
        return None


@pytest.fixture()
def client():
    app = create_app()
    fake_collection = FakeSavedCollection()
    app.dependency_overrides[get_saved_collection] = lambda: fake_collection
    with TestClient(app) as c:
        yield c


def test_health(client: TestClient):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_search_returns_results(client: TestClient):
    resp = client.get("/properties/search", params={"location": "Austin"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 0
    assert isinstance(data["results"], list)


def test_save_and_fetch(client: TestClient):
    save_resp = client.post("/users/demo/saved", json={"property_id": "1"})
    assert save_resp.status_code == 201

    fetch_resp = client.get("/users/demo/saved")
    assert fetch_resp.status_code == 200
    saved = fetch_resp.json()
    assert any(item["id"] == "1" for item in saved)


def test_compare_predict(client: TestClient):
    resp = client.post("/compare/predict", json={"address_a": "Austin, TX", "address_b": "Miami, FL"})
    assert resp.status_code == 200
    data = resp.json()
    assert "properties" in data and len(data["properties"]) == 2

