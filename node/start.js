const { Gpio } = require('onoff');
const led = new Gpio(17, 'out');
let value = 0;

setInterval(() => {
  value = value ^ 1; // 0/1反転
  led.writeSync(value);
}, 500); // 0.5秒間隔

process.on('SIGINT', () => {
  led.writeSync(0);
  led.unexport();
});