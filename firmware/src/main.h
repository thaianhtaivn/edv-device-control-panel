#define _MAIN_H_

#include <Arduino.h>
#include <ArduinoJson.h>
#include <DNSServer.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>
#include <ESP8266httpUpdate.h>
#include <LittleFS.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <network.h>

// Variables for WiFi credentials
#define LED_PIN_TEST 2
#define LED_1 14
#define LED_2 12
#define LED_3 13

#define TCH_1 5
#define TCH_2 4
#define TCH_3 0

const long blink_interval = 500, scan_interval = 100;  // blink_interval at which to blink (milliseconds)
unsigned long blinkMillis = 0, scanMillis = 0;

// Pins
const uint8_t TCH_PINS[] = {TCH_1, TCH_2, TCH_3};
const uint8_t LED_PINS[] = {LED_1, LED_2, LED_3};

// State
bool lastBtn[3];
bool ledState[3];
uint32_t lastDebounceMs[3];
uint8_t deviceState = 0;  // Bitmask for LED states
const uint16_t DEBOUNCE_MS = 30;
