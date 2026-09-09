import requests
import io
import wave
import json
import random

buffer = io.BytesIO()
with wave.open(buffer, 'wb') as wav:
    wav.setnchannels(1)
    wav.setsampwidth(2)
    wav.setframerate(16000)
    # 2 seconds of loud noise to bypass VAD
    noise = bytearray(random.getrandbits(8) for _ in range(16000 * 2 * 2))
    wav.writeframes(noise)

buffer.seek(0)
res = requests.post('http://127.0.0.1:8000/predict_dict', files={'audio': ('test.wav', buffer, 'audio/wav')})
print(res.status_code)
print(res.text)
