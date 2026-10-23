// App State
let allCourses = [];
let activeRound = null;
let currentHoleIdx = 0; // 0 to 17
let userCoords = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  allCourses = getCourses();
  initGolfCourseSelect();
  loadSavedRound();
  setupEventListeners();
  requestGPSLocation();
});

// 1. GPS Location Check
function requestGPSLocation() {
  const badge = document.getElementById("gps-status");
  if (!navigator.geolocation) {
    badge.innerText = "GPS 미지원";
    return;
  }

  badge.innerText = "GPS 수신중...";
  badge.classList.add("active");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      badge.classList.remove("active");
      userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      findNearestCourse(userCoords.lat, userCoords.lng);
    },
    (err) => {
      badge.classList.remove("active");
      badge.innerText = "GPS 끄기";
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

    // 라운드 시작 전이고 반경 25km 이내면 골프장 자동 선택
    if (!activeRound && minDistance <= 30) {
      const select = document.getElementById("course-select");
      if (select) {
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

  // 후반 코스 기본값: 2번째 코스가 있으면 2번째, 없으면 1번째
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

  // 18홀 데이터 초기화
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
    date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }),
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
  return {
    holeNum,
    courseName,
    par,
    teeResult: "fw_center", // fw_center, fw_left, fw_right, rough, hazard, ob
    secondClub: "7번 아이언",
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

  // 이전/다음 홀 버튼 상태
  document.getElementById("btn-prev-hole").disabled = currentHoleIdx === 0;
  document.getElementById("btn-next-hole").innerText = currentHoleIdx === 17 ? "스코어카드 보기" : "다음 홀 ▶";

  // 티샷 버튼 선택 상태 복원
  document.querySelectorAll(".btn-shot-choice").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.type === hole.teeResult);
  });

  // 세컨 클럽 렌더링 & 선택 상태
  renderClubChips(hole.secondClub);

  // 어프로치 및 퍼트 카운터
  document.getElementById("val-approach").innerText = hole.approachCount;
  document.getElementById("val-putt").innerText = hole.puttCount;

  // 메모
  document.getElementById("input-hole-memo").value = hole.memo || "";

  // 스코어 및 GIR 계산
  updateCalculatedScore();
}

function renderClubChips(selectedClub) {
  const container = document.getElementById("club-chips-container");
  container.innerHTML = "";

  DEFAULT_CLUBS.forEach((club) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `club-chip ${club === selectedClub ? "selected" : ""}`;
    chip.innerText = club;
    chip.onclick = () => {
      activeRound.holes[currentHoleIdx].secondClub = club;
      renderClubChips(club);
      saveCurrentRound();
    };
    container.appendChild(chip);
  });
}

// 스코어 계산 공식
function calculateHoleScore(hole) {
  let strokes = 1; // 티샷 1타

  // 벌타 계산
  if (hole.teeResult === "ob") {
    strokes += 2; // OB: 1벌타 후 티박스 재티샷(총 +2타) or 특설티
  } else if (hole.teeResult === "hazard") {
    strokes += 1; // 해저드 1벌타
  }

  // 파4, 파5의 경우 기본 세컨샷 1타 추가 (파3는 티샷 후 바로 그린 또는 어프로치)
  if (hole.par >= 4) {
    strokes += 1;
  }

  // 어프로치 횟수 가산
  strokes += (hole.approachCount || 0);

  // 퍼트 수 가산
  strokes += (hole.puttCount || 0);

  // 사용자 수동 미세 조정
  strokes += (hole.manualScoreAdjust || 0);

  return Math.max(1, strokes);
}

