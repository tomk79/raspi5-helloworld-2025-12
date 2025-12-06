const gpiod = require('node-gpiod');

// デバッグ: node-gpiodのエクスポート内容を確認
console.log('node-gpiod exports:', Object.keys(gpiod));
console.log('node-gpiod:', gpiod);

// まずはAPIを確認するためのテストコード
// 実際のLED制御は後で実装