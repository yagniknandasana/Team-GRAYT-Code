import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXlsrUotdzF46gd3wLhPF9JSXQ5rzzXNI",
    authDomain: "auhackathon-5ab8d.firebaseapp.com",
    projectId: "auhackathon-5ab8d",
    storageBucket: "auhackathon-5ab8d.firebasestorage.app",
    messagingSenderId: "616465993280",
    appId: "1:616465993280:web:1ffcbc5be82c71e8d219a5",
    measurementId: "G-2QR6BZ4MZ4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
