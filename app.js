// App State
let allCourses = [];
let activeRound = null;
let currentHoleIdx = 0; // 0 to 17
let userCoords = null;

console.log("⛳ Golf Score Tracker App v2.0 Loaded!");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  allCourses = getCourses();
  initGolfCourseSelect();
  initRoundDateInput();
  loadSavedRound();
  setupEventListeners();
  requestGPSLocation();
});

function initRoundDateInput() {
  const dateInput = document.getElementById("round-date-input");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

// 1. GPS Location Check
function requestGPSLocation() {
  const badge = document.getElementById("gps-status");
  if (!navigator.geolocation) {
    badge.innerText = "GPS 미지원";
    return;
  }

  badge.innerText = "📡 GPS 수신중...";
  badge.classList.add("active");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      badge.classList.remove("active");
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      findNearestCourse(userCoords.lat, userCoords.lng);
    },
    (err) => {
      badge.classList.remove("active");
      badge.innerText = "GPS 재시도";
      console.warn("GPS error:", err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function findNearestCourse(lat, lng) {
  const badge = document.getElementById("gps-status");
  let nearest = null;
  let minDistance = Infinity;

  allCourses.forEach((c) => {
    if (c.lat && c.lng) {
      const dist = calculateDistance(lat, lng, c.lat, c.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = c;
      }
    }
  });

  if (nearest) {
    const kmStr = minDistance.toFixed(1);
    badge.innerText = `⛳ ${nearest.name} (${kmStr}km)`;

    // 라운드 시작 전이고 반경 30km 이내면 골프장 자동 선택
    if (!activeRound && minDistance <= 30) {
      const select = document.getElementById("course-select");
      if (select && select.value !== nearest.id) {
        select.value = nearest.id;
        onCourseChange();
      }
    }
  }
}

// 2. Course & Round Setup
function initGolfCourseSelect() {
  const select = document.getElementById("course-select");
  select.innerHTML = '<option value="">-- 골프장 선택 --</option>';

  allCourses.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.innerText = `${c.name} (${c.region || "기본"})`;
    select.appendChild(opt);
  });
}

function onCourseChange() {
  const courseId = document.getElementById("course-select").value;
  const course = allCourses.find((c) => c.id === courseId);
  const frontSelect = document.getElementById("front-course-select");
  const backSelect = document.getElementById("back-course-select");

  frontSelect.innerHTML = "";
  backSelect.innerHTML = "";

  if (!course || !course.courses) return;

  course.courses.forEach((sub, idx) => {
    const optF = document.createElement("option");
    optF.value = sub.id;
    optF.innerText = sub.name;
    frontSelect.appendChild(optF);

    const optB = document.createElement("option");
    optB.value = sub.id;
    optB.innerText = sub.name;
    backSelect.appendChild(optB);
  });

  if (course.courses.length > 1) {
    backSelect.selectedIndex = 1;
  }
}

function startRound() {
  const courseId = document.getElementById("course-select").value;
  if (!courseId) {
    alert("골프장을 선택해주세요!");
    return;
  }

  const course = allCourses.find((c) => c.id === courseId);
  const frontId = document.getElementById("front-course-select").value;
  const backId = document.getElementById("back-course-select").value;

  const frontCourse = course.courses.find((c) => c.id === frontId);
  const backCourse = course.courses.find((c) => c.id === backId);

  const dateVal = document.getElementById("round-date-input").value;
  const dateFormatted = dateVal ? new Date(dateVal).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }) : new Date().toLocaleDateString("ko-KR");

  const holes = [];

  // 전반 9홀 (1~9)
  for (let i = 0; i < 9; i++) {
    const hData = frontCourse?.holes?.[i] || { hole: i + 1, par: 4 };
    holes.push(createEmptyHole(i + 1, frontCourse.name, hData.par));
  }

  // 후반 9홀 (10~18)
  for (let i = 0; i < 9; i++) {
    const hData = backCourse?.holes?.[i] || { hole: i + 1, par: 4 };
    holes.push(createEmptyHole(i + 10, backCourse.name, hData.par));
  }

  activeRound = {
    id: "round_" + Date.now(),
    date: dateFormatted,
    rawDate: dateVal,
    courseId: course.id,
    courseName: course.name,
    frontCourseName: frontCourse.name,
    backCourseName: backCourse.name,
    holes: holes
  };

  currentHoleIdx = 0;
  saveCurrentRound();
  showView("play-view");
  renderHoleView();
}

