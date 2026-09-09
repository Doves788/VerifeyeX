# VerifeyeX 🛡️

**Enterprise Active Defense against Generative AI Voice Spoofing**

![Deployment Status](https://img.shields.io/badge/Deployed-Vercel%20%7C%20Render-success)
![CS Fundamentals](https://img.shields.io/badge/CS_Fundamentals-O(N)_Math-blue)
![Architecture](https://img.shields.io/badge/Architecture-3--Tier_Microservices-purple)

## 📌 The Problem: A Business Perspective
Generative AI has made executive impersonation and wire fraud trivial. Current market solutions treat audio verification as an afterthought, relying on slow API polling and generic ML models that fail under real-world conditions.

**The Solution:** VerifeyeX is a monetizable, active-defense SaaS platform. It is not just a technical project; it is a full product designed to create measurable business value. By intercepting live microphone streams via WebSockets and extracting microscopic acoustic fingerprints (MFCCs), VerifeyeX authenticates speaker identity in real-time before the human ear can be deceived.

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

## 🏗️ Architecture & CS Fundamentals

I don't believe in hiding behind black-box frameworks. Strong computer science fundamentals were non-negotiable for this project to ensure scalability, security, and accuracy.

1. **The Client (React + Vite + Clerk)**
   - Secures routes dynamically. If a user is unauthenticated, the application intelligently renders a custom fallback UI rather than relying on buggy window redirects, creating a frictionless user experience.
2. **The Real-Time Relay (Node.js + Socket.io)**
   - Acts as a high-speed traffic controller. It receives continuous binary audio blobs from the browser and pipes them to the Python engine, preventing the ML backend from being overwhelmed by direct client connections.
3. **The ML Engine (Python + FastAPI + PyTorch)**
   - **CS Fundamentals in Action:** Instead of blindly trusting 
umpy.dot for vector comparison, I implemented the raw, O(N) Linear Algebra Cosine Similarity mathematical algorithms from scratch. This guarantees I understand the mathematics behind the AI.
   - Extracts deep Mel-Frequency Cepstral Coefficients (MFCCs) using librosa to catch synthetic vocoder artifacts invisible to humans.

---

## 🤖 How I "Drove" AI to Build This

I treated AI as a sounding board and a force multiplier, not a decision-maker. As the owner of the outcome, I maintained strict architectural command:
- **Delegation & Framing:** I broke the 3-tier architecture into discrete components, feeding the AI specific context for the React frontend, the Node WebSocket, and the PyTorch backend independently.
- **Detecting Bluffing:** When the AI confidently suggested using a generic API polling method for audio, I rejected it. I knew the latency would ruin the product. I enforced a WebSocket streaming architecture instead.
- **Domain Expertise:** The AI generated the boilerplate, but I drove the business logic—integrating the Cashfree Payments SDK for SaaS monetization and architecting the Clerk Auth security layers.

You can read the unedited AI pairing transcripts in the /ai-transcripts folder to see exactly how I corrected mistakes, questioned assumptions, and guided the agent to the final outcome.

---

## 💻 Live Deployment
- **Frontend:** [https://verifeye-x.vercel.app](https://verifeye-x.vercel.app)
- **Middleware:** Node.js WebSockets (Render)
- **Backend:** FastAPI PyTorch Engine (Render)

*(Note: Ensure microphone permissions are granted in your browser to utilize the live Active Defense scanner).*
