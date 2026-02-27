// Firebase Configuration for Hack-2-Hire
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBBnzSF1sayZVIk8rq69XcE5yE4X0JDD8k",
    authDomain: "hack-2-hire.firebaseapp.com",
    projectId: "hack-2-hire",
    storageBucket: "hack-2-hire.firebasestorage.app",
    messagingSenderId: "700649204025",
    appId: "1:700649204025:web:324edca2bd6c7f2ed4a0e8",
    measurementId: "G-DHWPP0LN09"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
