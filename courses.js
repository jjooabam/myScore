// 전국 주요 골프장 데이터베이스 (GPS 좌표 및 코스 정보)
const DEFAULT_COURSES = [
  // 1. 사용자 즐겨찾기 5대 골프장 (최우선 배치)
  {
    id: "gamgok_cc",
    name: "감곡CC",
    region: "충북 음성",
    lat: 37.1254,
    lng: 127.6960,
    courses: [
      { id: "peach", name: "피치 코스", holes: [{hole:1,par:4},{hole:2,par:4},{hole:3,par:3},{hole:4,par:4},{hole:5,par:5},{hole:6,par:4},{hole:7,par:3},{hole:8,par:5},{hole:9,par:4}] },
      { id: "glen", name: "글렌 코스", holes: [{hole:1,par:4},{hole:2,par:5},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:3},{hole:7,par:4},{hole:8,par:5},{hole:9,par:4}] }
    ]
  },
  {
    id: "star_cc",
    name: "스타CC",
    region: "충북 충주",
    lat: 37.0865,
    lng: 127.7615,
    courses: [
      { id: "lake", name: "레이크 코스", holes: [{hole:1,par:4},{hole:2,par:4},{hole:3,par:3},{hole:4,par:5},{hole:5,par:4},{hole:6,par:4},{hole:7,par:3},{hole:8,par:5},{hole:9,par:4}] },
      { id: "hill", name: "힐 코스", holes: [{hole:1,par:4},{hole:2,par:5},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:3},{hole:7,par:5},{hole:8,par:4},{hole:9,par:4}] }
    ]
  },
  {
    id: "beaconhills_cc",
    name: "비콘힐스CC",
    region: "강원 홍천",
    lat: 37.6241,
    lng: 127.8677,
    courses: [
      { id: "sky", name: "하늘 코스", holes: [{hole:1,par:4},{hole:2,par:4},{hole:3,par:3},{hole:4,par:5},{hole:5,par:4},{hole:6,par:4},{hole:7,par:3},{hole:8,par:4},{hole:9,par:5}] },
      { id: "nuri", name: "누리 코스", holes: [{hole:1,par:4},{hole:2,par:5},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:3},{hole:7,par:4},{hole:8,par:5},{hole:9,par:4}] }
    ]
  },
  {
    id: "logebien_cc",
    name: "로제비앙CC (구 큐로)",
    region: "경기 광주",
    lat: 37.3483,
    lng: 127.3512,
    courses: [
      { id: "rose", name: "로제 코스", holes: [{hole:1,par:4},{hole:2,par:4},{hole:3,par:3},{hole:4,par:5},{hole:5,par:4},{hole:6,par:4},{hole:7,par:3},{hole:8,par:5},{hole:9,par:4}] },
      { id: "biang", name: "비앙 코스", holes: [{hole:1,par:4},{hole:2,par:5},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:3},{hole:7,par:4},{hole:8,par:5},{hole:9,par:4}] },
      { id: "neo", name: "네오 코스", holes: [{hole:1,par:4},{hole:2,par:3},{hole:3,par:5},{hole:4,par:4},{hole:5,par:4},{hole:6,par:3},{hole:7,par:5},{hole:8,par:4},{hole:9,par:4}] }
    ]
  },
  {
    id: "silkvalley_cc",
    name: "실크밸리CC",
    region: "경기 안성/이천",
    lat: 37.0674,
    lng: 127.5029,
    courses: [
      { id: "silk", name: "실크 코스", holes: [{hole:1,par:5},{hole:2,par:4},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:5},{hole:7,par:3},{hole:8,par:4},{hole:9,par:4}] },
      { id: "lake", name: "레이크 코스", holes: [{hole:1,par:4},{hole:2,par:4},{hole:3,par:3},{hole:4,par:5},{hole:5,par:4},{hole:6,par:3},{hole:7,par:4},{hole:8,par:5},{hole:9,par:4}] },
      { id: "valley", name: "밸리 코스", holes: [{hole:1,par:4},{hole:2,par:5},{hole:3,par:3},{hole:4,par:4},{hole:5,par:4},{hole:6,par:4},{hole:7,par:3},{hole:8,par:5},{hole:9,par:4}] }
    ]
  },

  // 2. 경기 남부 / 충청 북부 인기 골프장
  { id: "club72_ocean", name: "클럽72 (구 스카이72)", region: "인천 중구", lat: 37.4764, lng: 126.4714, courses: [{id:"c1", name:"하늘 코스"}, {id:"c2", name:"바다 코스"}, {id:"c3", name:"원익 코스"}] },
  { id: "bearcreek_pocheon", name: "베어크리크 포천", region: "경기 포천", lat: 37.8187, lng: 127.2415, courses: [{id:"c1", name:"베어 코스"}, {id:"c2", name:"크리크 코스"}] },
  { id: "bearcreek_chuncheon", name: "베어크리크 춘천", region: "강원 춘천", lat: 37.7667, lng: 127.6534, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "lavieestbelle", name: "라비에벨CC", region: "강원 춘천", lat: 37.8015, lng: 127.5623, courses: [{id:"c1", name:"올드 코스"}, {id:"c2", name:"듄스 코스"}] },
  { id: "clubmow", name: "클럽모우CC", region: "강원 홍천", lat: 37.6681, lng: 127.6821, courses: [{id:"c1", name:"마운틴"}, {id:"c2", name:"오아시스"}, {id:"c3", name:"와일드"}] },
  { id: "cascadia", name: "카스카디아CC", region: "강원 홍천", lat: 37.6987, lng: 127.9124, courses: [{id:"c1", name:"스톤"}, {id:"c2", name:"트리"}, {id:"c3", name:"워터"}] },
  { id: "hilldeloci", name: "힐드로사이CC", region: "강원 홍천", lat: 37.5812, lng: 127.7945, courses: [{id:"c1", name:"버치 코스"}, {id:"c2", name:"파인 코스"}] },
  { id: "sonofelice", name: "소노펠리체CC", region: "강원 홍천", lat: 37.6432, lng: 127.7012, courses: [{id:"c1", name:"힐링 코스"}, {id:"c2", name:"에코 코스"}] },
  { id: "southsprings", name: "사우스스프링스CC", region: "경기 이천", lat: 37.1632, lng: 127.4612, courses: [{id:"c1", name:"레이크 코스"}, {id:"c2", name:"마운틴 코스"}] },
  { id: "newspringville", name: "뉴스프링빌CC", region: "경기 이천", lat: 37.1214, lng: 127.5123, courses: [{id:"c1", name:"록키 코스"}, {id:"c2", name:"올림포스 코스"}] },
  { id: "bavista", name: "비에이비스타CC", region: "경기 이천", lat: 37.1982, lng: 127.4812, courses: [{id:"c1", name:"벨라 코스"}, {id:"c2", name:"몬티 코스"}, {id:"c3", name:"라고 코스"}] },
  { id: "sunningpoint", name: "써닝포인트CC", region: "경기 용인", lat: 37.1812, lng: 127.2412, courses: [{id:"c1", name:"썬 코스"}, {id:"c2", name:"포인트 코스"}] },
  { id: "plaza_yongin", name: "플라자CC 용인", region: "경기 용인", lat: 37.1654, lng: 127.1512, courses: [{id:"c1", name:"타이거 코스"}, {id:"c2", name:"라이언 코스"}] },
  { id: "gold_cc", name: "골드CC", region: "경기 용인", lat: 37.2214, lng: 127.1321, courses: [{id:"c1", name:"챔피언 코스"}, {id:"c2", name:"마스터 코스"}] },
  { id: "korea_cc", name: "코리아CC", region: "경기 용인", lat: 37.2187, lng: 127.1425, courses: [{id:"c1", name:"레이크 코스"}, {id:"c2", name:"챌린지 코스"}] },
  { id: "asiana_cc", name: "아시아나CC", region: "경기 용인", lat: 37.2612, lng: 127.2814, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}] },
  { id: "taegwang_cc", name: "태광CC", region: "경기 용인", lat: 37.2714, lng: 127.1023, courses: [{id:"c1", name:"남 코스"}, {id:"c2", name:"동 코스"}, {id:"c3", name:"북 코스"}] },
  { id: "lakeside_cc", name: "레이크사이드CC", region: "경기 용인", lat: 37.3187, lng: 127.2145, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}, {id:"c3", name:"남 코스"}] },
  { id: "newseoul_cc", name: "뉴서울CC", region: "경기 광주", lat: 37.3812, lng: 127.2412, courses: [{id:"c1", name:"문화 코스"}, {id:"c2", name:"예술 코스"}] },
  { id: "gangnam_88_cc", name: "88CC", region: "경기 용인", lat: 37.2814, lng: 127.1812, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}] },
  { id: "suwon_cc", name: "수원CC", region: "경기 용인", lat: 37.2789, lng: 127.1123, courses: [{id:"c1", name:"구 코스"}, {id:"c2", name:"신 코스"}] },
  { id: "hwasan_cc", name: "화산CC", region: "경기 용인", lat: 37.1423, lng: 127.2512, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "namchon_cc", name: "남촌CC", region: "경기 광주", lat: 37.3214, lng: 127.3145, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}] },
  { id: "eastvalley_cc", name: "이스트밸리CC", region: "경기 광주", lat: 37.3145, lng: 127.3241, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"남 코스"}, {id:"c3", name:"서 코스"}] },
  { id: "gapyeong_benest", name: "가평베네스트GC", region: "경기 가평", lat: 37.8123, lng: 127.4214, courses: [{id:"c1", name:"메이플 코스"}, {id:"c2", name:"버치 코스"}, {id:"c3", name:"파인 코스"}] },
  { id: "anseong_benest", name: "안성베네스트GC", region: "경기 안성", lat: 37.0145, lng: 127.2814, courses: [{id:"c1", name:"클래식"}, {id:"c2", name:"북서 코스"}] },
  { id: "maestro_cc", name: "마에스트로CC", region: "경기 안성", lat: 37.0812, lng: 127.2412, courses: [{id:"c1", name:"밸리 코스"}, {id:"c2", name:"레이크 코스"}] },
  { id: "anseong_q", name: "골프클럽안성Q", region: "경기 안성", lat: 37.0512, lng: 127.3612, courses: [{id:"c1", name:"팜파스 코스"}, {id:"c2", name:"밸리 코스"}] },
  { id: "solmoro_cc", name: "솔모로CC", region: "경기 여주", lat: 37.1812, lng: 127.5612, courses: [{id:"c1", name:"체리 코스"}, {id:"c2", name:"퍼시몬 코스"}, {id:"c3", name:"파인 코스"}] },
  { id: "ceragio_cc", name: "세라지오GC", region: "경기 여주", lat: 37.2814, lng: 127.6214, courses: [{id:"c1", name:"세라 코스"}, {id:"c2", name:"지오 코스"}] },
  { id: "jayu_cc", name: "자유CC", region: "경기 여주", lat: 37.1987, lng: 127.6123, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "blueheron_gc", name: "블루헤런GC", region: "경기 여주", lat: 37.3812, lng: 127.5912, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}] },
  { id: "yeoju_cc", name: "여주CC", region: "경기 여주", lat: 37.2512, lng: 127.6012, courses: [{id:"c1", name:"에이스 코스"}, {id:"c2", name:"드림 코스"}, {id:"c3", name:"마스터 코스"}] },
  { id: "ferrum_cc", name: "페럼클럽", region: "경기 여주", lat: 37.2145, lng: 127.5714, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}] },
  { id: "namyeoju_gc", name: "남여주GC", region: "경기 여주", lat: 37.2214, lng: 127.5912, courses: [{id:"c1", name:"가람 코스"}, {id:"c2", name:"마루 코스"}, {id:"c3", name:"누리 코스"}] },
  { id: "shilla_cc", name: "신라CC", region: "경기 여주", lat: 37.3412, lng: 127.5412, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}, {id:"c3", name:"남 코스"}] },
  { id: "ariji_cc", name: "아리지CC", region: "경기 여주", lat: 37.1654, lng: 127.6321, courses: [{id:"c1", name:"햇님 코스"}, {id:"c2", name:"달님 코스"}, {id:"c3", name:"별님 코스"}] },

  // 3. 충청권 인기 골프장
  { id: "kingsdale_cc", name: "킹스데일GC", region: "충북 충주", lat: 37.0214, lng: 127.8123, courses: [{id:"c1", name:"레이크 코스"}, {id:"c2", name:"힐 코스"}] },
  { id: "daeyeong_hills", name: "대영힐스CC", region: "충북 충주", lat: 37.0312, lng: 127.7912, courses: [{id:"c1", name:"력 코스"}, {id:"c2", name:"청 코스"}, {id:"c3", name:"미 코스"}] },
  { id: "daeyeong_base", name: "대영베이스CC", region: "충북 충주", lat: 37.0354, lng: 127.8012, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "royalfore_cc", name: "로얄포레CC", region: "충북 충주", lat: 37.0512, lng: 127.7314, courses: [{id:"c1", name:"로얄 코스"}, {id:"c2", name:"포레 코스"}] },
  { id: "eleven_cc", name: "일레븐CC", region: "충북 충주", lat: 37.1123, lng: 127.7412, courses: [{id:"c1", name:"마운틴 코스"}, {id:"c2", name:"파크 코스"}] },
  { id: "woojeonghills", name: "우정힐스CC", region: "충남 천안", lat: 36.7512, lng: 127.2412, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "cheonan_sangrok", name: "천안상록CC", region: "충남 천안", lat: 36.7314, lng: 127.2612, courses: [{id:"c1", name:"남 코스"}, {id:"c2", name:"동 코스"}, {id:"c3", name:"중 코스"}] },
  { id: "birdwood_gc", name: "버드우드GC", region: "충남 천안", lat: 36.7912, lng: 127.2914, courses: [{id:"c1", name:"버드 코스"}, {id:"c2", name:"우드 코스"}] },
  { id: "sg_beautiful", name: "SG아름다운CC", region: "충남 아산", lat: 36.8814, lng: 126.9812, courses: [{id:"c1", name:"힐 코스"}, {id:"c2", name:"레이크 코스"}, {id:"c3", name:"락 코스"}] },
  { id: "sejong_emerson", name: "세종에머슨CC", region: "세종시", lat: 36.6512, lng: 127.2312, courses: [{id:"c1", name:"마운틴"}, {id:"c2", name:"레이크"}, {id:"c3", name:"밸리"}] },
  { id: "sejong_field", name: "세종필드GC", region: "세종시", lat: 36.5214, lng: 127.2512, courses: [{id:"c1", name:"세종 코스"}, {id:"c2", name:"행복 코스"}] },
  { id: "the_jewel", name: "떼제베CC", region: "충북 청주", lat: 36.6312, lng: 127.3412, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}, {id:"c3", name:"남 코스"}, {id:"c4", name:"북 코스"}] },
  { id: "grand_cc", name: "그랜드CC", region: "충북 청주", lat: 36.7123, lng: 127.4812, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"남 코스"}, {id:"c3", name:"서 코스"}] },
  { id: "royalrings", name: "로얄링스CC (구 현대더링스)", region: "충남 태안", lat: 36.6812, lng: 126.3412, courses: [{id:"c1", name:"킹스 코스"}, {id:"c2", name:"퀸스 코스"}] },
  { id: "goldenbay_cc", name: "골든베이골프앤리조트", region: "충남 태안", lat: 36.7514, lng: 126.1512, courses: [{id:"c1", name:"오션 코스"}, {id:"c2", name:"밸리 코스"}, {id:"c3", name:"마운틴 코스"}] },

  // 4. 강원권 명문/인기 골프장
  { id: "sagewood_hongcheon", name: "세이지우드 홍천", region: "강원 홍천", lat: 37.7512, lng: 127.9812, courses: [{id:"c1", name:"드림"}, {id:"c2", name:"비전"}, {id:"c3", name:"챌린지"}] },
  { id: "elysian_gangchon", name: "엘리시안 강촌", region: "강원 춘천", lat: 37.8214, lng: 127.5812, courses: [{id:"c1", name:"밸리 코스"}, {id:"c2", name:"레이크 코스"}, {id:"c3", name:"힐 코스"}] },
  { id: "pagoda_oakvalley", name: "오크밸리CC", region: "강원 원주", lat: 37.4123, lng: 127.8214, courses: [{id:"c1", name:"오크 코스"}, {id:"c2", name:"메이플 코스"}, {id:"c3", name:"파인 코스"}] },
  { id: "oakcreek_gc", name: "오크크릭GC", region: "강원 원주", lat: 37.4012, lng: 127.8112, courses: [{id:"c1", name:"OUT 코스"}, {id:"c2", name:"IN 코스"}] },
  { id: "century21_cc", name: "센추리21CC", region: "강원 원주", lat: 37.3512, lng: 127.7812, courses: [{id:"c1", name:"파인"}, {id:"c2", name:"레이크"}, {id:"c3", name:"필드"}, {id:"c4", name:"밸리"}] },
  { id: "yongpyong_cc", name: "용평버치힐GC", region: "강원 평창", lat: 37.6412, lng: 128.6912, courses: [{id:"c1", name:"버치 코스"}, {id:"c2", name:"힐 코스"}] },
  { id: "seolhaeone", name: "설해원", region: "강원 양양", lat: 38.0512, lng: 128.6612, courses: [{id:"c1", name:"샐몬 코스"}, {id:"c2", name:"씨뷰 코스"}, {id:"c3", name:"더레전드"}] },
  { id: "pine_ridge", name: "파인리즈리조트", region: "강원 고성", lat: 38.2814, lng: 128.5312, courses: [{id:"c1", name:"파인"}, {id:"c2", name:"리즈"}, {id:"c3", name:"레이크"}] },

  // 5. 제주 대표 골프장
  { id: "ninebridges_jeju", name: "클럽나인브릿지", region: "제주 서귀포", lat: 33.3612, lng: 126.3912, courses: [{id:"c1", name:"하이랜드 코스"}, {id:"c2", name:"크릭 코스"}] },
  { id: "pinx_jeju", name: "핀크스GC", region: "제주 서귀포", lat: 33.3214, lng: 126.3612, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}, {id:"c3", name:"북 코스"}] },
  { id: "blackstone_jeju", name: "블랙스톤 제주", region: "제주시 한림", lat: 33.3712, lng: 126.2912, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"남 코스"}, {id:"c3", name:"북 코스"}] },
  { id: "teddyvalley", name: "테디밸리CC", region: "제주 서귀포", lat: 33.3012, lng: 126.3412, courses: [{id:"c1", name:"테디 코스"}, {id:"c2", name:"밸리 코스"}] },
  { id: "elysian_jeju", name: "엘리시안 제주", region: "제주시 애월", lat: 33.3814, lng: 126.3512, courses: [{id:"c1", name:"캄포"}, {id:"c2", name:"파인"}, {id:"c3", name:"레이크"}] },
  { id: "lotte_skyhill_jeju", name: "롯데스카이힐 제주", region: "제주 서귀포", lat: 33.2814, lng: 126.3912, courses: [{id:"c1", name:"스카이"}, {id:"c2", name:"오션"}, {id:"c3", name:"힐"}, {id:"c4", name:"포레스트"}] },
  { id: "ora_cc", name: "오라CC", region: "제주시", lat: 33.4612, lng: 126.5112, courses: [{id:"c1", name:"동 코스"}, {id:"c2", name:"서 코스"}, {id:"c3", name:"남 코스"}] },
  { id: "ecoland_gc", name: "에코랜드GC", region: "제주시 조천", lat: 33.4312, lng: 126.6812, courses: [{id:"c1", name:"와일드 코스"}, {id:"c2", name:"에코 코스"}] },

  // 6. 영남 및 호남 대표 골프장
  { id: "gyeongju_shilla", name: "경주신라CC", region: "경북 경주", lat: 35.8512, lng: 129.2812, courses: [{id:"c1", name:"화랑 코스"}, {id:"c2", name:"형제 코스"}] },
  { id: "blueone_the_honors", name: "블루원디아너스CC", region: "경북 경주", lat: 35.8314, lng: 129.2914, courses: [{id:"c1", name:"레이크"}, {id:"c2", name:"토러스"}, {id:"c3", name:"밸리"}] },
  { id: "aone_cc", name: "에이원CC", region: "경남 양산", lat: 35.4214, lng: 129.1312, courses: [{id:"c1", name:"남 코스"}, {id:"c2", name:"동 코스"}, {id:"c3", name:"서 코스"}] },
  { id: "gaya_cc", name: "가야CC", region: "경남 김해", lat: 35.2814, lng: 128.8912, courses: [{id:"c1", name:"수로"}, {id:"c2", name:"낙동"}, {id:"c3", name:"김해"}, {id:"c4", name:"신어"}] },
  { id: "southlinks_yeongam", name: "사우스링스 영암", region: "전남 영암", lat: 34.7812, lng: 126.4212, courses: [{id:"c1", name:"카일필립스"}, {id:"c2", name:"짐앵"}] },
  { id: "pinebeach_cc", name: "파인비치 골프링크스", region: "전남 해남", lat: 34.6012, lng: 126.2912, courses: [{id:"c1", name:"파인 코스"}, {id:"c2", name:"비치 코스"}] }
];

