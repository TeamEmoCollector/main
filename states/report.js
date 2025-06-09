// ✅ 개선된 리포트 페이지 (report.js)
import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';

let isReportInitialized = false;
let reportText = "리포트를 생성 중입니다...";
let emotionPercentages = []; // 각 상황별 감정 퍼센트 저장

const emotionsMap = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];

// 감정 이름을 한글로 변환하는 헬퍼 함수
const emotionKorean = {
  happy: "행복",
  sad: "슬픔",
  angry: "화남",
  surprised: "놀람",
  neutral: "중립",
  fearful: "두려움"
};

async function recordEmotionCount(index, emotion) {
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

// 감정 퍼센트 계산 함수
function calculateEmotionPercentage(emotionCounts, targetEmotion) {
  const total = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0);
  if (total === 0) return 0;
  return ((emotionCounts[targetEmotion] / total) * 100).toFixed(1);
}

async function fetchGptReport() {
  console.log("fetchGptReport 호출 시작...");
  reportText = "리포트를 생성 중입니다...";
  emotionPercentages = []; // 초기화

  let promptData = `당신은 사용자의 하루를 간결히 요약하고 긍정적인 피드백과 간단한 감정 관리 팁을 제공합니다. 다음은 사용자가 경험한 상황과 느낀 주요 감정입니다:\n\n`;

  for (let i = 0; i < 3; i++) {
    const situationIndex = global.selectedSituationIndices[i];
    const situation = global.situations[situationIndex];
    const emotionIndex = global.dominantEmotionIndicesPerSituation[i];
    const emotionName = emotionsMap[emotionIndex];

    promptData += `- ${situation.title}: ${emotionName}\n`;

    // 👉 감정 카운트 저장
    await recordEmotionCount(situationIndex, emotionName);

    // 👉 감정 통계 가져오기 및 퍼센트 계산
    try {
      const statsRes = await fetch(`https://servertest-production-6454.up.railway.app/api/emotion/stats?index=${situationIndex}`);
      const statsData = await statsRes.json();
      
      if (statsData && statsData.emotionCounts) {
        const percentage = calculateEmotionPercentage(statsData.emotionCounts, emotionName);
        
        // 퍼센트 정보 저장
        emotionPercentages.push({
          situationTitle: situation.title,
          emotion: emotionName,
          emotionKr: emotionKorean[emotionName],
          percentage: percentage
        });
        
        // GPT 프롬프트에도 통계 추가
        const counts = statsData.emotionCounts;
        promptData += `  (${situation.title}에 대한 감정 통계: `;
        for (const emotion of emotionsMap) {
          promptData += `${emotion}: ${counts[emotion] ?? 0}, `;
        }
        promptData = promptData.slice(0, -2);
        promptData += `)\n`;
      }
    } catch (err) {
      console.warn(`감정 통계 가져오기 실패 (index=${situationIndex}):`, err);
    }
  }

  promptData += "\n위 정보를 바탕으로 사용자의 하루를 3문장 이내로 간략히 요약하고, 긍정적이고 따뜻한 피드백과 함께 간단한 감정 관리 팁을 제공해주세요. 총 100자 내외로 작성해주세요.";

  try {
    const response = await fetch("https://servertest-production-6454.up.railway.app/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptData })
    });

    const data = await response.json();
    if (data.content) {
      reportText = data.content.trim();
    } else {
      reportText = "리포트 내용을 받아오지 못했습니다.";
    }
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    reportText = "리포트 생성 중 네트워크 오류가 발생했습니다.";
  }
}

export function Report() {
  if (!isReportInitialized) {
    reportText = "리포트를 생성 중입니다...";
    fetchGptReport();
    isReportInitialized = true; 
  }

  imageMode(CORNER);
  image(global.grdImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  setFontStyle(700, 48);
  text("리포트", global.centerX, global.centerY - 280);

  // GPT 리포트 텍스트 표시
  setFontStyle(500, 24);
  const lines = wrapText(reportText, 35);
  let yPos = global.centerY - 150;
  const lineHeight = 30;

  for (let line of lines) {
    text(line, global.centerX, yPos);
    yPos += lineHeight;
  }

  // 감정 퍼센트 정보 표시
  if (emotionPercentages.length > 0) {
    yPos += 20; // 여백 추가
    
    setFontStyle(700, 28);
    text("📊 감정 통계 분석", global.centerX, yPos);
    yPos += 40;
    
    setFontStyle(400, 20);
    for (let data of emotionPercentages) {
      const statText = `"${data.situationTitle.substring(0, 15)}..."에서`;
      text(statText, global.centerX, yPos);
      yPos += 25;
      
      setFontStyle(600, 22);
      fill(255, 220, 100); // 노란색으로 강조
      text(`${data.emotionKr} 감정은 전체의 ${data.percentage}%입니다`, global.centerX, yPos);
      fill(255); // 다시 흰색으로
      yPos += 35;
      
      setFontStyle(400, 20);
    }
  }

  setFontStyle(500, 20);
  text("터치하여 크레딧 보기", global.centerX, height - 50);
}

export function pressedReport() {
  setState(State.Credits);
}

function wrapText(str, maxCharsPerLine) {
  const lines = [];
  let currentLine = '';

  for (let word of str.split(' ')) {
    if ((currentLine + word).length > maxCharsPerLine) {
      lines.push(currentLine);
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine.length > 0) lines.push(currentLine.trim());
  return lines;
}