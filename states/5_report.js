import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { setFontStyle } from './utils.js';

let isReportInitialized = false;
let reportText = "리포트를 생성 중입니다..."; // 리포트 텍스트
let emotionPercentages = []; // 각 상황별 감정 퍼센트 저장

// 감정 이름을 한글로 변환
const emotionKorean = {
  happy: "행복",
  sad: "슬픔",
  angry: "화남",
  surprised: "놀람",
  neutral: "중립",
  fearful: "두려움"
};

// AI 사용
// 감정 결과 전송
// AI 사용해서 서버에 상황이랑 느낀 감정 저장 요청함.
async function SubmitExpressionResult(index, emotion) {
  try {
    await fetch("https://servertest-production-6454.up.railway.app/api/emotion/increment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, emotion })
    });
  } catch (error) {
    console.error(`감정 저장 실패: index=${index}, emotion=${emotion}`, error);
  }
}

// AI 사용
// 감정 통계 가져오기
// AI 사용해서 서버에 상황 인덱스를 보내서 json 형태로 통계 가져와 달라고 
// 부탁했습니다.
async function GetEmotionStats(situationIndex) {
  try {
    const res = await fetch(
      `https://servertest-production-6454.up.railway.app/api/emotion/stats?index=${situationIndex}`
    );
    const { emotionCounts } = await res.json();
    return emotionCounts || null;
  } catch (err) {
    console.warn(`GetEmotionStats 실패 (index=${situationIndex}):`, err);
    return null;
  }
}

// 감정 퍼센트 계산
// emo : 느낀 감정, counts : 전체 감정 갯수들 저장
function CalculateEmotionRates(emo, counts) {
  // 전체 합 구하기
  let total = 0;
  for (const key in counts) {
    total += counts[key];
  }

  // 3) 비율 계산 (숫자로)
  const raw = (counts[emo] / total) * 100;

  // 4) 소수점 첫째 자리까지 반올림한 숫자로 반환
  return Math.round(raw * 10) / 10;
}

// AI 사용
// GPT 프롬프트 생성·전송 및 결과 저장
// 어떤 형식으로 프롬프트를 작성하면 좋을지 물어봤으며
// OPEN API KEY가 클라이언트에 있으면 위험하기 때문에 
// AI를 사용해서 서버도 배포하였습니다
async function GeneratePersonalizedComment() {
  emotionPercentages = [];

  let promptData = `당신은 사용자의 하루를 간결히 요약하고 긍정적인 피드백과 간단한 감정 관리 팁을 제공합니다. 다음은 사용자가 경험한 상황과 느낀 주요 감정입니다:\n\n`;

  for (let i = 0; i < 3; i++) {
    const idx = global.selectedSituationIndices[i];
    const sit = global.situations[idx];
    const emoName = global.emotions[global.dominantEmotionIndicesPerSituation[i]];

    promptData += `- ${sit.title}: ${emoName}\n`;
    await SubmitExpressionResult(idx, emoName);

    const counts = await GetEmotionStats(idx);
    if (counts) {
      const pct = CalculateEmotionRates(emoName, counts);
      
      emotionPercentages.push({
        situationTitle: sit.title,
        emotion: emoName,
        emotionKr: emotionKorean[emoName],
        percentage: pct
      });
      promptData += `  (${sit.title} 감정통계: `;
      global.emotions.forEach(e => {
        promptData += `${e}:${counts[e] ?? 0}, `;
      });
      promptData = promptData.slice(0, -2) + `)\n`;
    }
  }

  promptData += `\n위 정보를 바탕으로 사용자의 하루를 3문장 이내로 간략히 요약하고, 긍정적이고 따뜻한 피드백과 함께 간단한 감정 관리 팁을 제공해주세요. 총 100자 내외로 작성해주세요.`;

  try {
    const res = await fetch("https://servertest-production-6454.up.railway.app/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptData })
    });
    const { content } = await res.json();
    reportText = content?.trim() || "리포트 내용을 받아오지 못했습니다.";
  } catch (err) {
    console.error("GPT 요청 실패:", err);
    reportText = "리포트 생성 중 네트워크 오류가 발생했습니다.";
  }
}

// 화면에 최종 결과 렌더링
// api들을 사용해서 최종적으로 출력하는 부분
function RenderFinalComment() {
  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  setFontStyle(700, 48);
  text("리포트", global.centerX, global.centerY - 280);

  setFontStyle(500, 24);
  const lines = wrapText(reportText, 35);

  let y = global.centerY - 150;
  lines.forEach(line => {
    text(line, global.centerX, y);
    y += 30;
  });

  if (emotionPercentages.length) {
    y += 20;
    setFontStyle(700, 28);
    text("📊 감정 통계 분석", global.centerX, y);
    y += 40;
    emotionPercentages.forEach(data => {
      setFontStyle(400, 20);
      text(`"${data.situationTitle.substring(0,15)}..."에서`, global.centerX, y);
      y += 25;
      setFontStyle(600, 22);
      fill(255,220,100);
      text(`${data.emotionKr} 감정은 전체의 ${data.percentage}%입니다`, global.centerX, y);
      fill(255);
      y += 35;
    });
  }

  setFontStyle(500, 20);
  text("터치하여 크레딧 보기", global.centerX, height - 50);
}

// 처음 들어오면 프롬프트 요청
export function Report() {
  if (!isReportInitialized) {
    GeneratePersonalizedComment();
    isReportInitialized = true;
  }
  RenderFinalComment();
}

// str을 maxChars 마다 줄 바꿔주는 함수
function wrapText(str, maxChars) {
  const lines = [];
  for (let i = 0; i < str.length; i += maxChars) {
    // 문자열을 maxChars만큼 잘라서 붙이고 lines에 넣기
    lines.push(str.slice(i, i + maxChars));
  }
  return lines;
}



export function pressedReport() {
  setState(State.Credits);
}

