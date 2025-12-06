const { Chip } = require('node-libgpiod');

// Raspberry Pi 5では /dev/gpiochip4 を使用
const chip = new Chip(4);
const led = chip.getLine(17);

// 出力モードで設定
led.requestOutputMode();

let value = 0;

setInterval(() => {
  value = value ^ 1; // 0/1反転
  led.setValue(value);
}, 500); // 0.5秒間隔

process.on('SIGINT', () => {
  led.setValue(0);
  led.release();
  chip.close();
  process.exit();
});