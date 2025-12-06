const lgpio = require('lgpio');

// Raspberry Pi 5では gpiochip4 を使用
const GPIO_CHIP = 4;
const LED_PIN = 17;

// GPIOチップを開く
const handle = lgpio.gpiochip_open(GPIO_CHIP);

// GPIO17を出力として設定
lgpio.gpio_claim_output(handle, LED_PIN, 0);

let value = 0;

setInterval(() => {
  value = value ^ 1; // 0/1反転
  lgpio.gpio_write(handle, LED_PIN, value);
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5秒間隔

process.on('SIGINT', () => {
  lgpio.gpio_write(handle, LED_PIN, 0);
  lgpio.gpio_free(handle, LED_PIN);
  lgpio.gpiochip_close(handle);
  console.log('\nプログラムを終了します');
  process.exit();
});