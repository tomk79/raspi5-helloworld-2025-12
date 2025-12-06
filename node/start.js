const Gpiod = require('node-gpiod');

// Raspberry Pi 5では gpiochip4 を使用
const GPIO_CHIP = 4;
const GPIO_PIN = 17;

// GPIOオブジェクトを作成
const led = new Gpiod(GPIO_CHIP, GPIO_PIN, Gpiod.OUTPUT);
console.log(`GPIO${GPIO_PIN}を出力モードで設定しました`);

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // 0/1反転
  led.set_values([value]); // 配列で値を渡す
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5秒間隔

// プログラム終了時の処理
process.on('SIGINT', () => {
  clearInterval(interval);
  led.set_values([0]);  // LEDを消灯
  led.close();          // GPIOリソースを解放
  console.log('\nプログラムを終了します');
  process.exit();
});