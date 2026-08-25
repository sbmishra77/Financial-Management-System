import {
    auth,
    provider,
    signInWithPopup,
    db
} from "./firebase.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("NEW LOGIN.JS LOADED");

const googleLoginButton = document.querySelector("#googleLoginButton");
const loginStatus = document.querySelector("#loginStatus");


googleLoginButton.addEventListener("click", async () => {

    try {

        loginStatus.textContent = "Signing in...";

        const result = await signInWithPopup(auth, provider);

        console.log("Google popup completed!");

        const user = result.user;

        console.log("Logged in user:", user);
        console.log("Saving user profile to Firestore...");


        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                name: user.displayName || "",
                email: user.email || "",
                photoURL: user.photoURL || "",
                lastLogin: serverTimestamp()
            },
            { merge: true }
        );


        console.log("User profile saved successfully!");

        window.location.href = "index.html";


    } catch (error) {

        console.error("Google Login Error:", error);

        loginStatus.textContent =
            "Google Login नहीं हो पाया। कृपया फिर कोशिश करें।";

    }

});