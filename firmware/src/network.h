#ifndef _NETWORK_H
#define _NETWORK_H

const char* current_version = "1.0.2";
const char* OTA_TOKEN = "edv@token2025";

// WiFi credentials
const char* ssid = "AT";
const char* password = "1234567890";

// HiveMQ Cloud credentials
const char* mqtt_server = "22db085eee894127baa4da34ad5568b8.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "esp8266.tai.thai";
const char* mqtt_pass = "T@i09092025";

bool serverConnected = false;
uint8_t mqttDeviceState = 0;  // Global variable to hold the device state

String deviceID = "edv-" + String(ESP.getChipId(), HEX);
String publishTopic = deviceID + "/status";
String subscribeTopic = deviceID + "/command";

WiFiClientSecure client;

String serverUrl = "https://edv-device-control.vercel.app/";
HTTPClient http_request;

// MQTT client & secure connection
PubSubClient mqttClient(client);

// Function prototypes
String getRSSI();
void connectMQTT();
void callback(char* topic, byte* payload, int length);
void setupWiFi();
void performOTAUpdate(String firmwareLatestVersion);
void setupOTA(const char* deviceName);
bool connectToServer();
void networkSetup();
void registerDevice();
void updateDeviceState(uint8_t state);

String getRSSI() {
    int rssi = (WiFi.RSSI() + 100) / 10;
    return String(rssi);
}

void connectMQTT() {
    while (!mqttClient.connected()) {
        Serial.print("Connecting to MQTT...");
        if (mqttClient.connect("ESP8266Client", mqtt_user, mqtt_pass)) {
            Serial.println("connected");
            mqttClient.subscribe(subscribeTopic.c_str());
        } else {
            Serial.print("failed, rc=");
            Serial.print(mqttClient.state());
            delay(2500);
        }
    }
}

void callback(char* topic, byte* payload, int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("]: ");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
    mqttDeviceState = atoi((char*)payload);
}

void setupWiFi() {
    WiFi.begin(ssid, password);
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected. IP address: ");
    Serial.println(WiFi.localIP());

    client.setInsecure();

    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(callback);
    connectMQTT();

    setupOTA(deviceID.c_str());
}

void performOTAUpdate(String firmwareLatestVersion = "1.0.0") {
    // Example: espfirmware1.2.3.bin
    String url = serverUrl + "api/v1/ota/espfirmware" + firmwareLatestVersion + ".bin?token=" + OTA_TOKEN;

    Serial.println("Checking for update at: " + url);

    t_httpUpdate_return ret = ESPhttpUpdate.update(client, url);

    switch (ret) {
        case HTTP_UPDATE_FAILED:
            Serial.printf("Update failed. Error (%d): %s\n",
                          ESPhttpUpdate.getLastError(),
                          ESPhttpUpdate.getLastErrorString().c_str());
            break;
        case HTTP_UPDATE_NO_UPDATES:
            Serial.println("No update found.");
            break;
        case HTTP_UPDATE_OK:
            Serial.println("Update successful!");
            break;
    }
}

void setupOTA(const char* deviceName = "iot-device-test") {
    Serial.printf("OTA checking %s \n", deviceName);
    http_request.begin(client, serverUrl + "api/v1/ota/latest");
    int httpCode = http_request.GET();
    if (httpCode == HTTP_CODE_OK) {
        String latest_version = http_request.getString();
        latest_version.trim();
        Serial.printf("Current: %s, Latest: %s\n", current_version, latest_version.c_str());
        if (latest_version != current_version) {
            Serial.println("New version available! Updating...");
            performOTAUpdate(latest_version);
        } else {
            Serial.println("Device already up-to-date.");
        }
    } else {
        Serial.printf("Version check failed, HTTP code: %d\n", httpCode);
    }

    http_request.end();
}

bool connectToServer() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi not connected!");
        return false;
    }
    HTTPClient http;
    http.begin(client, serverUrl + "api/v1/ota/latest");
    int httpCode = http.GET();
    if (httpCode > 0) {
        Serial.printf("Server response code: %d\n", httpCode);
        http.end();
        return true;
    } else {
        Serial.printf("Failed to connect, error: %s\n", http.errorToString(httpCode).c_str());
        http.end();
        return false;
    }
}

void networkSetup() {
    setupWiFi();

    serverConnected = connectToServer();
    if (serverConnected) {
        Serial.println("Connected to server successfully.");
    } else {
        Serial.println("Failed to connect to server.");
    }
}

void registerDevice() {
    http_request.begin(client, serverUrl + "api/v1/device/register");
    http_request.addHeader("Content-Type", "application/json");

    JsonDocument device_data;

    device_data["id"] = deviceID;                      // Device ID
    device_data["fw"] = current_version;               // Firmware version
    device_data["ma"] = WiFi.macAddress();             // MAC address
    device_data["ip"] = WiFi.localIP().toString();     // Local IP address
    device_data["si"] = WiFi.SSID();                   // SSID
    device_data["pa"] = "savedPASS";                   // Password
    device_data["gw"] = WiFi.gatewayIP().toString();   // Gateway IP address
    device_data["sm"] = WiFi.subnetMask().toString();  // Subnet mask
    device_data["sg"] = getRSSI();                     // Signal strength
    device_data["pt"] = "8001";                        // Device port

    String payload;
    serializeJson(device_data, payload);

    Serial.println(payload);

    int httpCode = http_request.POST(payload);
    if (httpCode >= HTTP_CODE_OK && httpCode < 300) {
        String response = http_request.getString();
        Serial.println("Device registered successfully: " + response);
    } else {
        Serial.println("Device registration failed with code: " + String(httpCode));
    }
    http_request.POST(payload);

    http_request.end();
}

void updateDeviceState(uint8_t state) {
    if (!serverConnected) {
        Serial.println("Not connected to server. Cannot update state.");
        return;
    }

    http_request.begin(client, serverUrl + "api/v1/device/update");
    http_request.addHeader("Content-Type", "application/json");

    JsonDocument device_data;
    device_data["id"] = deviceID;    // e.g., "edv-ABC123"
    device_data["field"] = "state";  // the field name your server will update
    device_data["value"] = state;    // the value to set

    String payload;
    serializeJson(device_data, payload);

    int httpCode = http_request.POST(payload);
    if (httpCode >= 200 && httpCode < 300) {
        String response = http_request.getString();
        Serial.println("Status updated successfully: " + response);
    } else {
        Serial.println("Status update failed with code: " + String(httpCode));
        String err = http_request.getString();
        if (err.length()) Serial.println("Server said: " + err);
    }

    http_request.end();
    yield();
}

#endif