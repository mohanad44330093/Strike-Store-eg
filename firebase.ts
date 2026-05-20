import { initializeApp } from "firebase/app";

import {
  getFirestore
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5QzxJsQe9x-IqPY5_rVFL_5itPUcI9sQ",
  authDomain: "strik-store.firebaseapp.com",
  databaseURL: "https://strik-store-default-rtdb.firebaseio.com",
  projectId: "strik-store",
  storageBucket: "strik-store.firebasestorage.app",
  messagingSenderId: "524403653148",
  appId: "1:524403653148:web:8756216aad2db867bb3dd9",
  measurementId: "G-Z1ME3G1FKX"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);