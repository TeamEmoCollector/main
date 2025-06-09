import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';

let isModelLoaded = false;       // ml5.js faceApi 모델이 성공적으로 로드되었는지 여부를 나타냅니다. true면 로드 완료.
let isSetupInProgress = false;   // setupFaceApi 함수가 호출되어 모델 로딩 과정이 진행 중인지 여부를 나타냅니다. true면 진행 중.

const radius = 190; 
let inCircleStartMillis = 0;     // 얼굴이 원 안에 정확히 들어오기 시작한 시간
let inCirCleCumulatedMillis = 0; // 얼굴이 원 안에 머무른 누적 시간
const inCircleDuration = 3000;   // 기준: 3초 이상


export function ScanFace() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  if (isModelLoaded) {
    // ----- 상태 2: 모델 로드 완료 후 -----
    if (global.capture) {
      imageMode(CENTER);
      translate(global.centerX, global.centerY);
      scale(-1, 1);

      // AI 사용
      // 디자인을 위해 직사각형의 웹캠 캡처 이미지를 꼭지점이 둥근 직사각형으로 만드는 코드
      // 둥근 직사각형 모양으로 클리핑 하는 과정을 구현하기 어렵고, 복잡할 것이라 생각하여 AI의 도움을 받았습니다.
      const w = 640, h = 480, r = 40;

      drawingContext.save();
      drawingContext.beginPath();
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

      image(global.capture, 0, 0, w, h);
      drawingContext.restore();



      let statusText = "얼굴을 중앙 원에 맞춰주세요.";
      const faceStatus = getFaceDetectionStatus();

      switch (faceStatus) {
        case "inCircle":
          statusText = `얼굴이 중앙에 위치했습니다. \n\n\n ${floor((inCircleDuration - inCirCleCumulatedMillis) / 1000)}초 후 다음 단계로 이동합니다.`; // 남은 시간 표시
          stroke(0, 255, 50, 150);
          waitForFacePosition(true);
          break;
        case "onlyCenterInside":
          statusText = "뒤로 조금 이동해주세요.";
          stroke(255, 255, 255, 120);
          waitForFacePosition(false);
          break;
        case "onlyFitsInCircleSize":
        case "outOfCircle":
          statusText = "얼굴을 화면 중앙의 원에 맞춰주세요.";
          stroke(255, 255, 255, 120);
          waitForFacePosition(false);
          break;
        case "noFace":
          statusText = "얼굴을 찾을 수 없습니다.";
          stroke(255, 255, 255, 120);
          waitForFacePosition(false);
          break;
        default:
          waitForFacePosition(false);
      }

      noFill();
      strokeWeight(25);
      circle(0, 0, radius * 2);
      noStroke();

      resetMatrix();


      noStroke();
      fill(255);
      textAlign(CENTER, CENTER);
      setFontStyle(700, 48);
      text("얼굴 인식", global.centerX, global.centerY - 280);
      setFontStyle(500, 32);
      text(statusText, global.centerX, global.centerY + 290);

    }
  } else {
    // ----- 상태 1: 모델 로드 전 (로딩 중) -----
    if (!isSetupInProgress) {
      LoadFaceModel();
      isSetupInProgress = true;
    }
    textAlign(CENTER, CENTER);
    fill(255);
    setFontStyle(500, 32);
    text("얼굴 인식 기능을 불러오는 중입니다...", global.centerX, global.centerY);
  }


  drawStarMousePointer();
}

function LoadFaceModel() {
  global.capture = createCapture(VIDEO);
  global.capture.size(640, 480);
  global.capture.hide();

  const faceOptions = {
    maxFaces: 1,
    withLandmarks: true, // 얼굴 주요 특징점(눈, 코, 입 등)을 함께 감지하도록 합니다.
    withDescriptors: false // 얼굴 인식에 사용되는 기술자(descriptor)는 사용하지 않도록 합니다.
  };

  global.faceapi = ml5.faceApi(global.capture, faceOptions, () => {
    isModelLoaded = true;

    inCircleStartMillis = 0;
    inCirCleCumulatedMillis = 0;
    global.faceapi.detect(gotFaces);
  });
} 

function gotFaces(error, result) {
  if (error) {
    console.error("gotFaces error:", error);
    global.detections = [];
    return;
  }

  global.detections = result;

  setTimeout(() => {
    global.faceapi.detect(gotFaces);
    
  }, 200); // 200밀리초(0.2초) 후에 실행합니다. (초당 약 5프레임 감지)
}

// AI 사용
// 얼굴의 위치와 크기를 기준으로 인식 상태를 판단하는 함수
// 얼굴이 '원 안에' 들어왔는지 판단하는 부분을 어떻게 구현하는 것이 좋을 지 고민되어 AI의 도움을 받았습니다.
function getFaceDetectionStatus() {
  if (global.detections.length === 0) {
    return "noFace";
  }

  const box = global.detections[0].alignedRect._box;
  const faceW = box._width; // 얼굴 너비
  const faceH = box._height; // 얼굴 높이

  const faceCenterX = box._x + faceW / 2 - 320;
  const faceCenterY = box._y + faceH / 2 - 240;

  const distFromCenter = dist(faceCenterX, faceCenterY, 0, 0); // 얼굴 중심과 화면 중앙(0,0) 사이의 거리를 계산합니다.
  const centerInside = distFromCenter < radius; // 얼굴 중심이 안내 원 내부에 있는지 여부
  const fitsInCircleSize = faceW < radius * 2 * 0.9 && faceH < radius * 2 * 0.9; // 얼굴 크기가 안내 원보다 작은지 여부 (0.9는 약간의 여유)
  const inCircle = centerInside && fitsInCircleSize; // 두 조건 모두 만족하는지 여부

  if (inCircle) return "inCircle";
  if (centerInside) return "onlyCenterInside";
  if (fitsInCircleSize) return "onlyFitsInCircleSize"; 
  return "outOfCircle";
}

function waitForFacePosition(inCircle) {
  if (inCircle) {
    if (inCircleStartMillis === 0) {
      inCircleStartMillis = millis();
      inCirCleCumulatedMillis = 0;
    } else {
      inCirCleCumulatedMillis = millis() - inCircleStartMillis;
    }

    if (inCirCleCumulatedMillis >= inCircleDuration) { // 누적 시간이 설정된 지속 시간(3초) 이상이면
      global.detections = [];
      setState(State.Situation);
    }
  } else { // 얼굴이 원 안에 없거나, 조건에 맞지 않는 경우
    inCircleStartMillis = 0;
    inCirCleCumulatedMillis = 0;
  }
}
