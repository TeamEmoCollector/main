import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { setFontStyle } from './utils.js';

let isInitialized = false;

let startMillis = 0; // 시작 시간
let standardDurationMillis = 4000;

let result;

export function RenderEmotionShard() {
  if (!isInitialized) {
    isInitialized = true;
    startMillis = millis(); // 시작 시간 초기화
    result = global.emotions[global.dominantEmotionIndicesPerSituation[global.currentSituationIndex - 1]];
  }

  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  imageMode(CENTER);
  image(global.emoImg[result], global.centerX, global.centerY - 100, 120, 120);

  setFontStyle(700, 48);
  text(`${result} 감정 조각을 발견했어요.`, global.centerX, global.centerY);
  text(( (standardDurationMillis / 1000)- floor((millis() - startMillis)/1000)) + "초", global.centerX, global.centerY + 50);

  if ( millis() - startMillis > standardDurationMillis) {
    moveToReport();
  }
}

function moveToReport() {
  startMillis = millis(); // 시작 시간 초기화
  isInitialized = false; // 초기화 상태로 되돌리기
  if(global.currentSituationIndex < 3)
    setState(State.Situation);
  else{
    setState(State.Report);
    global.capture.stop();
    global.capture.remove();
    global.capture = null;
    global.detections = [];
  }
}