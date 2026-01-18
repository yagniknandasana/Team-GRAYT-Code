# MedSkill Navigator 🏥
### Intelligent Career & Skill Intelligence System for Healthcare

## 🚀 Project Overview
**MedSkill Navigator** is a next-generation career intelligence platform designed for healthcare students and professionals. Unlike generic job portals, it serves as a **GPS for your career**—analyzing your current skills, identifying critical gaps, and building a personalized, AI-driven roadmap to help you achieve your target specialization.

Whether you are aiming for **Cardiology, Neurology, or AYUSH Medicine**, MedSkill Navigator provides the data-driven insights you need to bridge the gap between education and industry requirements.

---

## ✨ Key Features

### 🧠 Profile Intelligence
*   **Dynamic Career Targeting**: Choose your specific target role (e.g., *Neurologist*, *Ayurvedic Practitioner*) and watch the system adapt.
*   **Live Editing**: real-time updates to your skills, education, and projects.
*   **Smart Sync**: Changing your goal immediately recalculates your entire assessment.

### 📊 Clinical Competency Dashboard
*   **Readiness Score**: A real-time "Match Score" (0-100%) showing how qualified you are for your dream role.
*   **Radar & visual Charts**: Visualize your strengths in Clinical Skills, Patient Care, and Technology.
*   **Gap Analysis**: Instantly highlights "Missing" and "Weak" skills vs. "Good" ones.

### 🗺️ AI-Powered Roadmap
*   **Timeline View**: A step-by-step learning journey, not just a list of links.
*   **Dual-Track Recommendations**:
    *   **🔴 Gap Filling**: Specific courses to fix missing skills.
    *   **🟢 Mastery Building**: Advanced projects to showcase your strengths.
*   **AI Chatbot Mentor**: An integrated AI assistant to answer career queries instantly.

### 🛡️ Enterprise-Grade Architecture
*   **Secure Authentication**: Protected routes ensuring only logged-in users access sensitive dashboard data.
*   **Real-time Database**: Powered by Firebase Firestore for instant data sync across devices.
*   **Glassmorphism UI**: A modern, premium aesthetic designed for engagement.

---

## 🛠️ Tech Stack

### Frontend Core
*   **Framework**: React 19 (Vite)
*   **Language**: JavaScript (ES6+)
*   **Routing**: React Router DOM v7
*   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`)

### UI & UX
*   **Styling**: Custom CSS Variables + Glassmorphism Design System
*   **Animations**: Framer Motion
*   **Icons**: React Icons (FontAwesome & Lucide)
*   **Charts**: Recharts (Data Visualization)

### Backend & Services
*   **Authentication**: Firebase Auth (Email/Password, Google)
*   **Database**: Cloud Firestore (NoSQL)
*   **AI Engine**: Google Gemini API (via custom integration)

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yagniknandasana/Team-GRAYT-Code.git
    cd Team-GRAYT-Code
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env` file in the root directory and add your Firebase credentials (or update `src/firebase.js` directly for dev):
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    ...
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

---

## 🔒 Security
*   **Route Protection**: Protected pages (`/dashboard`, `/profile`) are guarded by a dedicated `ProtectedRoute` component.
*   **Data Safety**: All user data is isolated via Firestore Security Rules.

---

## 👥 Team GRAYT Code 
Built with ❤️ for the Future of Healthcare Education.
