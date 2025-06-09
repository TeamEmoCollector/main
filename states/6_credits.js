import { global } from '../globalStore.js';
import { setFontStyle } from './utils.js';

let creditAlpha = 0;

export function Credits() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  // 페이드인 효과
  if (creditAlpha < 255) {
    creditAlpha += 5;
  }

  textAlign(CENTER, CENTER);
  fill(255, 255, 255, creditAlpha);
 
  // 타이틀
  setFontStyle(700, 48);
  text("크레딧", global.centerX, global.centerY - 320);

  // 팀원 소감
  setFontStyle(500, 28);
  text("김동연: 자유 주제라 주제 선정부터 어려웠고 난이도 있는 주제를 선택해 힘들었지만, \n\n 팀원들과 함께하면서 많은 것을 배우고 성장할 수 있는 값진 경험이었다.", global.centerX, global.centerY-180);
  text("이원준: 다들 프로젝트에 최선을 다해서 잘 마무리할 수 있었던 것 같습니다.\n\n 중간중간 어려웠던 부분도 있었지만 재미있었습니다", global.centerX, global.centerY-60);
  text("조우영: 심미적이고 동적인 시작화면을 디자인하고 구현하는 데 많은 노력을 기울였는데, \n\n 기대한 만큼 결과물이 잘 나와 큰 성취감을 느낄 수 있었습니다.", global.centerX, global.centerY+60);

  // 구분선
  push();
  stroke(255, 255, 255, creditAlpha * 0.5);
  strokeWeight(2);
  line(global.centerX - 400, global.centerY + 140, global.centerX + 400, global.centerY + 140);
  pop();

  // 사용한 기술 섹션 
  push();
  fill(255, 220, 100, creditAlpha);
  setFontStyle(700, 32);
  text("🛠️ 사용한 기술", global.centerX, global.centerY + 180);
 
  fill(255, 255, 255, creditAlpha * 0.9);
  setFontStyle(400, 20);
 
  // 왼쪽 열
  textAlign(LEFT, CENTER);
  text("• p5.js: Canvas 렌더링, 애니메이션", global.centerX - 350, global.centerY + 220);
  text("• ml5.js: 실시간 얼굴 감정 인식", global.centerX - 350, global.centerY + 250);
  text("• Node.js + Express: 백엔드 서버", global.centerX - 350, global.centerY + 280);
  text("• MongoDB: 감정 데이터 저장", global.centerX - 350, global.centerY + 310);
 
  // 오른쪽 열
  text("• OpenAI GPT API: 개인화 리포트 생성", global.centerX + 50, global.centerY + 220);
  text("• ES6 Modules: 코드 모듈화", global.centerX + 50, global.centerY + 250);
  text("• Async/Await: 비동기 처리", global.centerX + 50, global.centerY + 280);
  text("• Railway: 서버 배포", global.centerX + 50, global.centerY + 310);
  pop();

  // AI 사용률 크게 표시
  push();
  fill(255, 100, 100, creditAlpha);
  setFontStyle(700, 36);
  textAlign(CENTER, CENTER);
  text("AI 사용률: 70%", global.centerX, global.centerY + 370);
 
  // AI 사용 설명
  fill(255, 255, 255, creditAlpha * 0.7);
  setFontStyle(300, 16);
  text("(둥근 모서리 클리핑, 감정 분석 보정, 서버 구축, GPT 연동 등)", global.centerX, global.centerY + 400);
  pop();

  // 터치하여 종료
  fill(255, 255, 255, creditAlpha * 0.7);
  setFontStyle(400, 20);
  text("터치하여 종료", global.centerX, height - 20);
}

export function pressedCredits() {
  creditAlpha = 0;
  canvas.remove();
}