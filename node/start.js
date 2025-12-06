const { execSync, spawn } = require('child_process');
const fs = require('fs');

const GPIO_PIN = 17;

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
    // gpioset を使用してGPIOピンに値を書き込む
    // Raspberry Pi 5では通常gpiochip4を使用
    execSync(`gpioset gpiochip4 ${GPIO_PIN}=${value ? '1' : '0'}`, { 
      stdio: 'pipe',
      timeout: 1000 
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
    writeGPIO(0); // LEDを消灯
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