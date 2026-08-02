import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBl-KHF7DMWMEYU4X7pjgMBkaFct0LZzKw",
  authDomain: "beshoy-veronia.firebaseapp.com",
  projectId: "beshoy-veronia",
  storageBucket: "beshoy-veronia.firebasestorage.app",
  messagingSenderId: "326099949286",
  appId: "1:326099949286:web:4828f6b9dc23d64aea8d27",
  measurementId: "G-MSFYDNMGW7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// عناصر الصفحة
const comments = document.getElementById("comments");
const toggleBtn = document.getElementById("toggleComments");

// متغيرات
let allComments = [];
let expanded = false;

// ==========================
// Send Message
// ==========================

window.sendWish = async function () {

  const name = document.getElementById("guestName").value.trim();
  const message = document.getElementById("guestMessage").value.trim();

  if (!name || !message) {
    alert("Please enter your name and message.");
    return;
  }

  try {

    await addDoc(collection(db, "wishes"), {
      name,
      message,
      createdAt: serverTimestamp()
    });

    document.getElementById("guestName").value = "";
    document.getElementById("guestMessage").value = "";

    alert("Thank you ❤️");

  } catch (error) {

    console.error(error);
    alert("Failed to send message.");

  }

};

// ==========================
// Load Comments
// ==========================

const q = query(
  collection(db, "wishes"),
  orderBy("createdAt", "desc")
);

onSnapshot(q, (snapshot) => {

  allComments = [];

  snapshot.forEach((doc) => {
    allComments.push(doc.data());
  });

  renderComments();

}, (error) => {

  console.error(error);

});

// ==========================
// Render Comments
// ==========================

function renderComments() {

  comments.innerHTML = "";

  const list = expanded
    ? allComments
    : allComments.slice(0, 3);

  list.forEach((data) => {

    comments.innerHTML += `
      <div class="comment-card">
        <h3>${data.name}</h3>
        <p>${data.message}</p>
      </div>
    `;

  });

  if (allComments.length > 3) {

    toggleBtn.style.display = "inline-block";

    toggleBtn.textContent = expanded
      ? "Show Less"
      : "See More";

  } else {

    toggleBtn.style.display = "none";

  }

}

// ==========================
// Toggle Button
// ==========================

toggleBtn.addEventListener("click", () => {

  expanded = !expanded;

  renderComments();

});