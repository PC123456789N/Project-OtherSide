// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASfmHzg3Hg5UIfpo9AyTkHVIGSqNbGJpM",
  authDomain: "project-otherside-id.firebaseapp.com",
  projectId: "project-otherside-id",
  storageBucket: "project-otherside-id.firebasestorage.app",
  messagingSenderId: "388111959705",
  appId: "1:388111959705:web:6525f87d1122ebd4dd5a08",
  measurementId: "G-LQE61TKL06"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
auth.useDeviceLanguage();

export {app, auth};