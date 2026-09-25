"""Core API regression tests for KisanGyan endpoints and auth-protected flows."""

import io
import os

import pytest
import requests
from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv("/app/backend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
API_BASE = f"{BASE_URL.rstrip('/')}/api" if BASE_URL else None
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")


def assert_no_mongo_id(payload):
    if isinstance(payload, dict):
        assert "_id" not in payload
        for value in payload.values():
            assert_no_mongo_id(value)
    elif isinstance(payload, list):
        for item in payload:
            assert_no_mongo_id(item)


@pytest.fixture(scope="session")
def api_client():
    if not API_BASE:
        pytest.skip("REACT_APP_BACKEND_URL is required for public endpoint testing")
    session = requests.Session()
    return session


@pytest.fixture(scope="session")
def mongo_db():
    if not MONGO_URL or not DB_NAME:
        pytest.skip("MONGO_URL and DB_NAME are required for DB verification tests")
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    yield db
    client.close()


@pytest.fixture()
def mobile_user_session(api_client):
    payload = {
        "provider": "mobile",
        "name": "TEST_API_User",
        "phone": "9876543210",
        "otp": "123456",
    }
    response = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["phone"] == payload["phone"]
    assert isinstance(data["token"], str) and len(data["token"]) > 10
    assert_no_mongo_id(data)
    token = data["token"]
    return {"token": token, "user": data["user"], "headers": {"Authorization": f"Bearer {token}"}}


# Public catalog and telemetry modules
def test_root_status(api_client):
    response = api_client.get(f"{API_BASE}/", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "KisanGyan"
    assert data["data_mode"] == "demonstration"
    assert_no_mongo_id(data)


def test_products_catalog_shape(api_client):
    response = api_client.get(f"{API_BASE}/products", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    assert any(item["category"] == "Pesticides" for item in data)
    assert all("guide" in item and len(item["guide"]) >= 1 for item in data)
    assert_no_mongo_id(data)


def test_prices_catalog_shape(api_client):
    response = api_client.get(f"{API_BASE}/prices", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 8
    assert any(item["unit"] == "45 kg bag" for item in data)
    assert any(item["unit"] == "50 kg bag" for item in data)
    assert_no_mongo_id(data)


def test_telemetry_shape(api_client):
    response = api_client.get(f"{API_BASE}/telemetry", timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["sample"] is True
    assert isinstance(data["ndvi"], float)
    assert_no_mongo_id(data)


# Auth and protected resources
def test_protected_routes_require_token(api_client):
    me = api_client.get(f"{API_BASE}/auth/me", timeout=20)
    profile = api_client.put(f"{API_BASE}/profile", json={"village": "X", "district": "Y", "crop": "Wheat", "area": 1}, timeout=20)
    history = api_client.get(f"{API_BASE}/history", timeout=20)
    assert me.status_code == 401
    assert profile.status_code == 401
    assert history.status_code == 401


def test_protected_routes_reject_invalid_token(api_client):
    bad_headers = {"Authorization": "Bearer not-a-valid-token"}
    me = api_client.get(f"{API_BASE}/auth/me", headers=bad_headers, timeout=20)
    history = api_client.get(f"{API_BASE}/history", headers=bad_headers, timeout=20)
    assert me.status_code == 401
    assert history.status_code == 401


def test_auth_rejects_invalid_mobile(api_client):
    payload = {"provider": "mobile", "name": "TEST_Invalid", "phone": "12345", "otp": "123456"}
    response = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    assert response.status_code == 422


def test_auth_rejects_missing_mobile(api_client):
    payload = {"provider": "mobile", "name": "TEST_Invalid", "otp": "123456"}
    response = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    assert response.status_code == 422


def test_auth_rejects_bad_otp(api_client):
    payload = {"provider": "mobile", "name": "TEST_Invalid", "phone": "9876543210", "otp": "000000"}
    response = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    assert response.status_code == 400
    assert "123456" in response.json().get("detail", "")


def test_google_demo_login_creates_isolated_profile(api_client):
    payload = {"provider": "google", "name": "TEST_GoogleUser"}
    first = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    second = api_client.post(f"{API_BASE}/auth/demo", json=payload, timeout=20)
    assert first.status_code == 200
    assert second.status_code == 200
    first_data = first.json()
    second_data = second.json()
    assert first_data["user"]["provider"] == "google"
    assert second_data["user"]["provider"] == "google"
    assert first_data["user"]["id"] != second_data["user"]["id"]


def test_auth_me_and_profile_update_persist(api_client, mobile_user_session):
    me_before = api_client.get(f"{API_BASE}/auth/me", headers=mobile_user_session["headers"], timeout=20)
    assert me_before.status_code == 200
    before_data = me_before.json()
    assert before_data["id"] == mobile_user_session["user"]["id"]

    payload = {"village": "TEST_Village", "district": "Agra", "crop": "Mustard", "area": 4.25}
    update = api_client.put(f"{API_BASE}/profile", json=payload, headers=mobile_user_session["headers"], timeout=20)
    assert update.status_code == 200
    updated_data = update.json()
    assert updated_data["farm"]["village"] == payload["village"]
    assert updated_data["farm"]["district"] == payload["district"]
    assert updated_data["farm"]["crop"] == payload["crop"]
    assert updated_data["farm"]["area"] == payload["area"]

    me_after = api_client.get(f"{API_BASE}/auth/me", headers=mobile_user_session["headers"], timeout=20)
    assert me_after.status_code == 200
    persisted = me_after.json()
    assert persisted["farm"]["village"] == payload["village"]
    assert_no_mongo_id(persisted)


# Advice and history flows
def test_guest_advice_multilingual(api_client):
    for language in ["hi", "en", "mr", "pa"]:
        response = api_client.post(
            f"{API_BASE}/advice",
            json={"question": "mandi rate for tomato", "language": language},
            timeout=20,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == language
        assert isinstance(data["answer"], str) and len(data["answer"]) > 20
        assert_no_mongo_id(data)


def test_signed_in_advice_saved_to_history(api_client, mobile_user_session):
    question = "TEST voice history question"
    response = api_client.post(
        f"{API_BASE}/advice",
        json={"question": question, "language": "en"},
        headers=mobile_user_session["headers"],
        timeout=20,
    )
    assert response.status_code == 200

    history = api_client.get(f"{API_BASE}/history", headers=mobile_user_session["headers"], timeout=20)
    assert history.status_code == 200
    entries = history.json()
    matched = [h for h in entries if h["question"] == question and h["type"] == "voice"]
    assert len(matched) >= 1
    assert_no_mongo_id(entries)


# Scanner workflows
def test_guest_scan_valid_jpeg(api_client):
    with open("/app/frontend/public/assets/farmer.jpg", "rb") as image:
        files = {"file": ("farmer.jpg", image, "image/jpeg")}
        data = {"crop": "tomato"}
        response = api_client.post(f"{API_BASE}/scan", files=files, data=data, timeout=20)
    assert response.status_code == 200
    body = response.json()
    assert body["crop"] == "tomato"
    assert body["simulated"] is True
    assert_no_mongo_id(body)


def test_scan_rejects_invalid_format(api_client):
    files = {"file": ("fake.txt", io.BytesIO(b"plain text"), "text/plain")}
    data = {"crop": "tomato"}
    response = api_client.post(f"{API_BASE}/scan", files=files, data=data, timeout=20)
    assert response.status_code == 400


def test_scan_rejects_oversized_file(api_client):
    large_bytes = b"\xff\xd8\xff" + (b"a" * (8 * 1024 * 1024 + 2))
    files = {"file": ("large.jpg", io.BytesIO(large_bytes), "image/jpeg")}
    data = {"crop": "wheat"}
    response = api_client.post(f"{API_BASE}/scan", files=files, data=data, timeout=30)
    assert response.status_code == 413


def test_signed_in_scan_saved_to_history(api_client, mobile_user_session):
    with open("/app/frontend/public/assets/farmer.jpg", "rb") as image:
        files = {"file": ("farmer.jpg", image, "image/jpeg")}
        data = {"crop": "maize"}
        response = api_client.post(
            f"{API_BASE}/scan",
            files=files,
            data=data,
            headers=mobile_user_session["headers"],
            timeout=20,
        )
    assert response.status_code == 200

    history = api_client.get(f"{API_BASE}/history", headers=mobile_user_session["headers"], timeout=20)
    assert history.status_code == 200
    entries = history.json()
    assert any(item["type"] == "scan" for item in entries)


# Callback and order request persistence
def test_callback_saved_and_reference_format(api_client, mongo_db):
    payload = {
        "name": "TEST Callback",
        "phone": "9876543210",
        "topic": "Crop advice",
        "preferred_time": "Morning (9 AM – 12 PM)",
        "message": "Need call",
        "consent": True,
    }
    response = api_client.post(f"{API_BASE}/callbacks", json=payload, timeout=20)
    assert response.status_code == 200
    data = response.json()
    assert data["id"].startswith("KG-")
    assert data["status"] == "saved_not_dispatched"

    db_record = mongo_db.callbacks.find_one({"id": data["id"]})
    assert db_record is not None


def test_order_validation_and_persistence(api_client, mongo_db):
    invalid_product = {
        "name": "TEST Buyer",
        "phone": "9876543210",
        "topic": "Product enquiry",
        "preferred_time": "Morning (9 AM – 12 PM)",
        "message": "Need product",
        "consent": True,
        "product_id": "not-real",
        "quantity": 2,
    }
    bad_product = api_client.post(f"{API_BASE}/orders", json=invalid_product, timeout=20)
    assert bad_product.status_code == 404

    bad_quantity = {**invalid_product, "product_id": "neem-bio", "quantity": 0}
    quantity_error = api_client.post(f"{API_BASE}/orders", json=bad_quantity, timeout=20)
    assert quantity_error.status_code == 422

    valid_order = {**invalid_product, "product_id": "neem-bio", "quantity": 3}
    good = api_client.post(f"{API_BASE}/orders", json=valid_order, timeout=20)
    assert good.status_code == 200
    order_data = good.json()
    assert order_data["id"].startswith("KO-")
    assert order_data["total"] == 1350
    assert_no_mongo_id(order_data)

    db_record = mongo_db.orders.find_one({"id": order_data["id"]})
    assert db_record is not None


def test_user_and_session_written_to_db(mobile_user_session, mongo_db):
    user_id = mobile_user_session["user"]["id"]
    user = mongo_db.users.find_one({"id": user_id})
    session = mongo_db.sessions.find_one({"user_id": user_id})
    assert user is not None
    assert session is not None
