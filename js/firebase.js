import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyARCZ-ef9F9kqeGTvQrDTIIRFrGIkdbq00",
    authDomain: "sbm-wealth-manager.firebaseapp.com",
    projectId: "sbm-wealth-manager",
    storageBucket: "sbm-wealth-manager.firebasestorage.app",
    messagingSenderId: "224277568833",
    appId: "1:224277568833:web:f1b505aaac5091542bd5c0"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

const db = getFirestore(app);


export {
    app,
    auth,
    provider,
    signInWithPopup,
    db
};