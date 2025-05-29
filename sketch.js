// ✅ sketch.js (단일 모듈 - 전역 등록 방식 + 깔끔한 구조)
import { State, currentState } from './stateManager.js';
import { global } from './globalStore.js';

import { Home, StartContent } from './states/home.js';
import { ScanFace, pressedScanFace } from './states/scanFace.js';
import { Situation, pressedSituation } from './states/situation.js';
import { CollectEmotion, pressedCollectEmotion } from './states/collectEmotion.js';
import { Report, pressedReport } from './states/report.js';
import { Credits, pressedCredits } from './states/credits.js';

let bgCanvas;

const mousePressedHandler = {
  [State.Home]: () => StartContent(),
  [State.ScanFace]: () => pressedScanFace(),
  [State.Situation]: () => pressedSituation(),
  [State.CollectEmotion]: () => pressedCollectEmotion(),
  [State.Report]: () => pressedReport(),
  [State.Credits]: () => pressedCredits()
};

function preload() {
  const path = (prefix, name) => `assets/${prefix}/${name}.svg`;
  global.emotions.forEach(e => {
    global.emoImg[e] = loadImage(path('emoFragments', e));
    global.emoGrayImg[e] = loadImage(path('emoFragmentsGray', e));
  });
  global.lightImg = loadImage("assets/light.png");
  global.grdImg = loadImage("assets/grd.png");
  fullscreen(true);
}

function setup() {
  createCanvas(1280, 720);
  global.centerX = width / 2;
  global.centerY = height / 2;

  for (let i = 0; i < 50; i++) {
    global.stars.push({
      x: random(width),
      y: random(height),
      size: random(2, 5)
    });
  }

  bgCanvas = document.getElementById('bg-canvas');
  bgCanvas.width = width;
  bgCanvas.height = height;
  
}

function draw() {
  global.smoothX += (mouseX - global.smoothX) * 0.2;
  global.smoothY += (mouseY - global.smoothY) * 0.2;
  global.speed = mouseX - pmouseX;
  global.smoothSpeed += (global.speed - global.smoothSpeed) * 0.2;

  switch (currentState.value) {
    case State.Home: Home(); break;
    case State.ScanFace: ScanFace(); break;
    case State.Situation: Situation(); break;
    case State.CollectEmotion: CollectEmotion(); break;
    case State.Report: Report(); break;
    case State.Credits: Credits(); break;
  }

  // draw() 안에서
  const ctx = bgCanvas.getContext('2d');
  ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // 👇 캔버스를 강제로 확대해서 전체 bg-canvas에 맞게 채우기
  ctx.drawImage(canvas, 0, 0, bgCanvas.width, bgCanvas.height);
}

function mousePressed() {
  mousePressedHandler[currentState.value]?.();
}

function keyPressed() {
  //keyPressedHandler[currentState.value]?.();
}

// 전역으로 등록 (type="module" 대응)
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.keyPressed = keyPressed;