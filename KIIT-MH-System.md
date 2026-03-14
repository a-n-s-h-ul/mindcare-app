# KIIT Student Mental Health Screening System - Complete Deployment Guide

## 📋 OVERVIEW

**Production-ready, HIPAA-style mental health screening platform for KIIT students**

- ✅ Non-diagnostic, clinician-supervised
- ✅ Culturally adapted for Indian university students
- ✅ Cheating-resistant (32 indirect behavioral questions)
- ✅ Adaptive questioning (dynamic branching)
- ✅ Explainable AI (no black-box decisions)
- ✅ Secure, encrypted, anonymized
- ✅ Dockerized, deployment-ready

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 14)                   │
│  ├─ Consent Screen          ├─ Adaptive Questionnaire       │
│  ├─ Progress Indicator       ├─ Safe Feedback Screen        │
│  ├─ Resource Page            └─ Crisis Escalation           │
└──────────────┬──────────────────────────────────────────────┘
               │ REST API (JWT-secured)
┌──────────────▼──────────────────────────────────────────────┐
│                 BACKEND (Express.js + PostgreSQL)           │
│  ├─ Authentication/Sessions  ├─ Adaptive Logic Engine       │
│  ├─ Question Delivery        ├─ Risk Scoring (Bayesian)     │
│  ├─ Response Storage         ├─ Explainability Generator    │
│  └─ Clinician Escalation     └─ Data Encryption Layer       │
└──────────────┬──────────────────────────────────────────────┘
               │ Database (encrypted)
┌──────────────▼──────────────────────────────────────────────┐
│           PostgreSQL (AES-256 encrypted fields)             │
│  ├─ Responses (encrypted)    ├─ Risk Scores                 │
│  ├─ Explanations             ├─ Clinician Notes             │
│  └─ Anonymous Session IDs    └─ Audit Logs                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 COMPLETE FILE STRUCTURE

```
kiit-mental-health-system/
├── frontend/                    # Next.js 14 app
│   ├── app/
│   │   ├── page.tsx            # Home/Consent screen
│   │   ├── survey/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Adaptive questionnaire
│   │   │   └── results/page.tsx # Feedback screen
│   │   ├── resources/page.tsx   # Crisis resources
│   │   ├── clinician/
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/page.tsx
│   │   ├── api/
│   │   │   ├── survey/route.ts
│   │   │   ├── responses/route.ts
│   │   │   └── clinician/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ConsentForm.tsx
│   │   ├── AdaptiveQuestion.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── FeedbackCard.tsx
│   │   ├── CrisisAlert.tsx
│   │   └── ClinicianDashboard.tsx
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   ├── auth.ts             # JWT handling
│   │   └── constants.ts
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                     # Express.js
│   ├── src/
│   │   ├── server.ts           # Main entry
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verification
│   │   │   ├── validation.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── survey.ts       # Question delivery
│   │   │   ├── responses.ts    # Save responses
│   │   │   ├── clinician.ts    # Clinician endpoints
│   │   │   └── auth.ts
│   │   ├── services/
│   │   │   ├── adaptiveLogic.ts    # Branching logic
│   │   │   ├── riskScoring.ts      # Bayesian scoring
│   │   │   ├── explainability.ts   # Generate explanations
│   │   │   ├── inconsistencyDetector.ts
│   │   │   ├── database.ts         # DB operations
│   │   │   └── encryptionService.ts
│   │   ├── models/
│   │   │   ├── types.ts        # TypeScript interfaces
│   │   │   └── questions.json  # All 32 questions
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   └── utils/
│   │       ├── logger.ts
│   │       └── validators.ts
│   ├── migrations/
│   │   ├── 001_create_tables.sql
│   │   └── 002_add_encryption.sql
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── docs/
│   ├── DEPLOYMENT.md           # Railway, Vercel, AWS setup
│   ├── API.md                  # Full API reference
│   ├── SCORING_LOGIC.md        # Risk calculation details
│   ├── EXPLAINABILITY.md       # How explanations work
│   ├── ETHICS_SAFETY.md        # Safety protocols
│   └── CLINICIAN_GUIDE.md
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── README.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions
└── .gitignore
```

---

## 🚀 QUICK START (LOCAL DEVELOPMENT)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker + Docker Compose (optional)

### 1. Clone & Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Configure .env
DATABASE_URL=postgresql://user:password@localhost:5432/kiit_mental_health
JWT_SECRET=your-secure-random-key-here
ENCRYPTION_KEY=your-32-char-encryption-key
NODE_ENV=development
PORT=3001
```

### 2. Initialize Database

```bash
npm run migrate
npm run seed  # Optional: load sample data
```

### 3. Start Backend

```bash
npm run dev
# Server running at http://localhost:3001
```

### 4. Setup Frontend

```bash
cd ../frontend
npm install
cp .env.example .env.local

