// Golf Score Tracker App v3.0
let allCourses = [];
let activeRound = null;
let currentHoleIdx = 0;
let userCoords = null;

function initApp() {
  allCourses = getCourses();
  initGolfCourseSelect();
  initRoundDateInput();
  loadSavedRound();
  setupEventListeners();
  requestGPSLocation();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

function initRoundDateInput() {
  const dateInput = document.getElementById("round-date-input");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

// 1. GPS
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

    if (!activeRound && minDistance <= 30) {
      const select = document.getElementById("course-select");
      if (select && select.value !== nearest.id) {
        select.value = nearest.id;
        onCourseChange();
      }
    }
  }
}

// 2. Setup & Search
function initGolfCourseSelect(filterQuery = "") {
  const select = document.getElementById("course-select");
  select.innerHTML = '<option value="">-- 골프장 선택 (총 ' + allCourses.length + '개) --</option>';

  const query = filterQuery.trim().toLowerCase();
  const filtered = query
    ? allCourses.filter((c) => c.name.toLowerCase().includes(query) || (c.region && c.region.toLowerCase().includes(query)))
    : allCourses;

  filtered.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.innerText = `${c.name} [${c.region || "기본"}]`;
    select.appendChild(opt);
  });

  if (filtered.length === 1) {
    select.selectedIndex = 1;
    onCourseChange();
  }
}

function filterCourses() {
  const query = document.getElementById("course-search-input").value;
  initGolfCourseSelect(query);
}

function onCourseChange() {
  const courseId = document.getElementById("course-select").value;
  const course = allCourses.find((c) => c.id === courseId);
  const frontSelect = document.getElementById("front-course-select");
  const backSelect = document.getElementById("back-course-select");

  frontSelect.innerHTML = "";
  backSelect.innerHTML = "";

  if (!course || !course.courses) return;

  course.courses.forEach((sub) => {
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
  const fHoles = getCourseHolesOrDefault(frontCourse);
  const bHoles = getCourseHolesOrDefault(backCourse);

  for (let i = 0; i < 9; i++) {
    const hData = fHoles[i] || { hole: i + 1, par: 4 };
    holes.push(createEmptyHole(i + 1, frontCourse.name, hData.par));
  }

  for (let i = 0; i < 9; i++) {
    const hData = bHoles[i] || { hole: i + 1, par: 4 };
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
  let defaultTee = "fw_center";
  let defaultSecond = "8I";
  let defaultThird = "PW";
  let defaultApp = 0;

  if (par === 3) {
    defaultTee = "green"; // 파3는 그린(온그린)이 기본
    defaultSecond = "-";
    defaultApp = 0;
  } else if (par === 4) {
    defaultTee = "fw_center";
    defaultSecond = "8I";
    defaultApp = 0;
  } else if (par === 5) {
    defaultTee = "fw_center";
    defaultSecond = "우드";
    defaultThird = "PW";
    defaultApp = 0;
  }

  return {
    holeNum,
    courseName,
    par,
    teeResult: defaultTee, // green, fw_center, fw_left, fw_right, rough, hazard, ob
    secondClub: defaultSecond,
    secondResult: "normal", // normal, hazard, ob
    thirdClub: defaultThird,
    thirdResult: "normal",  // normal, hazard, ob
    approachCount: defaultApp,
    puttCount: 2,
    manualScoreAdjust: 0,
    memo: ""
  };
}

// 3. Hole Recording Screen
// Par Selector Toggle & Change
function toggleParSelector() {
  const el = document.getElementById("par-selector-wrap");
  if (el) {
    el.classList.toggle("open");
  }
}

function changeHolePar(newPar) {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];
  if (hole.par === newPar) {
    toggleParSelector();
    return;
  }

  hole.par = newPar;

  // 파 변경에 따른 초기화
  if (newPar === 3) {
    hole.teeResult = "green";
    hole.secondClub = "-";
    hole.approachCount = 0;
  } else if (newPar === 4) {
    hole.teeResult = "fw_center";
    hole.secondClub = "8I";
    hole.approachCount = 0;
  } else if (newPar === 5) {
    hole.teeResult = "fw_center";
    hole.secondClub = "우드";
    hole.thirdClub = "PW";
    hole.approachCount = 0;
  }

  toggleParSelector();
  renderHoleView();
  saveCurrentRound();
}

function renderHoleView() {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];

  document.getElementById("disp-hole-num").innerText = `${hole.holeNum}번 홀`;
  document.getElementById("disp-hole-par").innerHTML = `PAR ${hole.par} ▾`;
  document.getElementById("disp-course-name").innerText = hole.courseName;

  // 파 선택기 활성화 상태 갱신
  document.querySelectorAll(".btn-par-opt").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.par) === hole.par);
  });

  document.getElementById("btn-prev-hole").disabled = currentHoleIdx === 0;
  document.getElementById("btn-next-hole").innerText = currentHoleIdx === 17 ? "스코어카드 확인" : "다음 홀 ▶";

  // 1. 티샷 버튼 렌더링 (파3 vs 파4/파5 분기)
  renderTeeShotButtons(hole);

  // 2. 클럽 & 결과 선택 렌더링 (파3는 생략, 파4 세컨, 파5 세컨+서드)
  renderClubAndResultSections(hole);

  // 3. 어프로치 & 퍼팅
  document.getElementById("val-approach").innerText = hole.approachCount || 0;
  document.getElementById("val-putt").innerText = hole.puttCount || 0;

  // 4. 메모
  document.getElementById("input-hole-memo").value = hole.memo || "";

  updateCalculatedScore();
}

