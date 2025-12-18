# mjpeg_server.py
from flask import Flask, Response
from picamera2 import Picamera2
import cv2
import time

app = Flask(__name__)

# カメラ1を使用
picam2 = Picamera2(1)
picam2.configure(picam2.create_video_configuration(
    main={"size": (640, 480)}
))
picam2.start()
time.sleep(1)

def gen():
    while True:
        frame = picam2.capture_array()
        _, jpeg = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' +
               jpeg.tobytes() + b'\r\n')

@app.route('/stream')
def stream():
    return Response(gen(),
        mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8082, threaded=True)
