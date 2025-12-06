const Gpiod = require('node-gpiod');

// Raspberry Pi 5では gpiochip4 を使用
const GPIO_CHIP = 4;
const GPIO_PIN = 17;

// GPIOオブジェクトを作成
const led = new Gpiod(GPIO_CHIP, GPIO_PIN, Gpiod.OUTPUT);

// デバイスをオープンしてリクエストモードを設定
led.open();
led.request_mode('LED_Control', Gpiod.OUTPUT_MODE);
console.log(`GPIO${GPIO_PIN}を出力モードで設定しました`);

let value = 0;

const interval = setInterval(async () => {
  value = value ^ 1; // 0/1反転
  try {
    await led.set_values([value]); // Promiseを適切に処理
    console.log(`LED ${value ? 'ON' : 'OFF'}`);
  } catch (error) {
    console.error('エラー:', error);
    clearInterval(interval);
  }
}, 500); // 0.5秒間隔

// プログラム終了時の処理
process.on('SIGINT', async () => {
  clearInterval(interval);
  try {
    await led.set_values([0]);  // LEDを消灯
    led.terminate_request();     // リクエストを終了
    led.close();                 // GPIOリソースを解放
  } catch (error) {
    console.error('終了時エラー:', error);
  }
  console.log('\nプログラムを終了します');
  process.exit();
});