function createEmptyHole(holeNum, courseName, par) {
  let defaultSecond = "7I";
  let defaultThird = "온그린(생략)";

  if (par === 4) {
    defaultSecond = "8I"; // 파4 세컨 기본
  } else if (par === 5) {
    defaultSecond = "우드"; // 파5 세컨 기본
    defaultThird = "PW";    // 파5 서드 기본
  } else if (par === 3) {
    defaultSecond = "아이언";
  }

  return {
    holeNum,
    courseName,
    par,
    teeResult: "fw_center",
    secondClub: defaultSecond,
    thirdClub: defaultThird,
    approachCount: 0,
    puttCount: 2,
    manualScoreAdjust: 0,
    memo: ""
  };
}

// 3. Hole Recording Screen
function renderHoleView() {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];

  document.getElementById("disp-hole-num").innerText = `${hole.holeNum}번 홀`;
  document.getElementById("disp-hole-par").innerText = `PAR ${hole.par}`;
  document.getElementById("disp-course-name").innerText = hole.courseName;

  document.getElementById("btn-prev-hole").disabled = currentHoleIdx === 0;
  document.getElementById("btn-next-hole").innerText = currentHoleIdx === 17 ? "스코어카드 확인" : "다음 홀 ▶";

  // 티샷 버튼 선택 상태 복원
  document.querySelectorAll(".btn-shot-choice").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.type === hole.teeResult);
  });

  // 클럽 그리드 렌더링 (파4, 파5, 파3 맞춤)
  renderDynamicClubGrids(hole);

  // 카운터 복원
  document.getElementById("val-approach").innerText = hole.approachCount || 0;
  document.getElementById("val-putt").innerText = hole.puttCount || 0;

  // 메모
  document.getElementById("input-hole-memo").value = hole.memo || "";

  updateCalculatedScore();
}

// 사용자 요청에 맞춘 클럽 그리드 렌더링
function renderDynamicClubGrids(hole) {
  const secondSec = document.getElementById("sec-second-club");
  const thirdSec = document.getElementById("sec-third-club");
  const secondTitle = document.getElementById("title-second-club");
  const secondGrid = document.getElementById("grid-second-club");
  const thirdGrid = document.getElementById("grid-third-club");

  secondGrid.innerHTML = "";
  thirdGrid.innerHTML = "";

  if (hole.par === 4) {
    // 파4: 세컨 클럽 순서 (8, 9, P, 48, 52, 56, 7, 6, 5, 유틸, 우드)
    secondSec.style.display = "block";
    thirdSec.style.display = "none";
    secondTitle.innerText = "🏌️ 2. 세컨샷 클럽 (Par 4)";

    PAR4_SECOND_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.secondClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.secondClub = club;
        renderDynamicClubGrids(hole);
        saveCurrentRound();
      };
      secondGrid.appendChild(btn);
    });

  } else if (hole.par === 5) {
    // 파5: 세컨 클럽 (우드, 유틸, 5, 6, 7, 8, 9, 웨지)
    secondSec.style.display = "block";
    thirdSec.style.display = "block";
    secondTitle.innerText = "🏌️ 2. 세컨샷 클럽 (Par 5)";

    PAR5_SECOND_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.secondClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.secondClub = club;
        renderDynamicClubGrids(hole);
        saveCurrentRound();
      };
      secondGrid.appendChild(btn);
    });

    // 파5: 서드 클럽 (파4 세컨과 동일 순서)
    PAR5_THIRD_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.thirdClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.thirdClub = club;
        renderDynamicClubGrids(hole);
        updateCalculatedScore();
        saveCurrentRound();
      };
      thirdGrid.appendChild(btn);
    });

  } else {
    // 파3: 티샷 온그린 또는 어프로치
    secondSec.style.display = "block";
    thirdSec.style.display = "none";
    secondTitle.innerText = "🏌️ 2. 사용/어프로치 클럽 (Par 3)";

    PAR3_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.secondClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.secondClub = club;
        renderDynamicClubGrids(hole);
        saveCurrentRound();
      };
      secondGrid.appendChild(btn);
    });
  }
}

