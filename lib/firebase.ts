import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getDatabase } from "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyD0GieV3BzHH2ZOTJncAARc7jx298WzB_o",
  authDomain: "painel-loc.firebaseapp.com",
  databaseURL: "https://painel-loc-default-rtdb.firebaseio.com",
  projectId: "painel-loc",
  storageBucket: "painel-loc.firebasestorage.app",
  messagingSenderId: "467865894783",
  appId: "1:467865894783:web:45705218ff7835adec244a",
  measurementId: "G-D47LMLJZVH",
}

// Inicializa o Firebase apenas uma vez
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
const auth = getAuth(app)
const database = getDatabase(app)

export { app, auth, database, database as db }
