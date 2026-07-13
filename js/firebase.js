import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDejXSJBxpvtb8Ofaf2vX7qYbVt_2MbZs8",
  authDomain: "dashboard-widgets-71e82.firebaseapp.com",
  projectId: "dashboard-widgets-71e82",
  storageBucket: "dashboard-widgets-71e82.firebasestorage.app",
  messagingSenderId: "824865600236",
  appId: "1:824865600236:web:df87f013ce547ff056abc9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
