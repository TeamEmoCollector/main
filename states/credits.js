import { State, currentState, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';
import { dropShadowStart, dropShadowEnd } from './utils.js';

export function Credits() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  setFontStyle(700, 48);
  text("크레딧", global.centerX, global.centerY - 280);

  setFontStyle(500, 36);
  text("김동연: ~~", global.centerX, global.centerY-40);
  text("이원준: ~~", global.centerX, global.centerY);
  text("조우영: ~~", global.centerX, global.centerY+40);

  text("터치하여 시작 화면으로", global.centerX, height - 50);
}

export function pressedCredits() {
  setState(State.Home);
}