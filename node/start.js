const Gpiod = require('node-gpiod');

// Raspberry Pi 5 uses gpiochip4
const GPIO_CHIP_PATH = '/dev/gpiochip4';
const GPIO_PIN = 17;

// Create GPIO object
const led = new Gpiod(GPIO_CHIP_PATH, GPIO_PIN, Gpiod.OUTPUT);

// Open device and request mode
led.open();
led.request_mode('LED_Control', Gpiod.OUTPUT_MODE);
console.log(`GPIO${GPIO_PIN} configured as output mode`);

let value = 0;

const interval = setInterval(async () => {
  value = value ^ 1; // Toggle 0/1
  try {
    await led.set_values([value]);
    console.log(`LED ${value ? 'ON' : 'OFF'}`);
  } catch (error) {
    console.error('Error:', error);
    clearInterval(interval);
  }
}, 500); // 0.5 second interval

// Handle program termination
process.on('SIGINT', async () => {
  clearInterval(interval);
  try {
    await led.set_values([0]);  // Turn off LED
    led.terminate_request();     // Terminate request
    led.close();                 // Release GPIO resources
  } catch (error) {
    console.error('Error on exit:', error);
  }
  console.log('\nExiting program');
  process.exit();
});