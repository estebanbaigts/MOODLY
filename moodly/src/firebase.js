import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXP661uKvi4P8OGzyXE3WMeAH9-y9KE-8",
  authDomain: "moodle-e0ac8.firebaseapp.com",
  projectId: "moodle-e0ac8",
  storageBucket: "moodle-e0ac8.appspot.com",
  messagingSenderId: "540413753891",
  appId: "1:540413753891:web:a8faf38eaf9512047a0f96",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