// 스코어 계산 공식
function calculateHoleScore(hole) {
  let strokes = 1; // 티샷 1타

  // 벌타
  if (hole.teeResult === "ob") strokes += 2;
  else if (hole.teeResult === "hazard") strokes += 1;

  if (hole.par === 4) {
    strokes += 1; // 세컨 1타
  } else if (hole.par === 5) {
    strokes += 1; // 세컨 1타
    if (hole.thirdClub && hole.thirdClub !== "온그린(생략)") {
      strokes += 1; // 서드샷 1타
    }
  }

  // 어프로치 & 퍼트
  strokes += (hole.approachCount || 0);
  strokes += (hole.puttCount || 0);

  // 수동 미세조정
  strokes += (hole.manualScoreAdjust || 0);

  return Math.max(1, strokes);
}

function updateCalculatedScore() {
  const hole = activeRound.holes[currentHoleIdx];
  const totalScore = calculateHoleScore(hole);
  const diff = totalScore - hole.par;

  document.getElementById("disp-total-score").innerText = totalScore;
  const badge = document.getElementById("disp-score-name");

  let name = "PAR";
  if (totalScore === 1) name = "홀인원 🎯";
  else if (diff === -3) name = "알바트로스 🦅";
  else if (diff === -2) name = "이글 🦅";
  else if (diff === -1) name = "버디 🐦";
  else if (diff === 0) name = "파 (PAR)";
  else if (diff === 1) name = "보기 (+1)";
  else if (diff === 2) name = "더블 보기 (+2)";
  else if (diff === 3) name = "트리플 보기 (+3)";
  else name = `+${diff} 타`;

  badge.innerText = name;

  // GIR 판정
  const shotsToGreen = totalScore - hole.puttCount;
  const isGIR = shotsToGreen <= (hole.par - 2) && hole.puttCount >= 1;
  const girBadge = document.getElementById("disp-gir-badge");

  if (isGIR) {
    girBadge.innerText = "GIR 성공 (파온)";
    girBadge.className = "gir-badge";
  } else {
    girBadge.innerText = "GIR 실패";
    girBadge.className = "gir-badge no";
  }
}

// 4. Hole Controls Action
function setTeeResult(type) {
  if (!activeRound) return;
  activeRound.holes[currentHoleIdx].teeResult = type;
  document.querySelectorAll(".btn-shot-choice").forEach((b) => {
    b.classList.toggle("selected", b.dataset.type === type);
  });
  updateCalculatedScore();
  saveCurrentRound();
}

function changeApproach(delta) {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];
  hole.approachCount = Math.max(0, (hole.approachCount || 0) + delta);
  document.getElementById("val-approach").innerText = hole.approachCount;
  updateCalculatedScore();
  saveCurrentRound();
}

function changePutt(delta) {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];
  hole.puttCount = Math.max(0, (hole.puttCount || 0) + delta);
  document.getElementById("val-putt").innerText = hole.puttCount;
  updateCalculatedScore();
  saveCurrentRound();
}

function adjustScore(delta) {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];
  hole.manualScoreAdjust = (hole.manualScoreAdjust || 0) + delta;
  updateCalculatedScore();
  saveCurrentRound();
}

function prevHole() {
  if (currentHoleIdx > 0) {
    saveHoleMemo();
    currentHoleIdx--;
    renderHoleView();
  }
}

