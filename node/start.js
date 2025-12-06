const { execSync, spawn } = require('child_process');
const fs = require('fs');

const GPIO_PIN = 17;
let gpioProcess = null;

// GPIO初期化関数
function initGPIO() {
  try {
    // gpiosetコマンドの存在確認
    try {
      execSync('which gpioset', { stdio: 'pipe' });
    } catch (err) {
      console.error('gpioset command not found. Please install: sudo apt install gpiod');
      return false;
    }
    
    console.log(`GPIO${GPIO_PIN} ready for use with gpioset`);
    return true;
  } catch (err) {
    console.error('GPIO initialization error:', err.message);
    return false;
  }
}

// GPIO値を書き込む関数
function writeGPIO(value) {
  try {
    // 既存のプロセスがあれば終了
    if (gpioProcess) {
      try {
        gpioProcess.kill();
      } catch (e) {}
      gpioProcess = null;
    }
    
    // gpioset を使用してGPIOピンに値を書き込む
    // Raspberry Pi 5ではgpiochip0 (pinctrl-rp1)を使用
    // --mode=signal を使用して、プロセスが生きている間状態を保持
    gpioProcess = spawn('gpioset', [
      '--mode=signal',
      'gpiochip0',
      `${GPIO_PIN}=${value ? '1' : '0'}`
    ], {
      stdio: 'ignore',
      detached: false
    });
    
    return true;
  } catch (err) {
    console.error('GPIO write error:', err.message);
    return false;
  }
}

// GPIOクリーンアップ関数
function cleanupGPIO() {
  try {
    // gpioプロセスを終了
    if (gpioProcess) {
      gpioProcess.kill();
      gpioProcess = null;
    }
    console.log('\nGPIO cleaned up');
  } catch (err) {
    console.error('GPIO cleanup error:', err.message);
  }
}

// メイン処理
if (!initGPIO()) {
  console.error('Failed to initialize GPIO. Are you running with sudo?');
  process.exit(1);
}

let value = 0;

const interval = setInterval(() => {
  value = value ^ 1; // Toggle 0/1
  writeGPIO(value);
  console.log(`LED ${value ? 'ON' : 'OFF'}`);
}, 500); // 0.5 second interval

// Handle program termination
process.on('SIGINT', () => {
  clearInterval(interval);
  cleanupGPIO();
  process.exit();
});