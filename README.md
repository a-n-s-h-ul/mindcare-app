# KIIT Student Wellness Space

A safe, confidential, and adaptive mental health screening system for KIIT students.

![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Anonymous-blue)

## 🌟 Key Features

- **Safe Space**: Designed to be non-clinical and non-judgmental.
- **Adaptive Questions**: 32 questions that adapt based on your responses (you might not see them all).
- **Encrypted**: All data is AES-256 encrypted. No names or roll numbers stored.
- **Immediate Support**: Detects high-risk patterns and provides immediate, compassionate path to support.

## 🚀 Quick Start (Production)

This system is Dockerized and ready to deploy.

```bash
# 1. Start all services
docker-compose up -d

# 2. Access the secure frontend
open http://localhost:3000

# 3. Access clinician dashboard (for staff)
open http://localhost:3000/clinician
```

## 🛠️ Development

### Backend (Express)
```bash
cd backend
npm install
npm run dev
```

### Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
```

## 🔒 Security & Privacy

- **No PII**: We strictly do not collect Personally Identifiable Information.
- **Encryption**: Responses are encrypted at rest.
- **Opt-out**: Students can exit at any time without data being saved.

## 🏥 Clinical Protocols

- **Green**: Wellness promotion.
- **Yellow/Orange**: Counseling recommendation.
- **Red**: Immediate escalation logic (Suicide/Self-harm risk) triggers resource display.

---
Built for KIIT University.
