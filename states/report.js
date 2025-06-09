
import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';

let isReportInitialized = false;
let reportText = "리포트를 생성 중입니다...";


async function fetchGptReport() {

  console.log("fetchGptReport 호출 시작...");
  reportText = "리포트를 생성 중입니다...";

  let promptData = `당신은 사용자의 하루를 간결히 요약하고 긍정적인 피드백과 간단한 감정 관리 팁을 제공합니다. 다음은 사용자가 경험한 상황과 느낀 주요 감정입니다:\n\n`;

  const emotionsMap = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];

  for (let i = 0; i < 3; i++) {
    const situationIndex = global.selectedSituationIndices[i];
    const situation = global.situations[situationIndex];
    const emotionIndex = global.dominantEmotionIndicesPerSituation[i];
    const emotionName = emotionsMap[emotionIndex];

    promptData += `- ${situation.title}: ${emotionName}\n`;
  }

  promptData += "\n위 정보를 바탕으로 사용자의 하루를 3문장 이내로 간략히 요약하고, 긍정적이고 따뜻한 피드백과 함께 간단한 감정 관리 팁을 제공해주세요. 총 100자 내외로 작성해주세요.";



  try {
     const response = await fetch(
      "https://servertest-production-6454.up.railway.app/api/gpt/", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: promptData
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API 호출 오류:", errorData);
      reportText = `리포트 생성에 실패했습니다. (오류: ${errorData.error ? errorData.error.message : response.statusText})`;
    } else {
      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        reportText = data.choices[0].message.content.trim();
      } else {
        console.error("API 응답 데이터 형식 오류:", data);
        reportText = "리포트 내용을 받아오지 못했습니다.";
      }
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

  setFontStyle(500, 24);
  const lines = wrapText(reportText, 35);
  let yPos = global.centerY - 100;
  const lineHeight = 30;

  for (let line of lines) {
    text(line, global.centerX, yPos);
    yPos += lineHeight;
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