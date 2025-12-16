export const State = {
  Home: 0,            // 메인 홈 화면
  ScanFace: 1,        // 얼굴 인식 화면
  Situation: 2,       // 상황 제시 화면
  CollectEmotion: 3,  // 감정 조각 수집 화면
  Report: 4,          // 리포트(결과 요약) 화면
  Credits: 5          // 크레딧 화면
};

export const currentState = {
  value: State.Home
};

export function setState(newState) {
  currentState.value = newState;
}