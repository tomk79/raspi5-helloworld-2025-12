const { execSync, spawn } = require('child_process');
const GPIO_LED = 17;  // LED用GPIO
const GPIO_SWITCH = 4;  // スイッチ用GPIO
let gpioSetProcess = null;
let gpioGetProcess = null;

// GPIO値を書き込む関数
function writeGPIO(pin, value) {
  try {
    // gpioset を使用してGPIOピンに値を書き込む
    // Raspberry Pi 5ではgpiochip0 (chip 0)を使用
    gpioSetProcess = spawn('gpioset', [
      '-c', '0',
      `${pin}=${value ? '1' : '0'}`
    ], {
      stdio: 'ignore',
      detached: false
    });
    
    // GPIO値が書き込まれるまで少し待機
    const start = Date.now();
    while (Date.now() - start < 10) {
      // 10ms待機
    }
    
    // 値が書き込まれたのでプロセスを終了
    if (gpioSetProcess) {
      try {
        gpioSetProcess.kill('SIGTERM');
      } catch (e) {}
      gpioSetProcess = null;
    }
    
    return true;
  } catch (err) {
    console.error('GPIO write error:', err.message);
    return false;
  }
}

// GPIO値を読み込む関数
function readGPIO(pin) {
  try {
    // gpioget を使用してGPIOピンの値を読み込む
    // 出力形式: "4"=inactive または "4"=active
    const result = execSync(`gpioget -c 0 ${pin}`, { encoding: 'utf8' });
    const trimmed = result.trim();
    // "=active"で終わっていれば1、そうでなければ0
    return trimmed.endsWith('=active') ? 1 : 0;
  } catch (err) {
    console.error('GPIO read error:', err.message);
    return 0;
  }
}

// GPIOクリーンアップ関数
function cleanupGPIO() {
  try {
    // gpioプロセスを終了
    if (gpioSetProcess) {
      gpioSetProcess.kill();
      gpioSetProcess = null;
    }
    if (gpioGetProcess) {
      gpioGetProcess.kill();
      gpioGetProcess = null;
    }
    // すべてのgpiosetプロセスをクリーンアップ
    try {
      execSync(`pkill -f "gpioset.*${GPIO_LED}="`, { stdio: 'ignore' });
    } catch (e) {}
    console.log('\nGPIO cleaned up');
  } catch (err) {
    console.error('GPIO cleanup error:', err.message);
  }
}

console.log('GPIO Switch & LED Controller started');
console.log(`Switch: GPIO ${GPIO_SWITCH}, LED: GPIO ${GPIO_LED}`);
console.log('Press Ctrl+C to exit');

// スイッチの状態を監視してLEDを制御
const interval = setInterval(() => {
  const switchState = readGPIO(GPIO_SWITCH);
  // スイッチが押されている(HIGH)ならLEDを点灯、そうでなければ消灯
  writeGPIO(GPIO_LED, !switchState);
}, 100); // 100ms間隔でチェック

// Handle program termination
process.on('SIGINT', () => {
  clearInterval(interval);
  writeGPIO(GPIO_LED, 0); // 終了時にLEDを消灯
  cleanupGPIO();
  process.exit();
});