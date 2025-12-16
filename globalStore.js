export const global = {
  capture: null,
  faceapi: null,

  // ml5로 인식하는 정보
  detections:[],

  centerX: 0,
  centerY: 0,
  smoothX: 0,
  smoothY: 0,
  speed: 0,
  smoothSpeed: 0,

  stars: [],
  lightImg: null,

  // 감정 이미지 저장
  emoImg: {
    happy: 0, sad: 0, angry: 0,
    surprised: 0, neutral: 0, fearful: 0
  },

  // 모든 상황 정의 (5개)
  situations: [
    {
      id: 1,
      title: "길거리를 걷다 옛 친구를 만난 상황",
      img: null,
    },
    {
      id: 2,
      title: "시험을 망친 후 친구와 대화하는 상황",
      img: null,
    },
    {
      id: 3,
      title: "새로운 직장에서 첫 출근하는 상황",
      img: null,
    },
    {
      id: 4,
      title: "깜짝 생일 파티를 받은 상황",
      img: null,
    },
    {
      id: 5,
      title: "늦은 밤 혼자 걷는 상황",
      img: null,
    }
  ],

  grdImg: null,

  emotions: ["happy", "sad", "angry", "surprised", "neutral", "fearful"],

  currentSituationIndex: 0,       //현재 인덱스
  selectedSituationIndices: [],   // 랜덤으로 선택된 상황들의 인덱스

  // 각 상황에서 사용자가 가장 많이 보인 감정 인덱스 저장
  dominantEmotionIndicesPerSituation: [],

};