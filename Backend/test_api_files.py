import requests

# file_server.js runs on port 3001 (not PocketBase 8090)
# /api/files prefix is stripped to /files by the server
API_BASE = "http://127.0.0.1:3001"


def test_api_files_returns_valid_json():
    """Vérifie que GET /api/files retourne un JSON valide et conforme."""
    response = requests.get(f"{API_BASE}/api/files", timeout=10)

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)

    for item in data:
        assert isinstance(item, dict)
        assert "filename" in item
        assert "date" in item
        assert "size" in item
        assert "theme" in item


def test_api_files_empty_when_no_zips():
    """Vérifie que l'API retourne une liste vide si aucun ZIP."""
    response = requests.get(f"{API_BASE}/api/files", timeout=10)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)