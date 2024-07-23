import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAb1KXs7zkICRg09XhR6LHSHJLXMm_6xSA",
  authDomain: "collab-code-editor-3963c.firebaseapp.com",
  projectId: "collab-code-editor-3963c",
  storageBucket: "collab-code-editor-3963c.appspot.com",
  messagingSenderId: "37405683976",
  appId: "1:37405683976:web:c5a58103f7e1eebbaa7cbd",
  measurementId: "G-7NZLX37W29",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
