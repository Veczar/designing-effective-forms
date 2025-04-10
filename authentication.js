import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";;
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  const signInButton = document.getElementById("signInButton");
  const signOutButton = document.getElementById("signOutButton");

  if (!signInButton || !signOutButton) {
    console.error("Nie znaleziono przycisków logowania!");
    return;
  }

  const userSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Zalogowano:", result.user);
      alert(`Zalogowano jako: ${result.user.displayName}`);
    } catch (error) {
      console.error("Błąd logowania:", error);
      alert(`Błąd logowania: ${error.message}`);
    }
  };

  const userSignOut = async () => {
    try {
      await signOut(auth);
      console.log("Wylogowano");
      alert("Wylogowano pomyślnie");
    } catch (error) {
      console.error("Błąd wylogowywania:", error);
      alert(`Błąd wylogowywania: ${error.message}`);
    }
  };

  signInButton.addEventListener("click", userSignIn);
  signOutButton.addEventListener("click", userSignOut);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Użytkownik zalogowany:", user);
    } else {
      console.log("Użytkownik wylogowany");
    }
  });
});