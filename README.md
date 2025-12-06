# Raspberry Pi 5 の練習

このプロジェクトは、Raspberry Pi 5のGPIOピン17番に接続されたLEDを0.5秒間隔で点滅させるシンプルなアプリケーションです。

外部ライブラリを使用せず、Node.jsの標準`fs`モジュールで `/sys/class/gpio` を直接制御しています。

## セットアップ

### 1. Node.jsのインストール

```bash
sudo apt update
sudo apt install -y nodejs npm
```

### 2. 実行

```bash
npm start
```

または

```bash
sudo node node/start.js
```

**注意**: GPIOを制御するには`sudo`権限が必要です。

## ハードウェア接続

- GPIO 17番ピンにLEDのアノード(+)を接続
- 抵抗(330Ω推奨)を経由してGNDに接続

## 動作説明

プログラムを実行すると、LEDが0.5秒ごとにON/OFFを繰り返します。
`Ctrl+C`で停止すると、GPIOがクリーンアップされてLEDが消灯します。
