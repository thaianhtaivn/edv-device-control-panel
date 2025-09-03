import requests

url = "http://127.0.0.1:3000/api/v1/device/register"
# url = "http://fqs-alert.vercel.app/api/v1/register"

device_data = {
    "id": "device-01",
    "name": "Test Device Python",
    "fw": "1.0.7",
    "ma": "AA:BB:CC:DD:EE:04",
    "ip": "192.168.1.240",
    "si": "TestWiFi",
    "pa": "testpass123",
    "gw": "192.168.1.1",
    "sm": "255.255.255.0",
    "sg": "1",
    "st": "Offline",
}

try:
    response = requests.post(url, data=device_data)
    print("✅ Response status:", response.status_code, "Device ID:", device_data["id"])
    print("📦 Response JSON:", response.json())
except requests.exceptions.RequestException as e:
    print("❌ Request failed:", e)
