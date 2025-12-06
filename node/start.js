const fs = require('fs');
const path = require('path');

const GPIO_PIN = 17;
const GPIO_PATH = '/sys/class/gpio';
const GPIO_EXPORT = path.join(GPIO_PATH, 'export');
const GPIO_UNEXPORT = path.join(GPIO_PATH, 'unexport');
const GPIO_PIN_PATH = path.join(GPIO_PATH, `gpio${GPIO_PIN}`);
const GPIO_DIRECTION = path.join(GPIO_PIN_PATH, 'direction');
const GPIO_VALUE = path.join(GPIO_PIN_PATH, 'value');

// GPIO初期化関数
function initGPIO() {
  try {
    // 既にエクスポートされている場合は先にアンエクスポート
    if (fs.existsSync(GPIO_PIN_PATH)) {
      console.log(`GPIO${GPIO_PIN} is already exported. Unexporting first...`);
      try {
        fs.writeFileSync(GPIO_UNEXPORT, String(GPIO_PIN));
        // アンエクスポート後、少し待つ
        const start = Date.now();
        while (fs.existsSync(GPIO_PIN_PATH) && (Date.now() - start) < 1000) {
          // 待機
        }
      } catch (unexportErr) {
        console.warn('Unexport warning:', unexportErr.message);
      }
    }
    
    // GPIOピンをエクスポート
    fs.writeFileSync(GPIO_EXPORT, String(GPIO_PIN));
    console.log(`GPIO${GPIO_PIN} exported`);
    
    // エクスポート後、ファイルが作成されるまで待つ
    const start = Date.now();
    while (!fs.existsSync(GPIO_DIRECTION) && (Date.now() - start) < 2000) {
      // 待機
    }
    
    if (!fs.existsSync(GPIO_DIRECTION)) {
      throw new Error('GPIO direction file was not created');
    }
    
    // ピンを出力モードに設定
    fs.writeFileSync(GPIO_DIRECTION, 'out');
    console.log(`GPIO${GPIO_PIN} configured as output mode`);
    return true;
  } catch (err) {
    console.error('GPIO initialization error:', err.message);
    return false;
  }
}

// GPIO値を書き込む関数
function writeGPIO(value) {
  try {
    fs.writeFileSync(GPIO_VALUE, value ? '1' : '0');
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
    if (fs.existsSync(GPIO_PIN_PATH)) {
      fs.writeFileSync(GPIO_UNEXPORT, String(GPIO_PIN));
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