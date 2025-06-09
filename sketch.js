// 모듈 및 전역 상태 관리
import { State, currentState } from './stateManager.js';
import { global } from './globalStore.js';
import { Home, StartContent } from './states/1_home.js';
import { ScanFace} from './states/2_scanFace.js';
import { Situation} from './states/3_situation.js';
import { RenderEmotionShard} from './states/4_collectEmotion.js';
import { Report, pressedReport } from './states/5_report.js';
import { Credits, pressedCredits } from './states/6_credits.js';


// let bgCanvas;

// AI 사용
// AI에게 클릭할 때 현재 무슨 상태인지 
// 쉽게 파악하는 방법에 대해서 물어봤습니다.
const mousePressedHandler = {
  [State.Home]: () => StartContent(),
  [State.Report]: () => pressedReport(),
  [State.Credits]: () => pressedCredits()
};


// p5.js 라이프사이클 함수
function preload() {
  // 감정 조각 이미지 로드
  const path = (prefix, name) => `assets/${prefix}/${name}.svg`;
  global.emotions.forEach(e => {
    global.emoImg[e] = loadImage(path('emoFragments', e));
  });

  // 상황별 이미지 로드
  for (let i = 0; i < global.situations.length; i++) {
    global.situations[i].img = loadImage(`assets/situations/${global.situations[i].id}.png`);
  }

  // 기타 효과 이미지 로드
  global.lightImg = loadImage("assets/light.png");
  global.grdImg = loadImage("assets/grd.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  global.centerX = width / 2;
  global.centerY = height / 2;

  // 배경 별 효과를 위한 초기 설정
  for (let i = 0; i < 50; i++) {
    global.stars.push({
      x: random(width),
      y: random(height),
      size: random(2, 5)
    });
  }

  // 블러 효과 등을 위한 별도 캔버스 설정
  // bgCanvas = document.getElementById('bg-canvas');
  // bgCanvas.width = width;
  // bgCanvas.height = height;

  GetRandomSituation();
}

function GetRandomSituation(){
  let allIndices = [0, 1, 2, 3, 4];

  // 3개의 상황을 중복 없이 랜덤으로 선택
  for (let i = 0; i < 3; i++) {
    let randomIndex = floor(random(allIndices.length)); // 소수점 제외
    let selected = allIndices.splice(randomIndex, 1)[0]; // splice 함수는 선택한 인덱스의 요소를 제거하고 반환한다. -> 따라서 중복 발생 없음
    global.selectedSituationIndices.push(selected);
  }
}

function draw() {
  // 마우스 움직임에 부드러운 효과 적용
  global.smoothX += (mouseX - global.smoothX) * 0.2;
  global.smoothY += (mouseY - global.smoothY) * 0.2;
  global.speed = mouseX - pmouseX;
  global.smoothSpeed += (global.speed - global.smoothSpeed) * 0.2;

  // 현재 상태(currentState)에 따라 적절한 그리기 함수를 호출합니다.
  switch (currentState.value) {
    case State.Home: Home(); break; // 메인 화면
    case State.ScanFace: ScanFace(); break; // 얼굴 인식 화면
    case State.Situation: Situation(); break; // 상황 제시 화면
    case State.CollectEmotion: RenderEmotionShard(); break; // 감정 조각 수집 화면
    case State.Report: Report(); break; // 리포트 화면
    case State.Credits: Credits(); break; // 크레딧 화면
  }

  // 메인 캔버스의 내용을 백그라운드 캔버스에 복사하여 블러 효과 등을 적용
  // const ctx = bgCanvas.getContext('2d');
  // ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  // ctx.drawImage(canvas, 0, 0, bgCanvas.width, bgCanvas.height);
}


// p5.js 전역 이벤트 리스너
function mousePressed() {
  // 현재 상태에 맞는 마우스 클릭 핸들러를 호출합니다.
  mousePressedHandler[currentState.value]?.();
}

function keyPressed() {
  // 'f' 키 등을 눌러 전체화면 모드로 전환
  if (key === 'f' || key === 'F') {
      fullscreen(!fullscreen());
  }
}


// 전역 스코프에 함수 등록
// HTML 파일에서 type="module"로 sketch.js를 로드할 때,
// p5.js가 이 함수들을 찾을 수 있도록 window 객체에 직접 할당합니다.
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mousePressed = mousePressed;
window.keyPressed = keyPressed;