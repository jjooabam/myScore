// Firebase Configuration & Services
const firebaseConfig = {
  apiKey: "AIzaSyAxMsb7kn1nfZAQ8316Mmkh-joNW0NtkFs",
  authDomain: "my-golf-score-ea8d1.firebaseapp.com",
  projectId: "my-golf-score-ea8d1",
  storageBucket: "my-golf-score-ea8d1.firebasestorage.app",
  messagingSenderId: "388740843682",
  appId: "1:388740843682:web:efe703304f213fc7016ffb"
};

// Initialize Firebase
let firebaseApp = null;
let auth = null;
let db = null;
let currentUser = null;

try {
  if (typeof firebase !== "undefined") {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    
    // 오프라인 캐시 지속성 활성화
    db.enablePersistence().catch((err) => {
      console.warn("Firestore persistence error:", err.code);
    });

    // 인증 상태 감시
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      updateAuthUI(user);
      if (user) {
        console.log("☁️ Logged in as:", user.displayName || user.email);
        loadCloudRounds();
      }
    });
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

// 1. Google Login / Logout
function loginWithGoogle() {
  if (!auth) {
    alert("Firebase 서비스 로딩 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // 모바일 브라우저 최적화 팝업
  auth.signInWithPopup(provider).catch((error) => {
    console.warn("Popup blocked or failed, trying redirect:", error);
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
      auth.signInWithRedirect(provider);
    } else {
      alert("로그인 안내: " + error.message);
    }
  });
}

function logoutUser() {
  if (confirm("로그아웃 하시겠습니까?")) {
    auth.signOut().then(() => {
      alert("로그아웃 되었습니다.");
      updateAuthUI(null);
    });
  }
}

// 2. Auth UI Header Update
function updateAuthUI(user) {
  const container = document.getElementById("auth-header-box");
  const cloudBadge = document.getElementById("cloud-sync-status");
  if (!container) return;

  if (user) {
    const photo = user.photoURL || "";
    const name = user.displayName || "골퍼";
    container.innerHTML = `
      <div onclick="logoutUser()" style="display:flex; align-items:center; gap:5px; cursor:pointer; background:#1e293b; padding:3px 8px; border-radius:14px; border:1px solid #10b981;">
        <span style="font-size:11px; color:#34d399; font-weight:700;">☁️ ${name}</span>
      </div>
    `;
    if (cloudBadge) {
      cloudBadge.innerHTML = `☁️ <strong>${name}</strong>님의 구글 클라우드에 실시간 자동 동기화 중`;
      cloudBadge.style.color = "#34d399";
    }
  } else {
    container.innerHTML = `
      <button onclick="loginWithGoogle()" style="font-size:11px; padding:4px 9px; border-radius:12px; background:#2563eb; color:white; border:none; font-weight:700; cursor:pointer;">
        구글 로그인
      </button>
    `;
    if (cloudBadge) {
      cloudBadge.innerHTML = `⚠️ 로그인하지 않으면 브라우저 캐시 삭제 시 기록이 지워질 수 있습니다. <a href="javascript:void(0)" onclick="loginWithGoogle()" style="color:#38bdf8; text-decoration:underline;">구글 1초 로그인</a>`;
      cloudBadge.style.color = "#fbbf24";
    }
  }
}

// 3. Cloud Firestore Sync Functions
function saveRoundToCloud(round) {
  if (!db || !currentUser) {
    console.log("Not logged in, saved to localStorage only.");
    return;
  }

  const roundData = {
    ...round,
    userId: currentUser.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("users").doc(currentUser.uid).collection("rounds").doc(round.id)
    .set(roundData, { merge: true })
    .then(() => {
      console.log("☁️ Successfully saved round to Cloud Firestore!");
    })
    .catch((err) => {
      console.error("Cloud save failed:", err);
    });
}

function loadCloudRounds() {
  if (!db || !currentUser) return;

  db.collection("users").doc(currentUser.uid).collection("rounds")
    .orderBy("updatedAt", "desc")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) return;

      const cloudList = [];
      snapshot.forEach((doc) => {
        cloudList.push(doc.data());
      });

      // 로컬 스토리지와 스마트 병합 (클라우드 데이터 우선 병합)
      const localHist = localStorage.getItem("golf_rounds_history");
      let localList = [];
      if (localHist) {
        try { localList = JSON.parse(localHist); } catch (e) {}
      }

      // id 기준 중복 제거 병합
      const mergedMap = new Map();
      localList.forEach((r) => mergedMap.set(r.id, r));
      cloudList.forEach((r) => mergedMap.set(r.id, r));

      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem("golf_rounds_history", JSON.stringify(mergedList));

      // 보관함 뷰가 열려있으면 갱신
      if (typeof renderHistoryView === "function") {
        renderHistoryView();
      }
    })
    .catch((err) => {
      console.warn("Failed to fetch cloud rounds:", err);
    });
}