# Configure .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CRISIS_HOTLINE=+91-8394804804
```

### 5. Start Frontend

```bash
npm run dev
# App running at http://localhost:3000
```

### 6. Access Application

- **Student Survey**: http://localhost:3000
- **Clinician Dashboard**: http://localhost:3000/clinician
- **API Docs**: http://localhost:3001/api/docs

---

## 🐳 DOCKER DEPLOYMENT

### Full Stack (Backend + Frontend + PostgreSQL)

```bash
docker-compose -f docker/docker-compose.yml up -d
```

This starts:
- Frontend on `:3000`
- Backend on `:3001`
- PostgreSQL on `:5432`

---

## ☁️ PRODUCTION DEPLOYMENT

### Option 1: Railway (Recommended for India)

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Set environment variables in Railway dashboard
```

### Option 2: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel)**:
```bash
cd frontend
vercel deploy
```

**Backend (Railway)**:
```bash
cd backend
railway up
```

### Option 3: AWS (EC2 + RDS)

See `docs/DEPLOYMENT.md` for full AWS setup guide.

---

## 🔐 SECURITY CHECKLIST

- ✅ JWT authentication on all protected routes
- ✅ Encrypted database fields (AES-256 for responses)
- ✅ Anonymous session IDs (no student identifiers stored)
- ✅ HTTPS enforced in production
- ✅ Password hashing (bcrypt)
- ✅ Input validation on all endpoints
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS restricted to known domains
- ✅ SQL injection protection (parameterized queries)
- ✅ No personal identifiers in logs
- ✅ Audit trail for all clinician actions

---

## 📊 SYSTEM FEATURES EXPLAINED

### 1. Adaptive Questioning

The system delivers questions based on risk patterns detected in real-time:

- **Anchor Questions**: Always asked (Q1, Q8, Q10, Q25, Q30, Q32)
- **Domain Activation**: Additional domains activate based on initial answers
- **Early Stopping**: Low-risk students exit after ~15 questions
- **High-Risk Escalation**: Immediate clinician contact for Red-level indicators

### 2. Risk Scoring (Bayesian)

```
DepressionRisk = (Sleep × 0.25) + (Anhedonia × 0.30) + (Rumination × 0.20)
                + (Isolation × 0.15) + (Avoidance × 0.10)

AnxietyRisk = (Sleep × 0.20) + (Rumination × 0.25) + (Perfectionism × 0.30)
            + (Avoidance × 0.15) + (Control × 0.10)

BurnoutRisk = (Perfectionism × 0.35) + (Rumination × 0.25) + (Avoidance × 0.20)
            + (Sleep × 0.10) + (Control × 0.10)

TotalRiskScore = (DepressionRisk × 0.35) + (AnxietyRisk × 0.30)
               + (BurnoutRisk × 0.20) + (Loneliness × 0.15)
```

**Risk Levels**:
- 🟢 **GREEN (0-20)**: Low risk → Annual screening
- 🟡 **YELLOW (21-40)**: Moderate → Counseling offer + 4-6 week rescreen
- 🟠 **ORANGE (41-60)**: High → Mandatory counseling + 2-3 week rescreen
- 🔴 **RED (61-100)**: Very High → Immediate clinician contact

### 3. Explainable AI

For every result, the system generates human-readable explanations:

```json
{
  "riskLevel": "ORANGE",
  "score": 52.3,
  "explanation": {
    "title": "Significant mental health patterns detected",
    "summary": "Your responses suggest you may be experiencing noticeable stress, mood changes, or patterns that benefit from professional support.",
    "factors": [
      {
        "domain": "Sleep",
        "contribution": 0.18,
        "description": "Significant sleep disruption (waking 4-5 AM consistently, taking 3+ hours to compensate on weekends)"
      },
      {
        "domain": "Rumination",
        "contribution": 0.15,
        "description": "Frequent replaying of mistakes and worries, especially in evening before sleep"
      },
      {
        "domain": "Social Withdrawal",
        "contribution": 0.12,
        "description": "Reduced initiation of social contact and feeling like an outsider in groups"
      }
    ],
    "nextSteps": [
      "Schedule a free counseling consultation",
      "Try consistent sleep schedule (within 1 hour each night)",
      "Reach out to one friend this week"
    ],
    "resources": [
      {
        "title": "Campus Counseling (Free)",
        "phone": "+91-8394804804",
        "hours": "Mon-Fri 10 AM - 6 PM"
      },
      {
        "title": "Crisis Support (24/7)",
        "phone": "Aasra: 9820466726",
        "web": "www.aasra.info"
      }
    ]
  }
}
```

### 4. Inconsistency Detection

The system flags contradictory responses that suggest masking or deception:

