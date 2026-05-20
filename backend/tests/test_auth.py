import pytest

@pytest.mark.asyncio
async def test_register_user(client, test_user):
    response = await client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == test_user["email"]
    assert "id" in data
    assert "hashed_password" not in data

@pytest.mark.asyncio
async def test_register_duplicate_email(client, test_user):
    await client.post("/api/v1/auth/register", json=test_user)
    response = await client.post("/api/v1/auth/register", json=test_user)
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    await client.post("/api/v1/auth/register", json=test_user)
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(client, test_user):
    await client.post("/api/v1/auth/register", json=test_user)
    response = await client.post("/api/v1/auth/login", json={
        "email": test_user["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == 401

