const Gpio = require('onoff').Gpio;

// GPIO17をLEDとして使用（出力モード）
const led = new Gpio(17, 'out');

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // 0/1反転
  led.writeSync(value);
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5秒間隔

// プログラム終了時の処理
process.on('SIGINT', () => {
  clearInterval(interval);
  led.writeSync(0); // LEDを消灯
  led.unexport();    // GPIOリソースを解放
  console.log('\nプログラムを終了します');
  process.exit();
});