import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: "AIzaSyAX4TaYyVlsLlzFEwEqBLhMANnCe-M4q88",
  authDomain: "health-tracker-4e0ed.firebaseapp.com",
  databaseURL: "https://health-tracker-4e0ed.firebaseio.com",
  projectId: "health-tracker-4e0ed",
  storageBucket: "health-tracker-4e0ed.appspot.com",
  messagingSenderId: "217793234650",
  appId: "1:217793234650:web:3d89b5c89a6df566a347e3",
  measurementId: "G-KW8GKLEXN5"
};

firebase.initializeApp(config);

export const auth = firebase.auth();

export const db = firebase.firestore();
