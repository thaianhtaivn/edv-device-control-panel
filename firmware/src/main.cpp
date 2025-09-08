#include <main.h>

void setup() {
    pinMode(LED_PIN_TEST, OUTPUT);

    for (uint8_t i = 0; i < 3; i++) {
        pinMode(TCH_PINS[i], INPUT_PULLUP);  // or INPUT_PULLUP if wired to GND
        pinMode(LED_PINS[i], OUTPUT);
        lastBtn[i] = digitalRead(TCH_PINS[i]);
        ledState[i] = LOW;  // or read actual initial state if needed
        digitalWrite(LED_PINS[i], ledState[i]);
        lastDebounceMs[i] = 0;
    }

    Serial.begin(9600);
    delay(100);  // Give some time for the Serial to initialize
    Serial.println("Setup started");
    networkSetup();
    if (serverConnected) {
        registerDevice();
    }
    Serial.println("Setup completed");
}

void loop() {
    unsigned long currentMillis = millis();
    if (!mqttClient.connected()) {
        connectMQTT();
    }
    mqttClient.loop();

    // --- Task 1: Blink test LED ---
    if (currentMillis - blinkMillis >= blink_interval) {
        blinkMillis = currentMillis;
        digitalWrite(LED_PIN_TEST, !digitalRead(LED_PIN_TEST));
    }

    // --- Main Task: Touch detects ---

    for (uint8_t i = 0; i < 3; i++) {
        bool cur = digitalRead(TCH_PINS[i]);

        if (lastBtn[i] == HIGH && cur == LOW) {
            ledState[i] = !ledState[i];
            digitalWrite(LED_PINS[i], ledState[i]);
            deviceState = (uint8_t(ledState[0]) << 2) | (uint8_t(ledState[1]) << 1) | uint8_t(ledState[2]);
            Serial.printf("Button %d pressed. Device LED state: %d\n", i + 1, deviceState);
            mqttClient.publish(publishTopic.c_str(), String(deviceState).c_str());
            lastDebounceMs[i] = currentMillis;
            mqttDeviceState = deviceState;  // Sync the MQTT state with the local state
        }

        lastBtn[i] = cur;
    }

    if (mqttDeviceState != deviceState) {
        deviceState = mqttDeviceState;
        for (int i = 0; i < 3; i++) {
            ledState[i] = (deviceState >> (2 - i)) & 0x01;
            digitalWrite(LED_PINS[i], ledState[i]);
        }
        Serial.printf("MQTT command received. Device LED state updated to: %d\n", deviceState);
    }
}