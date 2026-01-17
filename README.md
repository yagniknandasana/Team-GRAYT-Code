HAPSIS – Holistic Academic and Professional Skill Intelligence System 🏥

Project Overview:
HAPSIS is an intelligent web application designed to support students and early-career professionals by continuously analyzing their academic progress, skills, and practical experience.
The platform provides actionable insights, identifies skill gaps, and recommends personalized learning paths.
The current implementation focuses on the Healthcare sector, covering Modern Medicine and AYUSH systems.

Key Features:
1. Deep Healthcare Focus – Career paths for Cardiology, Neurology, Pediatrics, AYUSH, and related domains
2. Intelligent Skill Assessment – Compares user skills with industry-aligned frameworks to detect weak and missing areas
3. Dual-Track Recommendations
    Gap-filling courses for weak skills
    Advanced projects for skill mastery
4. Clinical Competency Dashboard – Visualizes progress across Clinical Skills, Anatomy, Pharmacology, and Ethics
5. AI-Driven Insights – Contextual explanations for recommended learning paths
6. Secure Authentication – Firebase-based email/password and Google authentication

Tech Stack:
1. Frontend: React.js (Vite)
2. Language: JavaScript (ES6+)
3. Styling: Vanilla CSS (Glassmorphism Design System), Responsive Layouts
4. Routing: React Router DOM v6
5. Backend / State: Firebase v9 (Authentication, Firestore Database)
6. Data Visualization: Recharts
7. Icons: React Icons (Fa)

Setup Steps & Local Execution:
Prerequisites
Node.js (v14 or higher)
npm (v6 or higher)

Installation
1. Clone the repository
git clone <repository-url>
cd AUHackathon

2. Install dependencies
npm install

3. Run the development server
npm run dev

The application runs at http://localhost:5173.

Environment Variables & Configuration:
HAPSIS uses Firebase for backend services.

Steps:
1. Create a Firebase project
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database
4. Obtain Firebase web configuration
5. Update src/firebase.js
  const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
  };
For production, use environment variables via import.meta.env.

Demo & Testing
1. Users can sign up with any email and password
2. Dashboard includes a “Load Medical Demo” option
3. Demo simulates a Medical Resident profile
4. Includes intentional skill gaps (e.g., ECG Interpretation) and strengths (e.g., Cardiac Anatomy)

Error Handling
1. Blank screen → Check browser console and Firebase configuration
2. Permission errors → Verify Firestore security rules
3. Authentication loop → Clear browser storage and retry

Security Notes
1. No sensitive credentials are committed
2. Firebase configuration contains public client identifiers only
3. Recommended for production:
    a. Firestore Security Rules
    b. Firebase App Check
    c. Environment variable protection
