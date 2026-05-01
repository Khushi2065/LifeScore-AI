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
# Authentication
# JWT_SECRET: A secret string used to sign security tokens.
JWT_SECRET="generate_a_random_string_here"

# IBM Cloudant Credentials (REQUIRED for data storage)
CLOUDANT_URL="https://apikey-v2-2wrxaodfeohc4si2tu9aengh2p3z7c54kezc166unttl:b5dbbaa9553c44dc65d3a5d60cd4e3bc@cd67a297-0846-421a-920f-4d656ed58c5a-bluemix.cloudantnosqldb.appdomain.cloud"
CLOUDANT_APIKEY="IFHOg7B6gLOPZ3u09tR0dFKDvvLD7rfTyt5ZPxcu1c4f"
# Gemini API Key (Injected by platform)
VITE_GEMINI_API_KEY="AIzaSyBtEA-4BwNXUZUsP-oS8lMGRaqI5jLINCc"

WATSONX_ASSISTANT_APIKEY=936wZ18aJVsMBpdW5H0tOvQx7cOE989OQTADxuTNWKz3
WATSONX_ASSISTANT_URL=https://api.au-syd.assistant.watson.cloud.ibm.com/instances/4afaa225-b0c5-49dd-9c77-26891c6a3fc8
WATSONX_ASSISTANT_ID=2655a0c5-2405-4c4e-853b-a86e5135b22e
WATSONX_ASSISTANT_ENVIRONMENT_ID=cd0eb83e-e66c-4031-88ce-fa86f8285eae
```

### 3. Installation
```bash
npm install
npm run dev
```

##  API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login and receive JWT |
| `/api/data/score` | GET | Get calculated Life Score and trends |
| `/api/data/expenses` | GET/POST | Manage expense records |
| `/api/data/fitness` | GET/POST | Manage fitness logs |
| `/api/data/study` | GET/POST | Manage study history |
| `/api/ai/chat` | POST | Chat with the AI Advisor |

## Deployment (AWS / IBM)

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
