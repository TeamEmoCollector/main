import { global } from '../globalStore.js';

export function setFontStyle(weight, size) {
  drawingContext.font = `${weight} ${size}px 'Pretendard Variable'`;
}

export function dropShadowStart(blur, glowColor) {
  drawingContext.save();
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = blur;
  drawingContext.shadowColor = glowColor;
}

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

export function fadeIn() {
  const fadeInDuration = 1000; // 1초
  const fadeInStep = 255 / (fadeInDuration / 16); // 16ms마다 증가
  let currentAlpha = 0;

  function draw() {
    if (currentAlpha < 255) {
      currentAlpha += fadeInStep;
      fill(255, currentAlpha);
      rect(0, 0, width, height);
    } else {
      noLoop(); // 애니메이션이 끝나면 루프 중지
    }
  }

  return draw;
}