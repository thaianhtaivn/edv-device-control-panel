import requests

device_id = "device-07"
url = f"http://localhost:3000/api/v1/update/{device_id}" 
# url = f"https://fqs-alert.vercel.app/api/v1/update/{device_id}"

update_data = { 
    # "status": "Online",
    # "wifiSSID": "UpdatedWiFi",
    # "ipAddress": "192.168.1.222"
    "sg": "10"
}

try:
    response = requests.post(url, json=update_data)
    print("✅ Status:", response.status_code, ",Device ID:", device_id)
    print("📦 Response:", response.json())
except requests.exceptions.RequestException as e:
    print("❌ Request failed:", e)
