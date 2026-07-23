// Firebase initialization (modular SDK v10.12.2, pinned in package.json
// to avoid breaking changes from auto-updates — same practice used
// across the other apps in this stack).
import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: replace with the real project credentials before deploying.
// Since the partners are non-technical, hardcode these here (same
// pattern as CobrApp / RepartoCarne) so no .env setup is required.
const firebaseConfig = {
  apiKey: "AIzaSyD5IjoOaPXynPANtia7YJ90XlAzLO3Sb8U",
  authDomain: "maderalujan.firebaseapp.com",
  projectId: "maderalujan",
  storageBucket: "maderalujan.firebasestorage.app",
  messagingSenderId: "34200546300",
  appId: "1:34200546300:web:48587e21c05b84c173a079",
 
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Keep partners logged in across days/app restarts.
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.error('Auth persistence error:', err)
);

export { app, auth, db };
