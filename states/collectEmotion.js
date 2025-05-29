import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';
import { dropShadowStart, dropShadowEnd } from './utils.js';

let isInitialized = false;

let startMillis = 0; // 시작 시간
let standardDurationMillis = 5000;

export function CollectEmotion() {
  if (!isInitialized) {
    isInitialized = true;
    startMillis = millis(); // 시작 시간 초기화
  }

  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  imageMode(CENTER);
  image(global.emoImg["happy"], global.centerX, global.centerY - 100, 120, 120);

  setFontStyle(700, 48);
  text("'행복' 감정 조각을 발견했어요.", global.centerX, global.centerY);
  text((5 - floor((millis() - startMillis)/1000)) + "초", global.centerX, global.centerY + 50);

  if ( millis() - startMillis > standardDurationMillis) {
    // 5초가 지나면 감정 수집 화면으로 이동
    moveToReport();
  }
}

export function pressedCollectEmotion() {
  if(millis() - startMillis > 10) {
    moveToReport();
  }
}

function moveToReport() {
  startMillis = millis(); // 시작 시간 초기화
  isInitialized = false; // 초기화 상태로 되돌리기
  setState(State.Report);
}