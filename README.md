# ☁️ JOU CloudSec Platform (CSPM + CWPP)

JOU CloudSec Platform is a **cloud-native security tool** that combines:
- **CSPM (Cloud Security Posture Management)** → scans AWS services for misconfigurations  
- **CWPP (Cloud Workload Protection Platform)** → scans workloads & container environments  
- **Policy Evaluation** using Steampipe, with existence of OPA config too
- **Full-stack Web App**:  
  - Backend: **FastAPI** (Python), deployed on Render  
  - Frontend: **Next.js + Tailwind + Supabase Auth**, deployed on Vercel  

---

## 📂 Project Structure
```
root/
├── cloudsec_backend/ # FastAPI backend (CSPM, CWPP, Steampipe integration)
├── cloudsec-frontend/ # Next.js + Tailwind + Supabase Auth frontend
├── README.md # General repo README (this file)

```
---

## 🚀 Features

- 🔑 **Supabase Authentication** (Sign up / Login with JWT-based sessions)  
- 📊 **Dashboard** with charts, scan trends & summary cards  
- 🔍 **CSPM Scans** → AWS (EC2, S3, IAM) misconfigurations  
- 🛡 **CWPP Scans** → Workload/container security checks  
- 📜 **Policy Violations** via Steampipe queries  
- 📜 **Scan History** with CSV and JSON download  
- 🌑 **Dark Mode UI**  

---

## ⚡ Getting Started

### 1. Clone the Repo
```
git clone https://github.com/JOULifestyle/JOU-Cloudsec-Platform.git
cd cloudsec-platform
```
### 2. Backend Setup (FastAPI)
See cloudsec_backend/README.md for details.
Quick start:

cd cloudsec_backend
pip install -r requirements.txt
uvicorn backend.main:app --reload
Runs on → http://localhost:8000

### 3. Frontend Setup (Next.js)
See cloudsec-frontend/README.md for details.
Quick start:

cd frontend
npm install
npm run dev
Runs on → http://localhost:3000

🌍 Deployment
Backend → Render (https://jou-cloudsec-platform.onrender.com)

Frontend → Vercel (https://jou-cloudsec-platform.vercel.app/)

Supabase → Authentication & PostgreSQL Database

🧑‍💻 Tech Stack
Frontend: Next.js 14, TailwindCSS, Recharts, Supabase Auth

Backend: FastAPI, Boto3 (AWS), Steampipe, PostgreSQL, Docker

Infra: Vercel (frontend), Render (backend), Supabase (DB + Auth)

📸 Screenshot
<img
            src="Cloudsec mockup.png"
            alt="JOU Cloudsec Mockup"
          />


📜 License
MIT License © 2025 Israel Olasehinde (JOULifestyle)


---
