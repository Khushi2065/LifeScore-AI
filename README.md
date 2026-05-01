# LifeScore AI 

LifeScore AI is a personal analytics dashboard that tracks your habits and calculates a "Life Score" based on consistency and balance.

##  Features
- **Dashboard**: High-level metrics for Study, Fitness, and Finances.
- **Life Score Engine**: Custom formula (40% Study, 30% Fitness, 30% Discipline).
- **AI Advisor**: Chatbot providing personalized growth tips using Gemini/Watson.
- **Cloud-Native**: Ready for deployment on AWS S3/EC2 or IBM Cloud.

##  Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion.
- **Backend**: Node.js, Express.
- **Database**: MongoDB Atlas.
- **Auth**: JWT with bcrypt password hashing.

##  Setup Instructions

### 1. Database Setup
Create a cluster on IBM Cloudant and get your connection string.

### 2. Environment Variables
Create a `.env` file in the root based on `.env.example`:
```env
MONGODB_URI="your_mongodb_atlas_uri"
JWT_SECRET="secure_random_string"
GEMINI_API_KEY="your_google_ai_studio_key"
```

### 3. Installation
```bash
npm install
npm run dev
```

## 📖 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/data/score` | GET | Get calculated Life Score and trends |
| `/api/data/expenses` | GET/POST | Manage expense records |
| `/api/data/fitness` | GET/POST | Manage fitness logs |
| `/api/data/study` | GET/POST | Manage study history |
| `/api/ai/chat` | POST | Chat with the AI Advisor |

## ☁️ Deployment (AWS / IBM)

### AWS Deployment
1. **Frontend**: Build using `npm run build` and upload `dist/` to **S3**. Enable static website hosting and use **CloudFront** for HTTPS.
2. **Backend**: Deploy the Express server to **AWS App Runner** or **Elastic Beanstalk**.
3. **Database**: Use MongoDB Atlas (managed AWS integration).

### IBM Cloud Deployment
1. Use **IBM Cloud Code Engine** to deploy the full-stack container.
2. Connect to **IBM Cloud Object Storage** if file uploads are added.

##  Watson Assistant Integration
To use IBM Watson instead of Gemini:
1. Create a Watson Assistant instance on IBM Cloud.
2. Update `/server/ai.ts` to use `ibm-watson` SDK.
3. Replace the `genAI` call with your Watson `assistant.message` call.
