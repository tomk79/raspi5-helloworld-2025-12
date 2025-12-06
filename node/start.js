const Gpio = require('pigpio').Gpio;

const GPIO_PIN = 17;

// Create GPIO object with pigpio
const led = new Gpio(GPIO_PIN, {mode: Gpio.OUTPUT});

console.log(`GPIO${GPIO_PIN} configured as output mode`);

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // Toggle 0/1
  led.digitalWrite(value);
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5 second interval

// Handle program termination
process.on('SIGINT', () => {
  clearInterval(interval);
  led.digitalWrite(0);  // Turn off LED
  console.log('\nExiting program');
  process.exit();
});