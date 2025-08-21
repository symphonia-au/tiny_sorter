#include <SimpleWebSerial.h>
#include <Servo.h>

SimpleWebSerial webSerial;
Servo myservo;

int pos = 0;

void setup() {
  myservo.attach(9);
  myservo.write(90);

  Serial.begin(57600);
  // Define events to listen to and their callback
  webSerial.on("redEvent", redEventCallback);
  webSerial.on("blueEvent", blueEventCallback);
  webSerial.send("connection-ok", 0);
  webSerial.log("Sketch begins.\r\n");
}

void loop() {
  webSerial.check();
  delay(5);
}

void redEventCallback(JSONVar data) {
  myservo.write(180);
  delay(1000);
  myservo.write(90);
  delay(1000);
  webSerial.log("OK");
}

void blueEventCallback(JSONVar data) {
  myservo.write(0);
  delay(1000);
  myservo.write(90);
  delay(1000);
  webSerial.log("OK");
}


