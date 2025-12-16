import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { dropShadowStart, dropShadowEnd, setFontStyle, drawStarMousePointer } from './utils.js';

export function Home() {

  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);
  drawStars();

  textAlign(LEFT, CENTER);
  setFontStyle(800, 100);
  fill(255);
  noStroke();
  dropShadowStart(30, color(255, 255, 255, 60));
  text("Emo:Collector", 100, global.centerY + 10);
  dropShadowEnd();

  drawEmotionLabels();

  let breathTerm = 180
  
  noStroke();
  setFontStyle(500, 32);
  fill(255);
  textAlign(RIGHT, CENTER);
  setFontStyle(500, 32);
  // AI 사용
  // breathTerm과 frameCount를 이용하여 시간에 따른 투명도 변화
  // 부드러운 애니메이션을 구현하는 것이 어려워서 AI의 도움을 받았습니다.
  fill(255, 255, 255, abs((frameCount%(breathTerm*2)-breathTerm)/breathTerm*2*255));
  text("터치하여 시작하세요", width - 30, height - 50);

  drawStarMousePointer();
}

function drawStars() {
  for (const star of global.stars) {
    const tempX = star.x + star.size * map(global.smoothX, 0, width, -5, 5);
    const tempY = star.y + star.size * map(global.smoothY, 0, height, -5, 5);
    fill(255, 255, 255, star.size * 40 + random(-50, 50));
    noStroke();
    ellipse(tempX, tempY, star.size);
  }
}

function drawEmotionLabels() {
  const x = 100;
  const y = global.centerY;
  const emotions = global.emotions;

  for (let i = 1; i <= 3; i++) {
    let upY = y - i * 100;
    let downY = y + i * 100;

    let upperOpacity = map(dist(global.smoothX, global.smoothY, 300, upY), 0, 250, 80 - i * 5, 0);
    let lowerOpacity = map(dist(global.smoothX, global.smoothY, 300, downY), 0, 250, 80 - i * 5, 0);

    fill(255, 255, 255, upperOpacity);
    text(emotions[i - 1], x, upY);

    fill(255, 255, 255, lowerOpacity);
    text(emotions[i + 2], x, downY);
  }
}

export function StartContent() {
  console.log("홈 상태에서 클릭됨");
  setState(State.ScanFace);
}