function nextHole() {
  saveHoleMemo();
  if (currentHoleIdx < 17) {
    currentHoleIdx++;
    renderHoleView();
  } else {
    showView("scorecard-view");
    renderScorecard();
  }
}

function jumpToHole(index) {
  saveHoleMemo();
  currentHoleIdx = index;
  showView("play-view");
  renderHoleView();
}

function saveHoleMemo() {
  if (!activeRound) return;
  const memo = document.getElementById("input-hole-memo").value.trim();
  activeRound.holes[currentHoleIdx].memo = memo;
  saveCurrentRound();
}

// 5. Scorecard & Quick Edit
function renderScorecard() {
  if (!activeRound) return;

  document.getElementById("sc-round-title").innerText = `${activeRound.courseName} | ${activeRound.date}`;

  const frontTbody = document.getElementById("sc-front-tbody");
  const backTbody = document.getElementById("sc-back-tbody");
  frontTbody.innerHTML = "";
  backTbody.innerHTML = "";

  let frontParTot = 0, frontScoreTot = 0, frontPuttTot = 0;
  let backParTot = 0, backScoreTot = 0, backPuttTot = 0;

  activeRound.holes.forEach((h, idx) => {
    const score = calculateHoleScore(h);
    const tr = document.createElement("tr");
    tr.className = "clickable";
    tr.onclick = () => jumpToHole(idx); // 클릭하면 해당 홀 기록창으로 이동해서 바로 수정 가능!

    let teeLabel = "FW";
    if (h.teeResult === "rough") teeLabel = "러프";
    else if (h.teeResult === "hazard") teeLabel = "해저드";
    else if (h.teeResult === "ob") teeLabel = "OB";
    else if (h.teeResult === "fw_left") teeLabel = "FW(좌)";
    else if (h.teeResult === "fw_right") teeLabel = "FW(우)";

    let clubSummary = h.secondClub || "-";
    if (h.par === 5 && h.thirdClub && h.thirdClub !== "온그린(생략)") {
      clubSummary += ` / ${h.thirdClub}`;
    }

    tr.innerHTML = `
      <td><strong>${h.holeNum}</strong></td>
      <td>${h.par}</td>
      <td style="color:${getScoreColor(score - h.par)}; font-weight:800; font-size:14px;">${score}</td>
      <td>${teeLabel}</td>
      <td>${clubSummary}</td>
      <td>${h.puttCount}</td>
    `;

    if (idx < 9) {
      frontTbody.appendChild(tr);
      frontParTot += h.par;
      frontScoreTot += score;
      frontPuttTot += h.puttCount;
    } else {
      backTbody.appendChild(tr);
      backParTot += h.par;
      backScoreTot += score;
      backPuttTot += h.puttCount;
    }
  });

  document.getElementById("sc-front-total-par").innerText = frontParTot;
  document.getElementById("sc-front-total-score").innerText = frontScoreTot;
  document.getElementById("sc-front-total-putt").innerText = frontPuttTot;

  document.getElementById("sc-back-total-par").innerText = backParTot;
  document.getElementById("sc-back-total-score").innerText = backScoreTot;
  document.getElementById("sc-back-total-putt").innerText = backPuttTot;

  const totalAll = frontScoreTot + backScoreTot;
  const diffAll = totalAll - 72;
  const diffStr = diffAll > 0 ? `+${diffAll}` : (diffAll === 0 ? "E" : `${diffAll}`);
  document.getElementById("sc-final-score").innerText = `${totalAll} 타 (${diffStr})`;
}

function getScoreColor(diff) {
  if (diff < 0) return "#38bdf8";
  if (diff === 0) return "#10b981";
  if (diff === 1) return "#fbbf24";
  return "#f87171";
}

