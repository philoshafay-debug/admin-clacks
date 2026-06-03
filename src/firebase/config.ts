import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJI-Ey33TkF-ZGxi4Y9ooCnhKtiwLO06g",
  authDomain: "clacks-store.firebaseapp.com",
  projectId: "clacks-store",
  storageBucket: "clacks-store.firebasestorage.app",
  messagingSenderId: "818659750046",
  appId: "1:818659750046:web:5df4de2d55ae0e88524b8f"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export function handleFirestoreError(
  error: unknown,
  operationType: string,
  path: string | null
): never {
  console.error("Firestore Error:", error);
  throw error;
}