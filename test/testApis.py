import requests

device_id = "esp-test"

url = f"https://fqs-alert.vercel.app/api/device/{device_id}/status.xml"
url = f"https://fqs-alert.vercel.app/api"

try:
    response = requests.get(url)
    print("✅ Response status:", response.status_code)
    print("📦 Response text:", response.text)  # <-- use .text not .json()
except requests.exceptions.RequestException as e:
    print("❌ Request failed:", e)
