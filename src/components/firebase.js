import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAWKU0nEJ9bcY30EgwC",
  authDomain: "netflix-clone-d5713.firebaseapp.com",
  projectId: "netflix-clone-d5713",
  storageBucket: "netflix-clone-d5713.appspot.com",
  messagingSenderId: "325198244221",
  appId: "1:325198244221:web:725339b0556813f12c0414"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { auth };
export default db;
