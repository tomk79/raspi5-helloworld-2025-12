const gpiod = require('node-gpiod');

// Raspberry Pi 5では gpiochip4 を使用
const chipPath = '/dev/gpiochip4';
const GPIO_PIN = 17;

// GPIOチップを開く
const chip = gpiod.openChip(chipPath);
console.log(`GPIOチップを開きました: ${chipPath}`);

// GPIO17を出力として設定
const line = chip.getLine(GPIO_PIN);
line.requestOutputMode('LED', 0);
console.log(`GPIO${GPIO_PIN}を出力モードで設定しました`);

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // 0/1反転
  line.setValue(value);
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5秒間隔

// プログラム終了時の処理
process.on('SIGINT', () => {
  clearInterval(interval);
  line.setValue(0);  // LEDを消灯
  line.release();     // GPIOリソースを解放
  chip.close();
  console.log('\nプログラムを終了します');
  process.exit();
});