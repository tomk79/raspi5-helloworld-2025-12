# mjpeg_server.py
from flask import Flask, Response
from picamera2 import Picamera2
import cv2
import time
import threading
import numpy as np

app = Flask(__name__)

# カメラ0とカメラ1を初期化
picam2_0 = None
picam2_1 = None

try:
    picam2_0 = Picamera2(0)
    picam2_0.configure(picam2_0.create_video_configuration(
        main={"size": (640, 480)}
    ))
    picam2_0.start()
    print("カメラ0を初期化しました")
except (IndexError, RuntimeError) as e:
    print(f"カメラ0の初期化に失敗しました: {e}")

try:
    picam2_1 = Picamera2(1)
    picam2_1.configure(picam2_1.create_video_configuration(
        main={"size": (640, 480)}
    ))
    picam2_1.start()
    print("カメラ1を初期化しました")
except (IndexError, RuntimeError) as e:
    print(f"カメラ1の初期化に失敗しました: {e}")

time.sleep(1)

def gen_camera0():
    while True:
        if picam2_0 is not None:
            try:
                frame = picam2_0.capture_array()
                _, jpeg = cv2.imencode('.jpg', frame)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' +
                       jpeg.tobytes() + b'\r\n')
            except Exception as e:
                print(f"カメラ0のキャプチャエラー: {e}")
                time.sleep(1)
        else:
            # カメラが利用できない場合は黒画面を返す
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            _, jpeg = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' +
                   jpeg.tobytes() + b'\r\n')
            time.sleep(0.1)

def gen_camera1():
    while True:
        if picam2_1 is not None:
            try:
                frame = picam2_1.capture_array()
                _, jpeg = cv2.imencode('.jpg', frame)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' +
                       jpeg.tobytes() + b'\r\n')
            except Exception as e:
                print(f"カメラ1のキャプチャエラー: {e}")
                time.sleep(1)
        else:
            # カメラが利用できない場合は黒画面を返す
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            _, jpeg = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' +
                   jpeg.tobytes() + b'\r\n')
            time.sleep(0.1)

@app.route('/stream0')
def stream0():
    return Response(gen_camera0(),
        mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stream1')
def stream1():
    return Response(gen_camera1(),
        mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, threaded=True)
