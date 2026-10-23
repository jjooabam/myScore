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

    // 1. 리다이렉트 복귀 결과 처리
    auth.getRedirectResult()
      .then((result) => {
        if (result && result.user) {
          currentUser = result.user;
          updateAuthUI(result.user);
          loadCloudRounds();
          alert(`🎉 구글 로그인 성공! 환영합니다, ${result.user.displayName || "골퍼"}님.`);
        }
      })
      .catch((error) => {
        if (error.code !== "auth/null-user") {
          console.warn("Redirect result notice:", error);
        }
      });

    // 2. 인증 상태 실시간 감시
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

// Google Login: 모바일 Safari ITP 쿠키 차단 우회를 위해 Popup 우선 방식 사용
function loginWithGoogle() {
  if (!auth) {
    alert("Firebase 서비스 준비 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const btn = document.querySelector("#auth-header-box button");
  if (btn) btn.innerText = "연결중...";

  // signInWithPopup 시도
  auth.signInWithPopup(provider)
    .then((result) => {
      currentUser = result.user;
      updateAuthUI(result.user);
      loadCloudRounds();
      alert(`🎉 구글 로그인 성공! 환영합니다, ${result.user.displayName || "골퍼"}님.`);
    })
    .catch((error) => {
      console.warn("Popup error:", error.code, error.message);
      if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
        // 팝업이 차단된 경우 사용자 동의 하에 리다이렉트 시도
        if (confirm("사파리 팝업이 차단되었습니다. 로그인 페이지로 이동하여 로그인하시겠습니까?")) {
          auth.signInWithRedirect(provider);
        } else {
          updateAuthUI(currentUser);
        }
      } else {
        handleAuthError(error);
      }
    });
}

// 대안: 팝업/리다이렉트 없이 0.1초 만에 클라우드 즉시 연결
function loginQuickGuest() {
  const nick = prompt("클라우드에 저장할 닉네임을 입력해주세요 (예: 김골퍼):", "골퍼");
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
      handleAuthError(err);
    });
}

function handleAuthError(error) {
  console.error("Auth Error:", error);
  let msg = error.message;

  if (error.code === "auth/operation-not-allowed") {
    msg = "Firebase 콘솔에서 [Google 로그인] 또는 [익명 로그인] 스위치가 꺼져 있습니다.\nAuthentication -> 로그인 제공업체 활성화를 확인해주세요.";
  } else if (error.code === "auth/unauthorized-domain") {
    msg = "Firebase 콘솔의 [승인된 도메인]에 jjooabam.github.io 가 등록되지 않았습니다.";
  }

  alert("로그인 안내: " + msg);
  updateAuthUI(currentUser);
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

// 3. UI Update
function updateAuthUI(user) {
  const container = document.getElementById("auth-header-box");
  const cloudBadge = document.getElementById("cloud-sync-status");
  if (!container) return;

  if (user) {
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
    container.innerHTML = `
      <button onclick="loginWithGoogle()" style="font-size:11px; padding:4px 8px; border-radius:10px; background:#2563eb; color:white; border:none; font-weight:700; cursor:pointer;">
        구글 로그인
      </button>
    `;
    if (cloudBadge) {
      cloudBadge.innerHTML = `
        <div style="color:#fbbf24; margin-bottom:4px;">⚠️ 미로그인 상태입니다. 캐시 삭제 시 기록이 지워질 수 있습니다.</div>
        <div style="display:flex; gap:8px;">
          <a href="javascript:void(0)" onclick="loginWithGoogle()" style="color:#38bdf8; font-weight:700; text-decoration:underline;">구글로 로그인</a>
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
