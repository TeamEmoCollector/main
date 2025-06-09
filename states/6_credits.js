import { global } from '../globalStore.js';
import { setFontStyle } from './utils.js';

export function Credits() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  setFontStyle(700, 48);
  text("크레딧", global.centerX, global.centerY - 280);

  setFontStyle(500, 36);
  text("김동연: 자유 주제라 주제 선정부터 어려웠고 난이도 있는 주제를 선택해 힘들었지만, \n\n\n 팀원들과 함께하면서 많은 것을 배우고 성장할 수 있는 값진 경험이었다.", global.centerX, global.centerY-100);
  text("이원준: 처음 ml5를 접하고 관련 자료를 찾아보다가 감정을 인식할 수 있다는 사실을 통해 \n\n\n 주제를 선정하였고 팀원들과 재미있는 프로젝트를 진행한 것 같습니다.", global.centerX, global.centerY);
  text("조우영: 심미적이고 동적인 시작화면을 디자인하고 구현하는 데 많은 노력을 기울였는데, \n\n\n 기대한 만큼 결과물이 잘 나와 큰 성취감을 느낄 수 있었습니다. \n\n\n또한 팀원들과의 활발한 소통이 프로젝트를 원활하게 이끌어가는 데 큰 도움이 되었기에 \n\n\n 협업에선 소통이 무엇보다 중요하단 점을 깨달았습니다.", global.centerX, global.centerY+160);

  text("터치하여 종료", global.centerX, height - 50);
}

export function pressedCredits() {
  canvas.remove();
}