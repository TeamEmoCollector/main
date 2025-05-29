import { State, currentState, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';
import { dropShadowStart, dropShadowEnd } from './utils.js';

export function Report() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  setFontStyle(700, 48);
  text("리포트", global.centerX, global.centerY - 280);

  setFontStyle(500, 36);
  text("~ 개인 맞춤형 리포트 내용 ~", global.centerX, global.centerY);

  text("터치하여 크레딧 보기", global.centerX, height - 50);
}

export function pressedReport() {
  // 크레딧 화면으로 이동
  setState(State.Credits);
}