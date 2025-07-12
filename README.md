# final-frontend


📌 HealthChain — Fingerprint-Based Medical Records Access
🚑 Problem
Millions of patients arrive at hospitals without proper medical history —

They might be unconscious, or unable to tell doctors about past conditions, allergies, or medications.

Paper records get lost or scattered.

Doctors waste time repeating tests or guessing past treatment details — this can cause misdiagnosis, delays, and even deaths.

✅ Our Solution
HealthChain makes medical history instantly accessible using a simple fingerprint scan.

Patients enroll their fingerprint once — securely linking it to their medical files.

Doctors scan a patient’s fingerprint when they visit.

The system instantly finds the patient’s record and shows verified medical details, so doctors can treat safely, faster, and with full context.

🎯 Key Highlights
No need to carry files — your fingerprint is your key.

Works for emergencies, routine check-ups, or any hospital visit.

Uses modern decentralized storage for security and privacy.

Aims to solve a real, life-critical problem with a simple, practical tool.

🌟 Vision
A future where no patient suffers due to missing medical history —
HealthChain puts the power of secure health records in your fingertip.


# HealthChain – Fingerprint-Based Medical Records Platform

## Overview

HealthChain is a decentralized medical records platform that allows doctors to instantly access a patient’s medical history using their fingerprint. Patients register with their details, upload medical records, and scan their fingerprint. Doctors can then scan a patient’s fingerprint to retrieve all linked medical data.

---

## Table of Contents

- [Features](#features)
- [System Requirements](#system-requirements)
- [Setup Instructions](#setup-instructions)
  - [1. Morpho Device SDK & Driver Installation](#1-morpho-device-sdk--driver-installation)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Python Backend Setup](#3-python-backend-setup)
  - [4. MongoDB Atlas Setup](#4-mongodb-atlas-setup)
  - [5. Next.js Frontend Setup](#5-nextjs-frontend-setup)
  - [6. Running the Full Stack](#6-running-the-full-stack)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- Patient registration with fingerprint scan and medical file upload
- Doctor dashboard with fingerprint-based patient lookup
- Secure cloud storage of medical data (MongoDB Atlas)
- Modern Next.js frontend and Python Flask backend
- Morpho fingerprint device integration

---

## System Requirements

- Windows 10/11 (recommended for Morpho device)
- Morpho fingerprint device (with SDK and drivers)
- Python 3.8+ (tested with 3.13)
- Node.js 18+ and npm
- MongoDB Atlas account (cloud database)
- Internet connection

---

## Setup Instructions

### 1. Morpho Device SDK & Driver Installation

1. **Connect your Morpho fingerprint device to your laptop.**
2. **Install the Morpho SDK and drivers:**
   - Go to `For_Testing/For_Testing/MSO Device Driver/`
   - Run the appropriate installer for your system:
     - For 64-bit:  
       `MorphoSmart USB Driver x64/Device Driver Setup.exe`
     - For 32-bit:  
       `MorphoSmart USB Driver x86/Device Driver Setup.exe`
   - If prompted, run `Reg.bat` to register the driver.
   - (Optional) Install any required Visual C++ redistributables from the `redists/` folder.

3. **Start the Morpho API server** (usually a Windows app or service that exposes `http://localhost:8080/CallMorphoAPI`).

---

### 2. Clone the Repository

```sh
git clone https://github.com/HARSHCRR/final-frontend.git
cd final-frontend
```

---

### 3. Python Backend Setup

1. **Install Python 3.8+** (if not already installed).
2. **Install required Python packages:**
   ```sh
   pip install flask flask-cors pymongo python-dotenv
   ```
3. **Configure MongoDB Atlas connection:**
   - Edit `For_Testing/For_Testing/config.py` and set your `MONGODB_URI` to your Atlas connection string.

4. **Start the backend server:**
   ```sh
   py For_Testing/For_Testing/fingerprint_server.py
   ```

---

### 4. MongoDB Atlas Setup

1. **Create a free MongoDB Atlas account:**  
   https://www.mongodb.com/cloud/atlas
2. **Create a new cluster and database (e.g., `healthchain`).**
3. **Create a database user and get your connection string.**
4. **Update your backend config as described above.**

---

### 5. Next.js Frontend Setup

1. **Install Node.js (LTS) and npm:**  
   https://nodejs.org/
2. **Install frontend dependencies:**
   ```sh
   cd final-frontend
   npm install
   ```
3. **Start the frontend:**
   ```sh
   npm run dev
   ```
4. **Open your browser at:**  
   [http://localhost:3000](http://localhost:3000)

---

### 6. Running the Full Stack

**Every time you restart your laptop:**

1. **Start the Morpho API server** (Windows app/service).
2. **Start the Flask backend:**
   ```sh
   py For_Testing/For_Testing/fingerprint_server.py
   ```
3. **Start the Next.js frontend:**
   ```sh
   cd final-frontend
   npm run dev
   ```
4. **Go to [http://localhost:3000](http://localhost:3000)**

---

## Usage

- **Patient Registration:**  
  Go to `/patient-signup`, fill in details, upload medical files, and scan fingerprint.
- **Doctor Dashboard:**  
  Go to `/doctor-dashboard`, click "Scan New Patient", scan fingerprint, and view patient records.

---

## Troubleshooting

- **Morpho device not detected:**  
  Ensure drivers are installed and the API server is running.
- **MongoDB connection errors:**  
  Check your Atlas URI and internet connection.
- **npm or Python not found:**  
  Ensure both are installed and added to your system PATH.
- **CORS errors:**  
  The backend uses `flask-cors` to allow frontend requests.

---

## License

MIT License

---

**For any issues, open an issue on GitHub or contact the maintainer.**

