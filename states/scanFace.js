import { State, currentState, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';
import { dropShadowStart, dropShadowEnd } from './utils.js';

let cam;
let capture;
let faceapi;
let detections = [];

let isInitialized = false;

const radius = 190;

let inCircleStartMillis = 0;
let inCirCleCumulatedMillis = 0; // 시작 밀리초 부터 현재까지 누적된 시간
const inCircleDuration = 3000; // 3초

export function ScanFace() {
  // 그라데이션 배경 이미지
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  if (!isInitialized) {
      setupFaceApi();
      isInitialized = true;
      inCircleStartMillis = 0;
  }

  if (capture) {
    imageMode(CENTER);
    translate(global.centerX, global.centerY);
    scale(-1, 1); // 좌우반전

    const w = 640;
    const h = 480;
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
    
    /*
    if (detections.length > 0) {
      const box = detections[0].alignedRect._box;

      const faceW = box._width;
      const faceH = box._height;

      // 얼굴 중심 좌표 (캡처 기준 → 중앙 좌표계로 보정)
      const faceCenterX = box._x + faceW / 2 - 320;
      const faceCenterY = box._y + faceH / 2 - 240;

      // 중앙 원 기준
      
      const distFromCenter = dist(faceCenterX, faceCenterY, 0, 0);

      // 조건 1: 중심이 원 안에 있음
      const centerInside = distFromCenter < radius;

      // 조건 2: 얼굴 전체 크기가 원보다 작음
      const fitsInCircle = faceW < radius * 2 * 0.9 && faceH < radius * 2 * 0.9;
      // 0.9는 여유 여백 (딱 맞으면 안 예쁨)

      const inCircle = centerInside && fitsInCircle;

      // 얼굴 박스 그리기
      stroke(inCircle ? color(0, 255, 50, 150) : color(255, 0, 0, 120));
      strokeWeight(2);
      noFill();
      rectMode(CENTER);
      rect(faceCenterX, faceCenterY, faceW, faceH);
    }
    */

    let statusText = "얼굴을 중앙에 위치시켜주세요.";

    switch (getFaceDetectionStatus()) {
      case "inCircle":
        statusText = `얼굴이 중앙에 위치했습니다. \n\n\n ${floor((inCircleDuration - inCirCleCumulatedMillis)/1000)} 후 다음 단계로 이동합니다.`;
        stroke(0, 255, 50, 150);
        waitForFacePosition(true);
        break;
      case "onlyCenterInside":
        statusText = "뒤로 조금 이동해주세요.";
        stroke(255, 255, 255, 120);
        waitForFacePosition(false);
        break;
      case "onlyFitsInCircleSize":
        statusText = "얼굴이 중앙에 위치하지 않았습니다.";
        stroke(255, 255, 255, 120);
        waitForFacePosition(false);
        break;
      case "outOfCircle":
        statusText = "얼굴이 중앙에 위치하지 않았습니다.";
        stroke(255, 255, 255, 120);
        waitForFacePosition(false);
        break;
      case "noFace":
        statusText = "얼굴을 찾을 수 없습니다.";
        stroke(255, 255, 255, 120);
        waitForFacePosition(false);
        break;
      default:
    }

    noFill();
    strokeWeight(25);
    circle(0, 0, radius*2); // 중앙 원
    noStroke();

    resetMatrix(); // 변환 행렬 초기화

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);

    setFontStyle(700, 48);
    text("얼굴 인식", global.centerX, global.centerY - 280);

    setFontStyle(500, 32);
    text(statusText, global.centerX, global.centerY + 290);
  }

  

  drawStarMousePointer();
}

export function pressedScanFace() {
  moveToSituation();
} 

function setupFaceApi() {
  capture = createCapture(VIDEO);
  capture.size(640, 480);
  capture.hide();

  const faceOptions = {
    maxFaces: 1,
    withLandmarks: true,
    // withExpressions: true,
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
    if (currentState.value === State.ScanFace && faceapi) {
      faceapi.detect(gotFaces);
    }
  }, 200);
}

function getFaceDetectionStatus() {
  if (detections.length > 0) {
    const box = detections[0].alignedRect._box;

    const faceW = box._width;
    const faceH = box._height;

    // 얼굴 중심 좌표 (캡처 기준 → 중앙 좌표계로 보정)
    const faceCenterX = box._x + faceW / 2 - 320;
    const faceCenterY = box._y + faceH / 2 - 240;

    // 중앙 원 기준
    
    const distFromCenter = dist(faceCenterX, faceCenterY, 0, 0);

    // 조건 1: 중심이 원 안에 있음
    const centerInside = distFromCenter < radius;

    // 조건 2: 얼굴 전체 크기가 원보다 작음
    const fitsInCircleSize = faceW < radius * 2 * 0.9 && faceH < radius * 2 * 0.9;
    // 0.9는 여유 여백 (딱 맞으면 안 예쁨)

    const inCircle = centerInside && fitsInCircleSize;

    stroke(inCircle ? color(0, 255, 50, 150) : color(255, 0, 0, 120));
    strokeWeight(2);
    noFill();
    rectMode(CENTER);
    rect(faceCenterX, faceCenterY, faceW, faceH);

    // 두 조건 모두 만족하는 경우
    if (inCircle) {
      return "inCircle";
    }
    // 조건 하나만 만족하고 나머지 하나는 만족 하지 않는 경우
    else if (centerInside) {
      return "onlyCenterInside"; 
    } else if (fitsInCircleSize) {
      return "onlyFitsInCircleSize"; 
    // 조건 둘 다 만족하지 않는 경우
    } else {
      return "outOfCircle";
    }
  } else {
    return "noFace";
  }
}

function waitForFacePosition(inCircle) {
  if (inCircle) {
    inCirCleCumulatedMillis = millis() - inCircleStartMillis; // 누적 시간 갱신
    if (inCircleStartMillis === 0) {
      inCircleStartMillis = millis();
      inCirCleCumulatedMillis = 0; // 타이머 초기화
    } else if (inCirCleCumulatedMillis >= inCircleDuration) {
      moveToSituation(); // 3초 후 상태 전환
    }
  } else {
    inCircleStartMillis = 0; // 원 밖으로 나가면 타이머 초기화
    inCirCleCumulatedMillis = 0; // 누적 시간 초기화
  }
}

function moveToSituation() {
  // 상태 전환 함수
  setState(State.Situation);
  isInitialized = false; // 상태 초기화
  if (capture) {
    capture.stop();     // 스트리밍 중지
    capture.remove();   // DOM에서 제거
    capture = null;
  }

  faceapi = null;  // 참조 해제
  detections = [];
}