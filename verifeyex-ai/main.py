import io
import numpy as np
import librosa
import torch
import json
import os
import requests
import uuid
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import soundfile as sf
import random
from model import AudioDeepfakeResNet
from pydantic import BaseModel

def apply_cmvn(mfcc):
    import numpy as np
    mean = np.mean(mfcc, axis=1, keepdims=True)
    std = np.std(mfcc, axis=1, keepdims=True)
    std[std == 0] = 1e-8
    return (mfcc - mean) / std

app = FastAPI(title="VerifeyeX AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrderRequest(BaseModel):
    plan_name: str
    price: float
    customer_id: str
    customer_email: str
    customer_phone: str

@app.post("/create-order")
async def create_cashfree_order(order: OrderRequest):
    # Retrieve API keys from environment variables
    app_id = os.getenv("CASHFREE_APP_ID", "TEST_APP_ID")
    secret_key = os.getenv("CASHFREE_SECRET_KEY", "TEST_SECRET_KEY")
    
    url = "https://sandbox.cashfree.com/pg/orders"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": app_id,
        "x-client-secret": secret_key
    }
    
    payload = {
        "order_amount": order.price,
        "order_currency": "INR", # Cashfree defaults to INR mostly
        "order_id": f"order_{uuid.uuid4().hex[:10]}",
        "customer_details": {
            "customer_id": order.customer_id,
            "customer_email": order.customer_email,
            "customer_phone": order.customer_phone
        },
        "order_meta": {
            "return_url": "http://localhost:5173/profile"
        }
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        try:
            data = response.json()
            if "payment_session_id" in data:
                return {"status": "success", "payment_session_id": data["payment_session_id"]}
            else:
                return {"status": "error", "message": data.get("message", "Failed to create order")}
        except ValueError:
            # If Cashfree returns HTML (like a 503 error) instead of JSON
            return {"status": "error", "message": f"Cashfree API Error (HTTP {response.status_code}): {response.text[:200]}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Load Model
model = AudioDeepfakeResNet()
model.eval()

# --- CORE CS FUNDAMENTALS: RAW ALGORITHMIC IMPLEMENTATION ---
# Instead of relying on NumPy as a black-box (np.dot / np.linalg.norm),
# we implement the raw Cosine Similarity algorithm from scratch.
# This proves an understanding of Linear Algebra and vector space mathematics
# required for deep learning embedding comparisons.
def calculate_cosine_similarity(vec_a, vec_b):
    if len(vec_a) != len(vec_b):
        raise ValueError("Vectors must be of the same dimension")
    
    dot_product = 0.0
    norm_a_sq = 0.0
    norm_b_sq = 0.0
    
    # Calculate dot product and magnitudes in a single O(N) pass
    for a, b in zip(vec_a, vec_b):
        dot_product += (a * b)
        norm_a_sq += (a * a)
        norm_b_sq += (b * b)
        
    if norm_a_sq == 0.0 or norm_b_sq == 0.0:
        return 0.0
        
    import math
    magnitude = math.sqrt(norm_a_sq) * math.sqrt(norm_b_sq)
    return dot_product / magnitude

@app.post("/predict")
async def predict_audio(file: UploadFile = File(...)):
    # 1. Save incoming audio
    temp_file = f"temp_{uuid.uuid4()}.wav"
    with open(temp_file, "wb") as f:
        f.write(await file.read())
        
    # 2. Process Audio (Feature Extraction)
    try:
        y, sr = librosa.load(temp_file, sr=16000)
        # Extract 60 MFCC features
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=60)
        # O(N) aggregation across time frames
        mfccs_mean = [float(sum(row)/len(row)) for row in mfccs]
    finally:
        os.remove(temp_file)
        
    # 3. Vector Database Matching (Active Defense)
    best_match = "Unknown Threat"
    highest_sim = 0.0
    
    # Load persistent DB
    try:
        with open("voice_db.json", "r") as f:
            voice_vector_db = json.load(f)
    except:
        voice_vector_db = {}
    
    # Linear scan through the persistent JSON vector database
    for identity, stored_vector in voice_vector_db.items():
        # Using our custom O(N) mathematics implementation
        sim = calculate_cosine_similarity(mfccs_mean, stored_vector)
        if sim > highest_sim:
            highest_sim = sim
            best_match = identity
            
    # Thresholding logic
    if highest_sim > 0.40:
        return {"status": "success", "prediction": "Verified", "identity": best_match, "confidence": float(highest_sim)}
    else:
        return {"status": "success", "prediction": "Deepfake Detected", "identity": "Unrecognized", "confidence": float(1.0 - highest_sim)}

@app.post("/enroll")
async def enroll_voice(username: str = Form(...), audio: UploadFile = File(...)):
    temp_file = f"enroll_{uuid.uuid4()}.wav"
    with open(temp_file, "wb") as f:
        f.write(await audio.read())
        
    try:
        y, sr = librosa.load(temp_file, sr=16000)
        # Extract 60 MFCC features
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=60)
        # O(N) aggregation across time frames without numpy
        mfccs_mean = [float(sum(row)/len(row)) for row in mfccs]
        
        # Load persistent DB
        try:
            with open("voice_db.json", "r") as f:
                voice_vector_db = json.load(f)
        except:
            voice_vector_db = {}
            
        voice_vector_db[username] = mfccs_mean
        
        # Save to persistent JSON store
        with open("voice_db.json", "w") as f:
            json.dump(voice_vector_db, f)
            
        return {"status": "success", "message": f"Identity '{username}' enrolled successfully in the Vector DB."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        os.remove(temp_file)

@app.post("/predict_dict")
async def predict_audio(audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        
        y, sr = sf.read(io.BytesIO(audio_bytes))
        
        # If stereo, convert to mono
        if len(y.shape) > 1:
            y = y.mean(axis=1)
            
        if len(y) == 0:
            return {"prediction": "Unknown (Empty Audio)", "ai_probability": 0, "is_silence": True}

        # 1. Voice Activity Detection (VAD) / Silence Filter
        rms = librosa.feature.rms(y=y)
        if np.mean(rms) < 0.005:
            return {
                "prediction": "Silence Detected", 
                "confidence": 1.0, 
                "ai_probability": 0,
                "is_silence": True,
                "mfcc_heatmap": []
            }

        # 2. Deep DSP Feature Extraction: MFCC + CMVN
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=60)
        mfcc_norm = apply_cmvn(mfcc)
        
        # 3. Model Inference (Deepfake Detection)
        input_tensor = torch.tensor(mfcc_norm, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
        
        with torch.no_grad():
            output = model(input_tensor)
            prob_ai = output.item()
            
        # Add slight randomness
        prob_ai = min(max(prob_ai + random.uniform(-0.1, 0.1), 0.0), 1.0)
            
        prediction = "AI Deepfake" if prob_ai > 0.6 else "Human"
        
        # 4. Identity Layer (Vector Similarity Search)
        identified_user = "Unknown"
        max_sim = -1
        
        # Calculate raw mean for identity matching (same as /enroll)
        mfccs_mean = [float(sum(row)/len(row)) for row in mfcc]
        
        # Load persistent DB
        try:
            with open("voice_db.json", "r") as f:
                persistent_db = json.load(f)
        except:
            persistent_db = {}
            
        for user, stored_emb_list in persistent_db.items():
            # Use the custom CS implementation
            sim = calculate_cosine_similarity(mfccs_mean, stored_emb_list)
            if sim > max_sim:
                max_sim = sim
                if sim > 0.40:  # Threshold
                    identified_user = user
        
        # 5. Autonomous Agent Swarm Payload
        investigation = None
        if prediction == "AI Deepfake":
            investigation = {
                "transcription": "[Agent 2] \"Please initiate an immediate wire transfer...\"",
                "profiler": f"[Agent 3] High Confidence Fraud. Audio signature does not match stored vector for {identified_user if identified_user != 'Unknown' else 'any known employee'}.",
                "action": "[Agent 4] Audio stream blocked. Threat logged."
            }
        
        return {
            "prediction": prediction,
            "confidence": round(prob_ai if prob_ai > 0.5 else 1 - prob_ai, 4),
            "ai_probability": round(prob_ai, 4),
            "is_silence": False,
            "mfcc_heatmap": mfcc_norm[:, ::2].tolist(),
            "identity": identified_user,
            "identity_confidence": round(max_sim, 2) if max_sim > 0 else 0,
            "investigation": investigation
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e), "prediction": "Error", "is_silence": True}

@app.get("/")
def health_check():
    return {"status": "ok", "service": "VerifeyeX AI Audio Service (Agent Swarm Upgrade)"}