// 6. Round Stats
function renderStatsView() {
  if (!activeRound) return;

  let totalScore = 0;
  let totalPar = 0;
  let totalPutts = 0;
  let fwHits = 0;
  let fwTotalPossible = 0;
  let girHits = 0;
  let obCount = 0;
  let hzCount = 0;
  const clubUsage = {};

  activeRound.holes.forEach((h) => {
    const sc = calculateHoleScore(h);
    totalScore += sc;
    totalPar += h.par;
    totalPutts += h.puttCount;

    if (h.par > 3) {
      fwTotalPossible++;
      if (h.teeResult === "fw_center" || h.teeResult === "fw_left" || h.teeResult === "fw_right") {
        fwHits++;
      }
    }

    const shotsToGreen = sc - h.puttCount;
    if (shotsToGreen <= (h.par - 2) && h.puttCount >= 1) {
      girHits++;
    }

    if (h.teeResult === "ob") obCount++;
    if (h.teeResult === "hazard") hzCount++;

    if (h.secondClub && h.secondClub !== "온그린(생략)") {
      clubUsage[h.secondClub] = (clubUsage[h.secondClub] || 0) + 1;
    }
    if (h.par === 5 && h.thirdClub && h.thirdClub !== "온그린(생략)") {
      clubUsage[h.thirdClub] = (clubUsage[h.thirdClub] || 0) + 1;
    }
  });

  const fwPercent = fwTotalPossible > 0 ? Math.round((fwHits / fwTotalPossible) * 100) : 0;
  const girPercent = Math.round((girHits / 18) * 100);
  const avgPutts = (totalPutts / 18).toFixed(1);

  document.getElementById("stat-total-score").innerText = totalScore;
  const diffTot = totalScore - totalPar;
  document.getElementById("stat-diff").innerText = `${diffTot >= 0 ? "+" : ""}${diffTot}`;
  document.getElementById("stat-fw-keep").innerText = `${fwPercent}% (${fwHits}/${fwTotalPossible})`;
  document.getElementById("stat-gir").innerText = `${girPercent}% (${girHits}/18)`;
  document.getElementById("stat-total-putts").innerText = `${totalPutts}개 (평균 ${avgPutts})`;
  document.getElementById("stat-penalty").innerText = `OB ${obCount}회 / 해저드 ${hzCount}회`;

  const clubListEl = document.getElementById("stat-club-list");
  clubListEl.innerHTML = "";
  const sortedClubs = Object.entries(clubUsage).sort((a, b) => b[1] - a[1]);

  sortedClubs.slice(0, 5).forEach(([club, cnt]) => {
    const li = document.createElement("div");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.padding = "8px 0";
    li.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
    li.innerHTML = `<span>🏌️ ${club}</span><strong style="color:var(--accent);">${cnt}회 사용</strong>`;
    clubListEl.appendChild(li);
  });
}

// 7. History (끝나고 스코어 기록 및 지난 라운드 보관함)
function renderHistoryView() {
  const container = document.getElementById("history-list-container");
  container.innerHTML = "";

  const hist = localStorage.getItem("golf_rounds_history");
  let list = [];
  if (hist) {
    try { list = JSON.parse(hist); } catch (e) {}
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: var(--text-muted);">
        <p style="font-size: 32px; margin-bottom: 8px;">📁</p>
        <p style="font-size: 14px;">저장된 지난 라운드 기록이 없습니다.</p>
        <p style="font-size: 12px; margin-top: 4px;">라운드를 마치고 [기록 보관]을 누르면 여기에 저장됩니다.</p>
      </div>
    `;
    return;
  }

  list.forEach((rd, idx) => {
    let totScore = 0;
    rd.holes.forEach((h) => { totScore += calculateHoleScore(h); });

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 15px; color: #f8fafc; margin-bottom: 3px;">⛳ ${rd.courseName}</div>
        <div style="font-size: 12px; color: var(--text-muted);">${rd.date}</div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 20px; font-weight: 800; color: var(--accent);">${totScore} 타</span>
        <div style="font-size: 11px; color: #34d399; margin-top: 2px;">터치하여 열기 ❯</div>
      </div>
    `;

    card.onclick = () => {
      if (confirm(`'${rd.courseName} (${rd.date})' 라운드를 불러와서 스코어카드 및 통계를 확인/수정하시겠습니까?`)) {
        activeRound = rd;
        saveCurrentRound();
        showView("scorecard-view");
        renderScorecard();
      }
    };

    container.appendChild(card);
  });
}

