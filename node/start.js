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
    
    // 既存のgpiosetプロセスをクリーンアップ
    try {
      execSync(`pkill -f "gpioset.*${GPIO_PIN}="`, { stdio: 'ignore' });
    } catch (e) {
      // プロセスが見つからない場合は無視
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
    // 既存のプロセスがあれば終了して少し待つ
    if (gpioProcess) {
      try {
        gpioProcess.kill();
        // プロセスが確実に終了するまで待機
        const start = Date.now();
        while (Date.now() - start < 50) {
          // 50ms待機
        }
      } catch (e) {}
      gpioProcess = null;
    }
    
    // さらに既存のgpiosetプロセスをクリーンアップ
    try {
      execSync(`pkill -f "gpioset.*${GPIO_PIN}="`, { stdio: 'ignore' });
      // プロセス終了後、少し待つ
      const start = Date.now();
      while (Date.now() - start < 50) {
        // 50ms待機
      }
    } catch (e) {
      // プロセスが見つからない場合は無視
    }
    
    // gpioset を使用してGPIOピンに値を書き込む
    // Raspberry Pi 5ではgpiochip0 (chip 0)を使用
    // --daemonize でバックグラウンド実行、-c でチップ番号指定
    gpioProcess = spawn('gpioset', [
      '--daemonize',
      '-c', '0',
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
    // すべてのgpiosetプロセスをクリーンアップ
    try {
      execSync(`pkill -f "gpioset.*${GPIO_PIN}="`, { stdio: 'ignore' });
    } catch (e) {}
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