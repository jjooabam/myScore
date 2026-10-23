// Firebase Configuration & Services
const firebaseConfig = {
  apiKey: "AIzaSyAxMsb7kn1nfZAQ8316Mmkh-joNW0NtkFs",
  authDomain: "my-golf-score-ea8d1.firebaseapp.com",
  projectId: "my-golf-score-ea8d1",
  storageBucket: "my-golf-score-ea8d1.firebasestorage.app",
  messagingSenderId: "388740843682",
  appId: "1:388740843682:web:efe703304f213fc7016ffb"
};

let firebaseApp = null;
let auth = null;
let db = null;
let currentUser = null;

try {
  if (typeof firebase !== "undefined") {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();

    // 로컬 지속성 설정 (항상 로그인 유지)
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
      console.warn("Persistence setting error:", err);
    });

    // 1. 리다이렉트 로그인 결과 확인
    auth.getRedirectResult()
      .then((result) => {
        if (result && result.user) {
          currentUser = result.user;
          updateAuthUI(result.user);
          loadCloudRounds();
          alert(`🎉 구글 로그인 성공!\n반갑습니다, ${result.user.displayName || result.user.email}님.`);
        }
      })
      .catch((error) => {
        if (error.code && error.code !== "auth/null-user") {
          alert(`⚠️ 로그인 리다이렉트 오류:\n[${error.code}] ${error.message}`);
        }
      });

    // 2. 인증 상태 실시간 감시 (로그인/로그아웃 즉시 반영)
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      updateAuthUI(user);
      if (user) {
        console.log("☁️ Current user:", user.displayName || user.email);
        loadCloudRounds();
      }
    });
  }
} catch (e) {
  console.error("Firebase init error:", e);
}

// Google Login
function loginWithGoogle() {
  if (!auth) {
    alert("Firebase 서비스 준비 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const btn = document.querySelector("#auth-header-box button");
  if (btn) btn.innerText = "연결중...";

  auth.signInWithPopup(provider)
    .then((result) => {
      if (result && result.user) {
        currentUser = result.user;
        updateAuthUI(result.user);
        loadCloudRounds();
        alert(`🎉 구글 로그인 성공!\n환영합니다, ${result.user.displayName || result.user.email}님.`);
      }
    })
    .catch((error) => {
      console.warn("Popup error:", error.code, error.message);
      if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
        if (confirm("사파리 팝업이 차단되었거나 닫혔습니다.\n로그인 전용 페이지로 이동(리다이렉트)하여 로그인하시겠습니까?")) {
          auth.signInWithRedirect(provider);
        } else {
          updateAuthUI(currentUser);
        }
      } else {
        alert(`❌ 구글 로그인 실패:\n[${error.code}]\n${error.message}`);
        updateAuthUI(currentUser);
      }
    });
}

// ⚡ 닉네임 원클릭 클라우드 연결 (팝업/동의창 0.1초 통과)
function loginQuickGuest() {
  const nick = prompt("클라우드에 저장할 닉네임을 입력해주세요 (예: 김골퍼):", currentUser?.displayName || "골퍼");
  if (!nick) return;

  auth.signInAnonymously()
    .then((res) => {
      return res.user.updateProfile({ displayName: nick });
    })
    .then(() => {
      currentUser = auth.currentUser;
      updateAuthUI(currentUser);
      loadCloudRounds();
      alert(`🎉 '${nick}'님으로 클라우드에 연결되었습니다!\n이제 기록이 평생 안전하게 영구 저장됩니다.`);
    })
    .catch((err) => {
      alert(`❌ 간편 연결 실패:\n[${err.code}]\n${err.message}`);
    });
}

function logoutUser() {
  if (confirm("로그아웃 하시겠습니까?")) {
    auth.signOut().then(() => {
      alert("로그아웃 되었습니다.");
      currentUser = null;
      updateAuthUI(null);
    });
  }
}

// 3. UI Header Update
function updateAuthUI(user) {
  const container = document.getElementById("auth-header-box");
  const cloudBadge = document.getElementById("cloud-sync-status");
  if (!container) return;

  if (user && (user.displayName || user.email || user.isAnonymous)) {
    const name = user.displayName || user.email || "골퍼";
    container.innerHTML = `
      <div onclick="logoutUser()" style="display:flex; align-items:center; gap:4px; cursor:pointer; background:#1e293b; padding:4px 8px; border-radius:12px; border:1px solid #10b981;">
        <span style="font-size:11px; color:#34d399; font-weight:700;">☁️ ${name}</span>
      </div>
    `;
    if (cloudBadge) {
      cloudBadge.innerHTML = `☁️ <strong>${name}</strong>님의 구글 클라우드에 영구 자동 동기화 중`;
      cloudBadge.style.color = "#34d399";
    }
  } else {
    // 미로그인 시: 구글 로그인 버튼 + ⚡ 닉네임 연결 버튼 2개 제공
    container.innerHTML = `
      <div style="display:flex; gap:4px;">
        <button onclick="loginWithGoogle()" style="font-size:11px; padding:4px 7px; border-radius:10px; background:#2563eb; color:white; border:none; font-weight:700; cursor:pointer;" title="구글 계정으로 로그인">
          구글 로그인
        </button>
        <button onclick="loginQuickGuest()" style="font-size:11px; padding:4px 7px; border-radius:10px; background:#10b981; color:white; border:none; font-weight:700; cursor:pointer;" title="닉네임만 넣고 1초 연결">
          ⚡ 1초 연결
        </button>
      </div>
    `;
    if (cloudBadge) {
      cloudBadge.innerHTML = `
        <div style="color:#fbbf24; margin-bottom:4px;">⚠️ 미로그인 상태입니다. 캐시 삭제 시 기록이 지워질 수 있습니다.</div>
        <div style="display:flex; gap:8px;">
          <a href="javascript:void(0)" onclick="loginWithGoogle()" style="color:#38bdf8; font-weight:700; text-decoration:underline;">구글 로그인</a>
          <span style="color:#64748b;">|</span>
          <a href="javascript:void(0)" onclick="loginQuickGuest()" style="color:#34d399; font-weight:700; text-decoration:underline;">⚡ 닉네임으로 1초 연결</a>
        </div>
      `;
    }
  }
}

// 4. Cloud Sync
function saveRoundToCloud(round) {
  if (!db || !currentUser) return;

  const roundData = {
    ...round,
    userId: currentUser.uid,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("users").doc(currentUser.uid).collection("rounds").doc(round.id)
    .set(roundData, { merge: true })
    .then(() => {
      console.log("☁️ Successfully saved round to Cloud!");
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

      const localHist = localStorage.getItem("golf_rounds_history");
      let localList = [];
      if (localHist) {
        try { localList = JSON.parse(localHist); } catch (e) {}
      }

      const mergedMap = new Map();
      localList.forEach((r) => mergedMap.set(r.id, r));
      cloudList.forEach((r) => mergedMap.set(r.id, r));

      const mergedList = Array.from(mergedMap.values());
      localStorage.setItem("golf_rounds_history", JSON.stringify(mergedList));

      if (typeof renderHistoryView === "function") {
        renderHistoryView();
      }
    })
    .catch((err) => {
      console.warn("Failed to fetch cloud rounds:", err);
    });
}
