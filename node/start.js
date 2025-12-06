const { Chip } = require('node-gpiod');

// Raspberry Pi 5では gpiochip4 を使用
const chip = new Chip(4);

// GPIO17をLEDとして使用（出力モード）
const line = chip.getLine(17);
const lineConfig = {
  request: {
    type: 'output',
    flags: 0,
    outputValues: [0]
  }
};
line.requestOutputMode();

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