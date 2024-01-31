// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8izsiqTnaw9qWUQnxs8Rg8u0aoi4rbrQ",
  authDomain: "album-e1d22.firebaseapp.com",
  projectId: "album-e1d22",
  storageBucket: "album-e1d22.appspot.com",
  messagingSenderId: "641436239903",
  appId: "1:641436239903:web:894960fd3ea2fa30f72d2a",
  measurementId: "G-22L5D0MR6E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);

export default firebaseConfig;