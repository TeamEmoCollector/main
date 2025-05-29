// ✅ states/situation.js – 표정 인식 연동 Scene
import { State, currentState, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';
import { dropShadowStart, dropShadowEnd } from './utils.js';

let emotions = ["neutral","happy", "sad", "angry","fearful", "disgusted","surprised"];
let capture;
let faceapi;
let detections = [];

let isInitialized = false;

let camWidth = 320;
let camHeight = 240;

let startMillis = 0; // 시작 시간
let standardDurationMillis = 5000;

export function Situation() {
  // 그라데이션 배경 이미지
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);

  setFontStyle(700, 48);
  text("상황 1/3", global.centerX, global.centerY - 280);

  setFontStyle(500, 44);
  text("(상황 이미지)", global.centerX-80, global.centerY);

  setFontStyle(500, 32);
  text("길거리를 걷다 옛 친구를 만난 상황", global.centerX-80, height - 140);
  setFontStyle(500, 24);
  text("이때, 느껴지는 당신의 감정을 표정으로 나타내주세요.", global.centerX-80, height - 90);

  setFontStyle(700, 32);
  text("행복 (인식률: 80%)", global.centerX-80, height - 50);

  text((5 - floor((millis() - startMillis)/1000)) + "초", width-80, height - 50);

  if (!isInitialized) {
    setupFaceApi();
    isInitialized = true;
    startMillis = millis(); // 시작 시간 초기화
  }

  if (capture) {
    imageMode(CENTER);
    translate(width-200, 230);
    scale(-1, 1); // 좌우반전

    const w = camWidth;
    const h = camHeight;
    const r = 40; // 모서리 반지름

    // 둥근 사각형 마스크
    // 이 부분은 AI 사용
    drawingContext.save();
    drawingContext.beginPath();

    // 둥근 사각형 경로 만들기
    const ctx = drawingContext;
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    ctx.closePath();

    drawingContext.clip();

    image(capture, 0, 0, w, h);
    drawingContext.restore();
    drawFaceAlignedRect(); // 얼굴 인식 사각형 그리기
    resetMatrix();
  }

  drawDetections();

  if ( millis() - startMillis > standardDurationMillis) {
    // 5초가 지나면 감정 수집 화면으로 이동
    moveToCollectEmotion();
  }
}

export function pressedSituation() {
  moveToCollectEmotion();
}

function setupFaceApi() {
  capture = createCapture(VIDEO);
  capture.size(camWidth, camHeight);
  capture.hide();

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: false
  };

  faceapi = ml5.faceApi(capture, faceOptions, () => {
    faceapi.detect(gotFaces);
  });
}

function gotFaces(error, result) {
  if (error) return;
  detections = result;

  // 200ms 마다 1회 분석 (초당 5프레임 분석)
  setTimeout(() => {
    if (currentState.value === State.Situation && faceapi) {
      faceapi.detect(gotFaces);
    }
  }, 200);
}

function drawDetections() {
  if (detections.length > 0) {
    push();
    translate(40, 30);
    fill(0, 255, 0);
    noStroke();
    textSize(14);
    for (let i = 0; i < emotions.length; i++) {
      const e = emotions[i];
      const level = detections[0].expressions[e];
      text(`${e}: ${level.toFixed(2)}`, 0, i * 25);
      fill(100, 200, 255, 150);
      rect(0, i * 25 + 5, level * 150, 10);
      fill(0, 255, 0);
    }
    pop();
  }
}

function drawFaceAlignedRect(camImageWidth, camImageHeight) {
  if (detections.length > 0) {
    const box = detections[0].alignedRect._box;

    const faceW = box._width;
    const faceH = box._height;

    // 얼굴 중심 좌표 (캡처 기준 → 중앙 좌표계로 보정)
    const faceCenterX = box._x + faceW / 2 - camWidth/2;
    const faceCenterY = box._y + faceH / 2 - camHeight/2;

    // 중앙 원 기준
    
    // const distFromCenter = dist(faceCenterX, faceCenterY, 0, 0);

    // // 조건 1: 중심이 원 안에 있음
    // const centerInside = distFromCenter < radius;

    // // 조건 2: 얼굴 전체 크기가 원보다 작음
    // const fitsInCircleSize = faceW < radius * 2 * 0.9 && faceH < radius * 2 * 0.9;
    // // 0.9는 여유 여백 (딱 맞으면 안 예쁨)

    // const inCircle = centerInside && fitsInCircleSize;

    //stroke(inCircle ? color(0, 255, 50, 150) : color(255, 0, 0, 120));
    stroke(color(0, 255, 50, 150)); // 항상 녹색으로 표시
    strokeWeight(2);
    noFill();
    rectMode(CENTER);
    rect(faceCenterX, faceCenterY, faceW, faceH);

    // 두 조건 모두 만족하는 경우
  //   if (inCircle) {
  //     return "inCircle";
  //   }
  //   // 조건 하나만 만족하고 나머지 하나는 만족 하지 않는 경우
  //   else if (centerInside) {
  //     return "onlyCenterInside"; 
  //   } else if (fitsInCircleSize) {
  //     return "onlyFitsInCircleSize"; 
  //   // 조건 둘 다 만족하지 않는 경우
  //   } else {
  //     return "outOfCircle";
  //   }
  // } else {
  //   return "noFace";
  // }
  }
}

function moveToCollectEmotion() {
  setState(State.CollectEmotion);
  isInitialized = false; // 상태 초기화
  if (capture) {
    capture.stop();     // 스트리밍 중지
    capture.remove();   // DOM에서 제거
    capture = null;
  }

  faceapi = null;  // 참조 해제
  detections = [];
  startMillis = 0; // 시작 시간 초기화
}