// 기본 9홀 Par36 코스 자동 보완 함수 (등록되지 않은 코스는 자동으로 표준 파36 적용)
function getCourseHolesOrDefault(courseSub) {
  if (courseSub.holes && courseSub.holes.length === 9) {
    return courseSub.holes;
  }
  // 표준 정규 9홀 (Par 36: 파3 2개, 파4 5개, 파5 2개)
  return [
    { hole: 1, par: 4 },
    { hole: 2, par: 4 },
    { hole: 3, par: 3 },
    { hole: 4, par: 4 },
    { hole: 5, par: 5 },
    { hole: 6, par: 4 },
    { hole: 7, par: 3 },
    { hole: 8, par: 5 },
    { hole: 9, par: 4 }
  ];
}

// 사용자 맞춤형 클럽 프리셋
const PAR4_SECOND_CLUBS = ["8I", "9I", "PW", "48°", "52°", "56°", "7I", "6I", "5I", "유틸", "우드"];
const PAR5_SECOND_CLUBS = ["우드", "유틸", "5I", "6I", "7I", "8I", "9I", "웨지"];
const PAR5_THIRD_CLUBS = ["8I", "9I", "PW", "48°", "52°", "56°", "7I", "6I", "5I", "유틸", "우드", "온그린(생략)"];

// 로컬스토리지에서 골프장 목록 가져오기 (커스텀 골프장 병합)
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
