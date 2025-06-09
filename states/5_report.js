// ✅ 개선된 리포트 페이지 (report.js)
import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { setFontStyle } from './utils.js';

let isReportInitialized = false;
let reportText = "리포트를 생성 중입니다...";
let emotionPercentages = []; // 각 상황별 감정 퍼센트 저장

const emotionsMap = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];

// 감정 이름을 한글로 변환하는 헬퍼
const emotionKorean = {
  happy: "행복",
  sad: "슬픔",
  angry: "화남",
  surprised: "놀람",
  neutral: "중립",
  fearful: "두려움"
};

// 감정 결과 전송
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

// 감정 통계 가져오기
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
function CalculateEmotionRates(counts, emo) {
  const total = Object.values(counts).reduce((s, c) => s + c, 0);
  return total ? ((counts[emo] / total) * 100).toFixed(1) : 0;
}

// GPT 프롬프트 생성·전송 및 결과 저장
async function GeneratePersonalizedComment() {
  reportText = "리포트를 생성 중입니다...";
  emotionPercentages = [];

  let promptData = `당신은 사용자의 하루를 간결히 요약하고 긍정적인 피드백과 간단한 감정 관리 팁을 제공합니다. 다음은 사용자가 경험한 상황과 느낀 주요 감정입니다:\n\n`;

  for (let i = 0; i < 3; i++) {
    const idx = global.selectedSituationIndices[i];
    const sit = global.situations[idx];
    const emoName = emotionsMap[global.dominantEmotionIndicesPerSituation[i]];

    promptData += `- ${sit.title}: ${emoName}\n`;
    await SubmitExpressionResult(idx, emoName);

    const counts = await GetEmotionStats(idx);
    if (counts) {
      const pct = CalculateEmotionRates(counts, emoName);
      emotionPercentages.push({
        situationTitle: sit.title,
        emotion: emoName,
        emotionKr: emotionKorean[emoName],
        percentage: pct
      });
      promptData += `  (${sit.title} 감정통계: `;
      emotionsMap.forEach(e => {
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

//✅ Report 컴포넌트
export function Report() {
  if (!isReportInitialized) {
    GeneratePersonalizedComment();
    isReportInitialized = true;
  }
  RenderFinalComment();
}

function wrapText(str, maxChars) {
  const lines = [];
  let cur = '';
  str.split(' ').forEach(w => {
    if ((cur + w).length > maxChars) {
      lines.push(cur);
      cur = w + ' ';
    } else {
      cur += w + ' ';
    }
  });
  if (cur) lines.push(cur.trim());
  return lines;
}


export function pressedReport() {
  setState(State.Credits);
}