function renderTeeShotButtons(hole) {
  const container = document.getElementById("tee-shot-container");
  container.innerHTML = "";

  if (hole.par === 3) {
    // 파3: 그린, 러프, 해저드, OB
    const grid = document.createElement("div");
    grid.className = "shot-type-grid par3-grid";

    const par3Choices = [
      { type: "green", label: "🟢 그린 (온그린)", cls: "green-choice" },
      { type: "rough", label: "러프", cls: "" },
      { type: "hazard", label: "해저드 (+1)", cls: "penalty-hz" },
      { type: "ob", label: "OB (+2)", cls: "penalty-ob" }
    ];

    par3Choices.forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn-shot-choice ${ch.cls} ${hole.teeResult === ch.type ? "selected" : ""}`;
      btn.innerText = ch.label;
      btn.onclick = () => {
        hole.teeResult = ch.type;
        // 그린이면 어프로치 0, 미스샷이면 어프로치 1회 자동 기본값
        if (ch.type === "green") {
          hole.approachCount = 0;
        } else if (hole.approachCount === 0) {
          hole.approachCount = 1;
        }
        document.getElementById("val-approach").innerText = hole.approachCount;
        renderTeeShotButtons(hole);
        updateCalculatedScore();
        saveCurrentRound();
      };
      grid.appendChild(btn);
    });
    container.appendChild(grid);

  } else {
    // 파4, 파5: FW좌, FW중, FW우 / 러프, 해저드, OB
    const grid1 = document.createElement("div");
    grid1.className = "shot-type-grid";
    [
      { type: "fw_left", label: "FW (좌)" },
      { type: "fw_center", label: "FW (중앙)" },
      { type: "fw_right", label: "FW (우)" }
    ].forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn-shot-choice ${hole.teeResult === ch.type ? "selected" : ""}`;
      btn.innerText = ch.label;
      btn.onclick = () => selectTeeResult(hole, ch.type);
      grid1.appendChild(btn);
    });

    const grid2 = document.createElement("div");
    grid2.className = "shot-type-grid";
    [
      { type: "rough", label: "러프", cls: "" },
      { type: "hazard", label: "해저드 (+1)", cls: "penalty-hz" },
      { type: "ob", label: "OB (+2)", cls: "penalty-ob" }
    ].forEach((ch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn-shot-choice ${ch.cls} ${hole.teeResult === ch.type ? "selected" : ""}`;
      btn.innerText = ch.label;
      btn.onclick = () => selectTeeResult(hole, ch.type);
      grid2.appendChild(btn);
    });

    container.appendChild(grid1);
    container.appendChild(grid2);
  }
}

function selectTeeResult(hole, type) {
  hole.teeResult = type;
  renderTeeShotButtons(hole);
  updateCalculatedScore();
  saveCurrentRound();
}

function renderClubAndResultSections(hole) {
  const secondSec = document.getElementById("sec-second-club");
  const thirdSec = document.getElementById("sec-third-club");
  const secondTitle = document.getElementById("title-second-club");
  const secondGrid = document.getElementById("grid-second-club");
  const thirdGrid = document.getElementById("grid-third-club");

  secondGrid.innerHTML = "";
  thirdGrid.innerHTML = "";

  if (hole.par === 3) {
    // 파3: 클럽 선택 완전 생략!
    secondSec.style.display = "none";
    thirdSec.style.display = "none";
    return;
  }

  if (hole.par === 4) {
    secondSec.style.display = "block";
    thirdSec.style.display = "none";
    secondTitle.innerText = "🏌️ 2. 세컨샷 클럽";

    // 파4 클럽 순서 (8, 9, P, 48, 52, 56, 7, 6, 5, 유틸, 우드)
    PAR4_SECOND_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.secondClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.secondClub = club;
        renderClubAndResultSections(hole);
        saveCurrentRound();
      };
      secondGrid.appendChild(btn);
    });

    // 세컨 결과 토글 (정상 / 해저드 / OB)
    updateResultToggleBar("second", hole.secondResult || "normal");

  } else if (hole.par === 5) {
    secondSec.style.display = "block";
    thirdSec.style.display = "block";
    secondTitle.innerText = "🏌️ 2. 세컨샷 클럽 (Par 5)";

    // 파5 세컨 클럽 (우드, 유틸, 5, 6, 7, 8, 9, 웨지)
    PAR5_SECOND_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.secondClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.secondClub = club;
        renderClubAndResultSections(hole);
        saveCurrentRound();
      };
      secondGrid.appendChild(btn);
    });
    updateResultToggleBar("second", hole.secondResult || "normal");

    // 파5 서드 클럽 (8, 9, P, 48, 52, 56, 7, 6, 5, 유틸, 우드, 온그린)
    PAR5_THIRD_CLUBS.forEach((club) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `club-btn ${hole.thirdClub === club ? "selected" : ""}`;
      btn.innerText = club;
      btn.onclick = () => {
        hole.thirdClub = club;
        renderClubAndResultSections(hole);
        updateCalculatedScore();
        saveCurrentRound();
      };
      thirdGrid.appendChild(btn);
    });
    updateResultToggleBar("third", hole.thirdResult || "normal");
  }
}

function updateResultToggleBar(shotType, currentVal) {
  const container = document.getElementById(`toggle-res-${shotType}`);
  if (!container) return;

  container.querySelectorAll(".btn-result-toggle").forEach((btn) => {
    const val = btn.dataset.res;
    btn.className = `btn-result-toggle ${val} ${val === currentVal ? "selected" : ""}`;
  });
}

function setShotResult(shotType, val) {
  if (!activeRound) return;
  const hole = activeRound.holes[currentHoleIdx];

  if (shotType === "second") {
    hole.secondResult = val;
  } else if (shotType === "third") {
    hole.thirdResult = val;
  }

  updateResultToggleBar(shotType, val);
  updateCalculatedScore();
  saveCurrentRound();
}

// 스코어 계산 공식 (티샷, 세컨, 서드 벌타 완벽 반영)
function calculateHoleScore(hole) {
  let strokes = 1; // 티샷 1타

  // 티샷 벌타
  if (hole.teeResult === "ob") strokes += 2;
  else if (hole.teeResult === "hazard") strokes += 1;

  if (hole.par === 4) {
    strokes += 1; // 세컨 1타
    if (hole.secondResult === "ob") strokes += 2;
    else if (hole.secondResult === "hazard") strokes += 1;
  } else if (hole.par === 5) {
    strokes += 1; // 세컨 1타
    if (hole.secondResult === "ob") strokes += 2;
    else if (hole.secondResult === "hazard") strokes += 1;

    if (hole.thirdClub && hole.thirdClub !== "온그린(생략)") {
      strokes += 1; // 서드샷 1타
      if (hole.thirdResult === "ob") strokes += 2;
      else if (hole.thirdResult === "hazard") strokes += 1;
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
  let isGIR = false;
  if (hole.par === 3) {
    isGIR = (hole.teeResult === "green" && (hole.approachCount || 0) === 0);
  } else if (hole.par === 4) {
    const hasPenalty = (hole.teeResult === "ob" || hole.teeResult === "hazard" || hole.secondResult === "ob" || hole.secondResult === "hazard");
    isGIR = !hasPenalty && (hole.approachCount || 0) === 0 && (hole.puttCount >= 1);
  } else if (hole.par === 5) {
    const hasPenalty = (hole.teeResult === "ob" || hole.teeResult === "hazard" || hole.secondResult === "ob" || hole.secondResult === "hazard" || hole.thirdResult === "ob" || hole.thirdResult === "hazard");
    isGIR = !hasPenalty && (hole.approachCount || 0) === 0 && (hole.puttCount >= 1);
  }

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

// 5. Scorecard
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
    tr.onclick = () => jumpToHole(idx);

    let teeLabel = "FW";
    if (h.par === 3) {
      if (h.teeResult === "green") teeLabel = "그린";
      else if (h.teeResult === "rough") teeLabel = "러프";
      else if (h.teeResult === "hazard") teeLabel = "해저드";
      else if (h.teeResult === "ob") teeLabel = "OB";
    } else {
      if (h.teeResult === "rough") teeLabel = "러프";
      else if (h.teeResult === "hazard") teeLabel = "해저드";
      else if (h.teeResult === "ob") teeLabel = "OB";
      else if (h.teeResult === "fw_left") teeLabel = "FW(좌)";
      else if (h.teeResult === "fw_right") teeLabel = "FW(우)";
    }

    let clubSummary = h.secondClub || "-";
    if (h.par === 3) {
      clubSummary = "-";
    } else if (h.par === 5 && h.thirdClub && h.thirdClub !== "온그린(생략)") {
      clubSummary += `/${h.thirdClub}`;
    }

    // 벌타 표시
    let penaltyTag = "";
    if (h.secondResult === "ob" || h.thirdResult === "ob") penaltyTag = " (OB)";
    else if (h.secondResult === "hazard" || h.thirdResult === "hazard") penaltyTag = " (HZ)";

    tr.innerHTML = `
      <td><strong>${h.holeNum}</strong></td>
      <td>${h.par}</td>
      <td style="color:${getScoreColor(score - h.par)}; font-weight:800; font-size:14px;">${score}</td>
      <td>${teeLabel}</td>
      <td>${clubSummary}${penaltyTag}</td>
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

    // GIR
    if (h.par === 3 && h.teeResult === "green" && (h.approachCount || 0) === 0) {
      girHits++;
    } else if (h.par > 3) {
      const shotsToGreen = sc - h.puttCount;
      if (shotsToGreen <= (h.par - 2) && h.puttCount >= 1) {
        girHits++;
      }
    }

    // 벌타 카운트 (티샷, 세컨, 서드)
    if (h.teeResult === "ob") obCount++;
    if (h.teeResult === "hazard") hzCount++;
    if (h.secondResult === "ob") obCount++;
    if (h.secondResult === "hazard") hzCount++;
    if (h.thirdResult === "ob") obCount++;
    if (h.thirdResult === "hazard") hzCount++;

    if (h.par > 3 && h.secondClub && h.secondClub !== "-") {
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

// 7. History
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

  list.forEach((rd) => {
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
  const existingIdx = list.findIndex((r) => r.id === round.id);
  if (existingIdx >= 0) {
    list[existingIdx] = round;
  } else {
    list.unshift(round);
  }
  localStorage.setItem("golf_rounds_history", JSON.stringify(list));

  // Firebase 클라우드 영구 저장
  if (typeof saveRoundToCloud === "function") {
    saveRoundToCloud(round);
  }
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

// 9. Navigation & Local Storage
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
