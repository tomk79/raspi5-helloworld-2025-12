const Gpiod = require('node-gpiod');

// Raspberry Pi 5では gpiochip4 を使用
const GPIO_CHIP = 4;
const GPIO_PIN = 17;

// GPIOオブジェクトを作成（チップ番号、ピン番号、モード）
const led = new Gpiod(GPIO_CHIP, GPIO_PIN, Gpiod.OUTPUT);
console.log(`GPIO${GPIO_PIN}を出力モードで設定しました`);

// デバッグ: 利用可能なメソッドを確認
console.log('利用可能なメソッド:', Object.getOwnPropertyNames(Object.getPrototypeOf(led)));
console.log('ledオブジェクト:', led);

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // 0/1反転
  
  // 様々なメソッド名を試す
  if (typeof led.write === 'function') {
    led.write(value);
  } else if (typeof led.setValue === 'function') {
    led.setValue(value);
  } else if (typeof led.set === 'function') {
    led.set(value);
  } else if (typeof led.writeSync === 'function') {
    led.writeSync(value);
  } else {
    console.error('値を書き込むメソッドが見つかりません');
    clearInterval(interval);
    return;
  }
  
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5秒間隔

// プログラム終了時の処理
process.on('SIGINT', () => {
  clearInterval(interval);
  if (typeof led.write === 'function') {
    led.write(0);
  } else if (typeof led.setValue === 'function') {
    led.setValue(0);
  }
  if (typeof led.close === 'function') {
    led.close();
  }
  console.log('\nプログラムを終了します');
  process.exit();
});