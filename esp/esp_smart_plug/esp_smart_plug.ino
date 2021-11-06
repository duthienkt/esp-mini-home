#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>

#ifndef STASSID
#define STASSID "Du Thien"
#define STAPSK  "23456789"
#endif

#define DEVICE_NAME "ESP_SMART_PLUG_DO_HOME"
#define CHANNEL "duthienkt/home"

#define LED 5
#define RELAY 12
#define BUTTON 4
/**
   8285
   4 5(led) 12(relay) 15
   8266
   1: led, 2: Relay

   13 14 16

*/

const char* ssid = STASSID;
const char* password = STAPSK;
const char* host = DEVICE_NAME;




#define mqtt_server "absol.cf"
const uint16_t mqtt_port = 1883;

WiFiClient espClient;
PubSubClient mqttClient(espClient);



void setupIO() {
  pinMode(LED, OUTPUT);
  pinMode(RELAY, OUTPUT);

  pinMode(BUTTON, INPUT_PULLUP);


  setRelay(false);
}


void setLed(boolean isOn) {
  digitalWrite(LED, isOn ? LOW : HIGH);
}

bool isRelayOn = false;
void setRelay(boolean isOn) {
  digitalWrite(RELAY, isOn ?   HIGH : LOW );
  isRelayOn = isOn;
  setLed(isOn);
}




long long ioTime = 0;
byte buttonSum = 10;
void ioLoop() {
  bool pressing = digitalRead(BUTTON) == LOW;
  if (!pressing && buttonSum < 10) {
    buttonSum++;
  }
  else if (buttonSum > 0 && pressing) {
    buttonSum--;
    if (buttonSum == 0) {
      setRelay(!isRelayOn);
      sendStatus();
    }
  }
}

void setupWifi() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  setLed(true);
  long i = 0;
  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    delay(50);
    setLed(i % 2 == 0);
    ++i;
  }
  setLed(false);
  WiFi.setAutoReconnect(true);
}

void wifiLoop() {
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
    for (int i = 0; i < 6; ++i) {
      setLed(i % 2 == 0);
      delay(166);
    }

    setLed(isRelayOn);
  }
}


void sendStatus() {
  if (isRelayOn) {
    mqttClient.publish(CHANNEL "/" DEVICE_NAME "/status", "ON");
  }
  else {
    mqttClient.publish(CHANNEL "/" DEVICE_NAME "/status", "OFF");
  }
}

void sendOnline() {
  mqttClient.publish(CHANNEL "/online", DEVICE_NAME);
}

void onCommand( byte* payload, unsigned int length) {
  setRelay(payload[0] != '0');
}

void onMessageCb(char* topic, byte* payload, unsigned int length)
{
  if (strcmp(topic, CHANNEL "/" DEVICE_NAME "/command") == 0) {
    onCommand(payload, length);
  }
  else if (strcmp(topic, CHANNEL "/" DEVICE_NAME "/what_status") == 0) {
    sendStatus();
  }
  else if (strcmp(topic, CHANNEL "/who_online") == 0) {
    sendOnline();
  }
}



void setupOTA() {
  ArduinoOTA.setHostname(host);
  ArduinoOTA.onStart([]() { // switch off all the PWMs during upgrade

  });

  ArduinoOTA.onEnd([]() { // do a fancy thing with our board led at end
    //todo
  });

  ArduinoOTA.onError([](ota_error_t error) {
    (void)error;
    ESP.restart();
  });

  /* setup the OTA server */
  ArduinoOTA.begin();
}

void setupMQTT() {
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(onMessageCb);
}

void setup() {
  setupIO();
  setupWifi();
  setupMQTT();
  setupOTA();
}

long long lastPing = 0;
long long timex;
void mqttLoop()
{
  timex = millis();
  if (!mqttClient.connected()) // Chờ tới khi kết nối
  {
    // Thực hiện kết nối với mqtt user và pass
    if (mqttClient.connect( CHANNEL "/" DEVICE_NAME , CHANNEL "/" DEVICE_NAME "/online", 0, 0, CHANNEL "/" DEVICE_NAME "/offline")) //kết nối vào broker
    {
      mqttClient.subscribe(CHANNEL "/" DEVICE_NAME "/command");
      mqttClient.subscribe(CHANNEL "/" DEVICE_NAME "/what_status");
      mqttClient.subscribe(CHANNEL "/who_online");

    }
    else
    {
      setLed(!isRelayOn);
      delay(100);
      setLed(isRelayOn);
    }
  }
  mqttClient.loop();

  if ((timex - lastPing > 10000) || (timex - lastPing < 0) ) {
    lastPing = timex;
    sendOnline();
  }
}



unsigned long t;
void loop() {
  wifiLoop();
  ArduinoOTA.handle();
  mqttLoop();
  ioLoop();
}