function updateCalculatedScore() {
  const hole = activeRound.holes[currentHoleIdx];
  const totalScore = calculateHoleScore(hole);
  const diff = totalScore - hole.par;

  // UI 표시
  document.getElementById("disp-total-score").innerText = totalScore;
  const badge = document.getElementById("disp-score-name");

  let name = "PAR";
  let colorClass = "par";

  if (totalScore === 1) {
    name = "홀인원 🎯";
  } else if (diff === -3) {
    name = "알바트로스 🦅";
  } else if (diff === -2) {
    name = "이글 🦅";
  } else if (diff === -1) {
    name = "버디 🐦";
  } else if (diff === 0) {
    name = "파 (PAR)";
  } else if (diff === 1) {
    name = "보기 (+1)";
  } else if (diff === 2) {
    name = "더블 보기 (+2)";
  } else if (diff === 3) {
    name = "트리플 보기 (+3)";
  } else {
    name = `+${diff} 타`;
  }

  badge.innerText = name;

  // GIR(Green In Regulation) 판정: (총타수 - 퍼트) <= (Par - 2)
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

function saveHoleMemo() {
  if (!activeRound) return;
  const memo = document.getElementById("input-hole-memo").value.trim();
  activeRound.holes[currentHoleIdx].memo = memo;
  saveCurrentRound();
}

// 5. Scorecard & Stats
function renderScorecard() {
  if (!activeRound) return;

  document.getElementById("sc-round-title").innerText = `${activeRound.courseName} (${activeRound.date})`;

  const frontTbody = document.getElementById("sc-front-tbody");
  const backTbody = document.getElementById("sc-back-tbody");
  frontTbody.innerHTML = "";
  backTbody.innerHTML = "";

  let frontParTot = 0, frontScoreTot = 0, frontPuttTot = 0;
  let backParTot = 0, backScoreTot = 0, backPuttTot = 0;

  activeRound.holes.forEach((h, idx) => {
    const score = calculateHoleScore(h);
    const tr = document.createElement("tr");

    let teeLabel = "FW";
    if (h.teeResult === "rough") teeLabel = "러프";
    else if (h.teeResult === "hazard") teeLabel = "해저드";
    else if (h.teeResult === "ob") teeLabel = "OB";
    else if (h.teeResult === "fw_left") teeLabel = "FW(좌)";
    else if (h.teeResult === "fw_right") teeLabel = "FW(우)";

    tr.innerHTML = `
      <td><strong>${h.holeNum}</strong></td>
      <td>${h.par}</td>
      <td style="color:${getScoreColor(score - h.par)}; font-weight:700;">${score}</td>
      <td>${teeLabel}</td>
      <td>${h.secondClub ? h.secondClub.replace(" 아이언", "I").replace("번 우드", "W").replace("번 유틸", "U") : "-"}</td>
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

  document.getElementById("sc-final-score").innerText = `${frontScoreTot + backScoreTot} 타 (${(frontScoreTot + backScoreTot) - 72 > 0 ? "+" + ((frontScoreTot + backScoreTot) - 72) : (frontScoreTot + backScoreTot) - 72})`;
}

function getScoreColor(diff) {
  if (diff < 0) return "#38bdf8"; // 언더
  if (diff === 0) return "#10b981"; // 파
  if (diff === 1) return "#fbbf24"; // 보기
  return "#f87171"; // 더블 이상
}

function renderStatsView() {
  if (!activeRound) return;

  let totalScore = 0;
  let totalPar = 0;
  let totalPutts = 0;
  let fwHits = 0;
  let fwTotalPossible = 0; // 파3 제외 티샷
  let girHits = 0;
  let obCount = 0;
  let hzCount = 0;
  const clubUsage = {};

  activeRound.holes.forEach((h) => {
    const sc = calculateHoleScore(h);
    totalScore += sc;
    totalPar += h.par;
    totalPutts += h.puttCount;

    // 파3가 아니면 페어웨이 판정
    if (h.par > 3) {
      fwTotalPossible++;
      if (h.teeResult === "fw_center" || h.teeResult === "fw_left" || h.teeResult === "fw_right") {
        fwHits++;
      }
    }

    // GIR(파온) 판정
    const shotsToGreen = sc - h.puttCount;
    if (shotsToGreen <= (h.par - 2) && h.puttCount >= 1) {
      girHits++;
    }

    if (h.teeResult === "ob") obCount++;
    if (h.teeResult === "hazard") hzCount++;

    if (h.secondClub) {
      clubUsage[h.secondClub] = (clubUsage[h.secondClub] || 0) + 1;
    }
  });

  const fwPercent = fwTotalPossible > 0 ? Math.round((fwHits / fwTotalPossible) * 100) : 0;
  const girPercent = Math.round((girHits / 18) * 100);
  const avgPutts = (totalPutts / 18).toFixed(1);

  document.getElementById("stat-total-score").innerText = totalScore;
  document.getElementById("stat-diff").innerText = `${totalScore - totalPar >= 0 ? "+" : ""}${totalScore - totalPar}`;
  document.getElementById("stat-fw-keep").innerText = `${fwPercent}% (${fwHits}/${fwTotalPossible})`;
  document.getElementById("stat-gir").innerText = `${girPercent}% (${girHits}/18)`;
  document.getElementById("stat-total-putts").innerText = `${totalPutts}개 (평균 ${avgPutts})`;
  document.getElementById("stat-penalty").innerText = `OB ${obCount}회 / 해저드 ${hzCount}회`;

  // 최다 사용 세컨 클럽 정렬
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

// 6. Custom Course Add
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

  // 기본 표준 9홀 파36 생성 함수
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

// 7. Navigation & Local Storage
function showView(viewId) {
  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.remove("active"));
  const target = document.getElementById(viewId);
  if (target) target.classList.add("active");

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });

  if (viewId === "scorecard-view") renderScorecard();
  if (viewId === "stats-view") renderStatsView();
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

function resetRound() {
  if (confirm("현재 라운드를 종료하고 새 라운드를 시작하시겠습니까?\n(기록은 히스토리에 보관됩니다)")) {
    if (activeRound) {
      archiveActiveRound(activeRound);
    }
    localStorage.removeItem("golf_active_round");
    activeRound = null;
    showView("setup-view");
  }
}

function archiveActiveRound(round) {
  const hist = localStorage.getItem("golf_rounds_history");
  let list = [];
  if (hist) {
    try { list = JSON.parse(hist); } catch (e) {}
  }
  list.unshift(round);
  localStorage.setItem("golf_rounds_history", JSON.stringify(list));
}

function setupEventListeners() {
  document.getElementById("course-select").addEventListener("change", onCourseChange);
  document.getElementById("btn-start-round").addEventListener("click", startRound);

  // Bottom Tabs
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if (!activeRound && (v === "play-view" || v === "scorecard-view" || v === "stats-view")) {
        alert("먼저 골프장을 선택하고 라운드를 시작해주세요!");
        return;
      }
      showView(v);
    });
  });

  // GPS Click to refresh
  document.getElementById("gps-status").addEventListener("click", requestGPSLocation);
}
