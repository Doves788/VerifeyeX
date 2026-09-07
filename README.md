# VerifeyeX 🛡️
**Autonomous Voice Threat Intelligence & Active Defense SaaS**

VerifeyeX is an enterprise-grade SaaS platform designed to detect audio deepfakes and verify biometric speaker identities in real-time. Built with a robust 3-tier microservice architecture, it seamlessly streams live microphone audio through a Node.js WebSocket relay into a Python FastAPI engine for instantaneous Machine Learning analysis.

---

## 📸 Platform Gallery

<div align="center">
  <img src="assets/screenshots/home.png" alt="Home Page" width="49%">
  <img src="assets/screenshots/enrollment.png" alt="Voice Biometric Enrollment" width="49%">
</div>
<div align="center">
  <img src="assets/screenshots/pricing.png" alt="SaaS Pricing Plans" width="49%">
  <img src="assets/screenshots/checkout.png" alt="Cashfree Secure Checkout" width="49%">
</div>

---

## ✨ Key Features

- **🎙️ Real-Time Biometric Enrollment**: Extract Mel-Frequency Cepstral Coefficients (MFCCs) from user voice samples to generate highly accurate acoustic identity embeddings.
- **🧠 Live Deepfake Scanning**: Real-time vector matching using Cosine Similarity to compare incoming audio streams against a persistent vector database (`voice_db.json`).
- **🔐 Enterprise Authentication**: Integrated with **Clerk** for drop-in OAuth 2.0 Identity Management and secure session handling.
- **💳 SaaS Billing Engine**: Full integration with the official **Cashfree Payments JS SDK** and server-side order validation for tier-based subscription checkouts.
- **📊 XAI Heatmaps**: Transparent Artificial Intelligence (XAI) that renders visual MFCC audio frequency heatmaps directly in the browser.

---

## 🏗️ Architecture & Tech Stack

VerifeyeX is decentralized into three primary microservices:

1. **Frontend UI (`/verifeyex-frontend`)**
   - **React.js & Vite**: Lightning-fast UI rendering.
   - **Tailwind / Glassmorphism CSS**: Elegant, multi-colored mesh gradients for a premium SaaS feel.
   - **RecordRTC & Web Audio API**: Captures raw browser audio streams.

2. **AI Engine (`/verifeyex-ai`)**
   - **Python & FastAPI**: High-performance, asynchronous REST API.
   - **Librosa & PyTorch**: Deep Audio feature extraction and Neural Network simulation.
   - **NumPy & Cosine Similarity**: Mathematical biometric vector comparisons.

3. **Audio Relay (`/verifeyex-relay`)**
   - **Node.js & Socket.io**: Full-duplex WebSocket server to bridge browser streams to the Python engine without saving files to disk.

---

## 🚀 Installation & Local Setup

To run this platform locally, you will need to start all three microservices.

### 1. Start the React Frontend
```bash
cd verifeyex-frontend
npm install
npm run dev
```

### 2. Start the AI Engine (Python)
```bash
cd verifeyex-ai
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### 3. Start the WebSocket Relay
```bash
cd verifeyex-relay
npm install
node server.js
```

---

## 🔑 Environment Variables
You must configure the `.env` files in both the frontend and backend to enable external integrations:
- **Frontend**: Requires `VITE_CLERK_PUBLISHABLE_KEY` (Clerk Auth).
- **Backend**: Requires `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` (SaaS Billing).

*See `.env.example` in the respective folders for exact formatting.*

---
*Developed as a capstone engineering project for B.Tech Placements.*