```typescript
// Example: Student claims low sleep disruption but admits
// 4-5 AM waking + high weekend compensation + afternoon fatigue
inconsistencies = [
  {
    pattern: "SLEEP_DISRUPTION_DENIED",
    confidence: 0.87,
    questions: ["Q1=A", "Q4=A", "Q25=D"],
    interpretation: "Student admits to sleep issues despite initial denial"
  }
];

// Increases risk confidence
adjustedRiskScore += inconsistencies.reduce((sum, inc) => sum + inc.confidence, 0) * 0.15;
```

---

## 📝 KEY API ENDPOINTS

### Student Survey API

```
POST /api/survey/start
  → Returns first question + session_id (anonymous)

POST /api/survey/respond
  Body: { session_id, question_id, answer }
  → Returns next question (adaptive)

POST /api/survey/submit
  Body: { session_id }
  → Returns risk score + explanation + resources

GET /api/resources
  → Crisis hotlines, counseling contacts
```

### Clinician API (Requires authentication)

```
GET /api/clinician/dashboard
  → List of Red/Orange flagged students (anonymized)

GET /api/clinician/case/:caseId
  → Full anonymized responses + risk explanation

POST /api/clinician/note
  Body: { caseId, note }
  → Add manual clinician notes

POST /api/clinician/escalate
  Body: { caseId, escalationType }
  → Mark for emergency response
```

---

## 🧪 TESTING

```bash
# Backend unit tests
cd backend
npm run test

# Integration tests
npm run test:integration

# Frontend component tests
cd ../frontend
npm run test

# E2E tests (Cypress)
npm run test:e2e
```

---

## 📋 PRE-LAUNCH CHECKLIST

- [ ] IRB/Ethics approval obtained
- [ ] All 32 questions configured in database
- [ ] Adaptive branching logic tested with sample data
- [ ] Risk scoring validated against expected outputs
- [ ] Explanations reviewed by clinician
- [ ] Crisis resources verified (phone numbers, hours)
- [ ] Clinician dashboard tested with sample cases
- [ ] Encryption keys securely stored (AWS Secrets Manager / Railway Vault)
- [ ] Database backups configured
- [ ] HIPAA audit logging enabled
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] CORS settings restricted
- [ ] Student communication campaign prepared
- [ ] Clinician training completed (4-6 hours)
- [ ] 24/7 escalation contact established

---

## 🔄 ONGOING MAINTENANCE

**Daily**:
- Monitor Red Flag cases (automated alerts)
- Check error logs
- Verify clinician dashboard accessibility

**Weekly**:
- Review Yellow/Orange trends
- Check data integrity
- Monitor system performance

**Monthly**:
- Analyze false positive rate
- Update resource contact info
- Review clinician feedback
- Generate compliance reports

**Quarterly**:
- Validate scoring accuracy against PHQ-9/GAD-7
- Review and update questions based on feedback
- Security audit
- Database optimization

---

## 📚 DOCUMENTATION

See the `docs/` folder for:

- **DEPLOYMENT.md**: Full cloud setup guides
- **API.md**: Complete endpoint documentation
- **SCORING_LOGIC.md**: Detailed risk calculation
- **EXPLAINABILITY.md**: How explanations are generated
- **ETHICS_SAFETY.md**: Ethical guidelines + safety protocols
- **CLINICIAN_GUIDE.md**: Training for mental health staff

---

## ⚠️ CRITICAL SAFETY NOTES

1. **This is NOT diagnostic**: System identifies patterns, not diagnoses
2. **Clinician-supervised only**: No automated treatment recommendations
3. **Immediate escalation for suicide risk**: Q10=D + Q32=D triggers same-day contact
4. **No parental notification without consent**: Students are adults (18+)
5. **Opt-out anytime**: Students can withdraw responses before submission
6. **Data retention**: Encrypted responses deleted after 12 months (unless clinician holds case open)

---

## 🆘 CRISIS PROTOCOLS

When system detects HIGH SUICIDE RISK:

1. **Immediate flag in clinician dashboard**
2. **Automated same-day email + phone call** from counselor
3. **If no response within 4 hours**: Escalate to campus security/RTO
4. **Display crisis resources on feedback screen**:
   - Aasra: 9820466726 (Mumbai-based, 24/7)
   - iCall: 9152987821 (India, 24/7)
   - Vandrevala Foundation: 1860 2662 345
   - Campus Counseling: [KIIT emergency number]

---

## 📞 SUPPORT

- **Technical Issues**: File issue in GitHub
- **Clinician Questions**: Email mental-health@kiit.ac.in
- **Data Privacy Concerns**: File GDPR/data request with KIIT Data Privacy Officer

---

## 📄 LICENSE & ETHICS

This system is built for KIIT under ethical supervision. Usage outside KIIT requires:
- IRB approval
- Psychiatrist review
- Legal consultation

**NOT to be commercialized or modified without explicit permission.**

---

**Last Updated**: January 3, 2026
**Status**: Ready for Production Deployment
**Next Review**: Post-validation (6 months of operation)

