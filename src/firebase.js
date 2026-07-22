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
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME.firebaseapp.com',
  projectId: 'REPLACE_ME',
  storageBucket: 'REPLACE_ME.appspot.com',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Keep partners logged in across days/app restarts.
setPersistence(auth, browserLocalPersistence).catch((err) =>
  console.error('Auth persistence error:', err)
);

export { app, auth, db };
