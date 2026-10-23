// 기본 탑재 골프장 데이터 (추후 사용자가 UI에서 추가/수정 가능)
const DEFAULT_COURSES = [
  {
    id: "gamgok_cc",
    name: "감곡CC",
    region: "충북 음성",
    lat: 37.1254,
    lng: 127.6960,
    courses: [
      {
        id: "peach",
        name: "피치 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 5 }, { hole: 6, par: 4 },
          { hole: 7, par: 3 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "glen",
        name: "글렌 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 5 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 4 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      }
    ]
  },
  {
    id: "star_cc",
    name: "스타CC",
    region: "충북 충주",
    lat: 37.0865,
    lng: 127.7615,
    courses: [
      {
        id: "lake",
        name: "레이크 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 5 }, { hole: 5, par: 4 }, { hole: 6, par: 4 },
          { hole: 7, par: 3 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "hill",
        name: "힐 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 5 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 5 }, { hole: 8, par: 4 }, { hole: 9, par: 4 }
        ]
      }
    ]
  },
  {
    id: "beaconhills_cc",
    name: "비콘힐스CC",
    region: "강원 홍천",
    lat: 37.6241,
    lng: 127.8677,
    courses: [
      {
        id: "sky",
        name: "하늘 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 5 }, { hole: 5, par: 4 }, { hole: 6, par: 4 },
          { hole: 7, par: 3 }, { hole: 8, par: 4 }, { hole: 9, par: 5 }
        ]
      },
      {
        id: "nuri",
        name: "누리 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 5 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 4 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      }
    ]
  },
  {
    id: "logebien_cc",
    name: "로제비앙CC",
    region: "경기 광주 (구 큐로CC)",
    lat: 37.3483,
    lng: 127.3512,
    courses: [
      {
        id: "rose",
        name: "로제 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 5 }, { hole: 5, par: 4 }, { hole: 6, par: 4 },
          { hole: 7, par: 3 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "biang",
        name: "비앙 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 5 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 4 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "neo",
        name: "네오 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 3 }, { hole: 3, par: 5 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 5 }, { hole: 8, par: 4 }, { hole: 9, par: 4 }
        ]
      }
    ]
  },
  {
    id: "silkvalley_cc",
    name: "실크밸리CC",
    region: "경기 안성/이천",
    lat: 37.0674,
    lng: 127.5029,
    courses: [
      {
        id: "silk",
        name: "실크 코스",
        holes: [
          { hole: 1, par: 5 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 5 },
          { hole: 7, par: 3 }, { hole: 8, par: 4 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "lake",
        name: "레이크 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 4 }, { hole: 3, par: 3 },
          { hole: 4, par: 5 }, { hole: 5, par: 4 }, { hole: 6, par: 3 },
          { hole: 7, par: 4 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      },
      {
        id: "valley",
        name: "밸리 코스",
        holes: [
          { hole: 1, par: 4 }, { hole: 2, par: 5 }, { hole: 3, par: 3 },
          { hole: 4, par: 4 }, { hole: 5, par: 4 }, { hole: 6, par: 4 },
          { hole: 7, par: 3 }, { hole: 8, par: 5 }, { hole: 9, par: 4 }
        ]
      }
    ]
  }
];

// 사용자 맞춤형 클럽 프리셋
// 1. 파4 세컨 클럽 (8, 9, P, 48, 52, 56, 7, 6, 5, 유틸, 우드)
const PAR4_SECOND_CLUBS = ["8I", "9I", "PW", "48°", "52°", "56°", "7I", "6I", "5I", "유틸", "우드"];

// 2. 파5 세컨 클럽 (우드, 유틸, 5, 6, 7, 8, 9, 웨지)
const PAR5_SECOND_CLUBS = ["우드", "유틸", "5I", "6I", "7I", "8I", "9I", "웨지"];

// 3. 파5 서드 클럽 (파4 세컨과 동일한 순서)
const PAR5_THIRD_CLUBS = ["8I", "9I", "PW", "48°", "52°", "56°", "7I", "6I", "5I", "유틸", "우드", "온그린(생략)"];

// 4. 파3 티/어프로치 보조 클럽
const PAR3_CLUBS = ["아이언", "유틸", "우드", "웨지", "온그린(생략)"];

// 로컬스토리지에서 골프장 목록 가져오기
function getCourses() {
  const custom = localStorage.getItem("golf_custom_courses");
  if (custom) {
    try {
      const parsed = JSON.parse(custom);
      return [...DEFAULT_COURSES, ...parsed];
    } catch (e) {
      console.error("Failed to parse custom courses", e);
    }
  }
  return [...DEFAULT_COURSES];
}

// 새 골프장 저장
function saveCustomCourse(newCourse) {
  const custom = localStorage.getItem("golf_custom_courses");
  let list = [];
  if (custom) {
    try { list = JSON.parse(custom); } catch (e) {}
  }
  list.push(newCourse);
  localStorage.setItem("golf_custom_courses", JSON.stringify(list));
}

// 거리 계산 (Haversine 공식, km 단위)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
