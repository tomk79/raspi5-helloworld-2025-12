# mjpeg_server.py
from flask import Flask, Response
from picamera2 import Picamera2
import cv2
import time
import threading

app = Flask(__name__)

# カメラ0とカメラ1を初期化
picam2_0 = Picamera2(0)
picam2_0.configure(picam2_0.create_video_configuration(
    main={"size": (640, 480)}
))
picam2_0.start()

picam2_1 = Picamera2(1)
picam2_1.configure(picam2_1.create_video_configuration(
    main={"size": (640, 480)}
))
picam2_1.start()

time.sleep(1)

def gen_camera0():
    while True:
        frame = picam2_0.capture_array()
        _, jpeg = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               jpeg.tobytes() + b'\r\n')

def gen_camera1():
    while True:
        frame = picam2_1.capture_array()
        _, jpeg = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               jpeg.tobytes() + b'\r\n')

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
