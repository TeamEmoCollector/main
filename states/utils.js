import { global } from '../globalStore.js';

export function setFontStyle(weight, size) {
  drawingContext.font = `${weight} ${size}px 'Pretendard Variable'`;
}

// AI 사용
// p5.js의 drawingContext를 사용하여 drop shadow 효과 적용 함수
// p5.js에서 공식적으로 제공하는 drop shadow 기능을 찾아보기 어려워 AI에게 요청해봤습니다.
export function dropShadowStart(blur, glowColor) {
  drawingContext.save();
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = blur;
  drawingContext.shadowColor = glowColor;
}

// AI 사용
// p5.js의 drawingContext를 사용하여 drop shadow 효과 제거 함수
// 이유는 위와 같습니다.
export function dropShadowEnd() {
  drawingContext.restore();
}

export function drawStarMousePointer() {
  imageMode(CENTER);
  image(global.lightImg, global.smoothX, global.smoothY, 400, 400);

  push();
  dropShadowStart(200, color(255, 201, 86, 150));
  translate(global.smoothX, global.smoothY);
  rotate(radians(global.smoothSpeed * 0.9));
  image(global.emoImg.happy, 0, 0, 120, 120);
  dropShadowEnd();
  pop();
}