function finishAndArchiveRound() {
  if (!activeRound) return;
  if (confirm("현재 라운드를 종료하고 [기록 보관함]에 저장하시겠습니까?")) {
    archiveActiveRound(activeRound);
    localStorage.removeItem("golf_active_round");
    activeRound = null;
    alert("라운드 기록이 안전하게 보관함에 저장되었습니다!");
    showView("history-view");
    renderHistoryView();
  }
}

function archiveActiveRound(round) {
  const hist = localStorage.getItem("golf_rounds_history");
  let list = [];
  if (hist) {
    try { list = JSON.parse(hist); } catch (e) {}
  }
  // 같은 id가 있으면 교체, 없으면 맨 앞에 추가
  const existingIdx = list.findIndex((r) => r.id === round.id);
  if (existingIdx >= 0) {
    list[existingIdx] = round;
  } else {
    list.unshift(round);
  }
  localStorage.setItem("golf_rounds_history", JSON.stringify(list));
}

// 8. Custom Course Add
function openAddCourseModal() {
  document.getElementById("modal-add-course").classList.add("open");
  if (userCoords) {
    document.getElementById("new-course-lat").value = userCoords.lat.toFixed(4);
    document.getElementById("new-course-lng").value = userCoords.lng.toFixed(4);
  }
}

function closeAddCourseModal() {
  document.getElementById("modal-add-course").classList.remove("open");
}

function saveNewCourseFromModal() {
  const name = document.getElementById("new-course-name").value.trim();
  const region = document.getElementById("new-course-region").value.trim();
  const lat = parseFloat(document.getElementById("new-course-lat").value) || null;
  const lng = parseFloat(document.getElementById("new-course-lng").value) || null;
  const c1Name = document.getElementById("new-course-sub1").value.trim() || "A 코스";
  const c2Name = document.getElementById("new-course-sub2").value.trim() || "B 코스";

  if (!name) {
    alert("골프장 이름을 입력해주세요!");
    return;
  }

  const createSubHoles = () => [
    { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
    { hole: 4, par: 5 }, { hole: 5, par: 4 }, { hole: 6, par: 4 },
    { hole: 7, par: 3 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
  ];

  const newCourseObj = {
    id: "custom_" + Date.now(),
    name,
    region,
    lat,
    lng,
    courses: [
      { id: "sub_1", name: c1Name, holes: createSubHoles() },
      { id: "sub_2", name: c2Name, holes: createSubHoles() }
    ]
  };

  saveCustomCourse(newCourseObj);
  allCourses = getCourses();
  initGolfCourseSelect();
  closeAddCourseModal();
  alert(`${name} 골프장이 성공적으로 추가되었습니다!`);
}

// 9. Navigation & View Switcher
function showView(viewId) {
  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  if (viewId === "scorecard-view") renderScorecard();
  if (viewId === "stats-view") renderStatsView();
  if (viewId === "history-view") renderHistoryView();
}

function saveCurrentRound() {
  if (activeRound) {
    localStorage.setItem("golf_active_round", JSON.stringify(activeRound));
  }
}

function loadSavedRound() {
  const saved = localStorage.getItem("golf_active_round");
  if (saved) {
    try {
      activeRound = JSON.parse(saved);
      showView("play-view");
      renderHoleView();
    } catch (e) {
      console.error(e);
    }
  } else {
    showView("setup-view");
  }
}

function setupEventListeners() {
  document.getElementById("course-select").addEventListener("change", onCourseChange);
  document.getElementById("btn-start-round").addEventListener("click", startRound);

  // Bottom Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if (!activeRound && (v === "play-view" || v === "scorecard-view" || v === "stats-view")) {
        alert("먼저 골프장을 선택하고 라운드를 시작하거나, 기록 보관함에서 불러와주세요!");
        return;
      }
      showView(v);
    });
  });

  document.getElementById("gps-status").addEventListener("click", requestGPSLocation);
}
