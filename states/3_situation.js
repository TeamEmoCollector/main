import { State, setState } from '../stateManager.js';
import { global } from '../globalStore.js';
import { drawStarMousePointer, setFontStyle } from './utils.js';

let emotions = ["happy", "sad", "angry", "surprised", "neutral", "fearful"];

let isSituationInitialized = false; // Situation 상태의 자체 초기화 플래그

let camWidth = 250;
let camHeight = 180;

let startMillis = 0;
const situationDurationMillis = 7000;
let currentSituation = 0;

let emotionSums = {};      // 각 감정의 점수 합계를 저장할 객체
let emotionCounts = {};    // 각 감정이 몇 번 감지되었는지 횟수를 저장할 객체

  export function Situation() {
    if (!isSituationInitialized) {
      isSituationInitialized = true;
      currentSituation = global.situations[global.selectedSituationIndices[global.currentSituationIndex]];
      startMillis = millis();
      global.detections = [];
    
      for (const emotion of emotions) {
        emotionSums[emotion] = 0;
        emotionCounts[emotion] = 0;
      }
    }

    imageMode(CORNER);
    image(global.grdImg, 0, 0, width, height);


    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);

    setFontStyle(700, 48);
    text(`상황 ${global.currentSituationIndex + 1}/3`, global.centerX - 700, global.centerY - 400);

    setFontStyle(500, 28);
    text(currentSituation.title, global.centerX, global.centerY + 300);

    setFontStyle(500, 24);
    text("이때, 느껴지는 당신의 감정을 표정으로 나타내주세요.", global.centerX, global.centerY + 340);

    imageMode(CENTER);
    image(currentSituation.img, global.centerX, global.centerY - 20, 800, 500);

    // AI 사용
    // 실시간 표정 분석 결과 표시 및 감정 데이터 누적
    // 실시간으로 표정이 어떤 감정을 표출하고 있는지 시각적으로 확인했으면 좋을거 같아
    // AI에게 인식률을 표현하게 부탁했습니다.
    textAlign(LEFT, CENTER);
    if (global.detections && global.detections.length > 0 && global.detections[0].expressions) {
      const currentExpressions = global.detections[0].expressions;
      
      // 실시간 UI 표시용 주요 감정
      const currentDominantEmotion = getDominantEmotion(currentExpressions);
      setFontStyle(700, 28);
      text(
          `${currentDominantEmotion.name} (인식률: ${Math.round(currentDominantEmotion.score * 100)}%)`,
          global.centerX + 520,
          global.centerY - 180
      );
      
      // 감정 데이터 누적
      for (const emotion of emotions) {
        if (currentExpressions[emotion] !== undefined) {
          emotionSums[emotion] += currentExpressions[emotion];
          emotionCounts[emotion]++;
        }
      }
    }

    textAlign(RIGHT, CENTER);
    setFontStyle(700, 28);
    text(`${(situationDurationMillis / 1000) - floor((millis() - startMillis) / 1000)}초`, width - 80, height - 50);

    
    // AI 사용
    // 캠을 보여주는 곳
    // 사각진 것이 아닌 둥근 사각형으로 출력하고 싶어 AI에게 부탁했습니다.
    if (global.capture) { 
      push();
      imageMode(CENTER);
      translate(width - (camWidth / 2) - 40, (camHeight / 2) + 40);
      scale(-1, 1);

      const w = camWidth;
      const h = camHeight;
      const r = 20;

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
      pop();
    }

    if (millis() - startMillis > situationDurationMillis) {
      moveToCollectEmotion();
    }

    drawStarMousePointer();
  }


  function moveToCollectEmotion() {
    const overallDominantResult = CaptureExpression(emotionSums, emotionCounts, emotions); //최종 감정 1개 반환
    const dominantEmotionName = overallDominantResult.name;
    const dominantEmotionScore = overallDominantResult.score;

    const emotionArrayIndex = emotions.indexOf(dominantEmotionName);

    if (emotionArrayIndex !== -1) {
      global.dominantEmotionIndicesPerSituation[global.currentSituationIndex] = emotionArrayIndex;
      console.log(`상황 ${global.currentSituationIndex} (${currentSituation.title}): 전체 주요 감정 '${dominantEmotionName}' (평균 점수 ${dominantEmotionScore.toFixed(2)}, 인덱스 ${emotionArrayIndex}) 저장됨`);
    } else {
      global.dominantEmotionIndicesPerSituation[global.currentSituationIndex] = null;
      console.log(`상황 ${global.currentSituationIndex} (${currentSituation.title}): 전체 주요 감정을 결정할 수 없음 (저장 안됨)`);
    }

    isSituationInitialized = false;
    startMillis = 0;               

    global.currentSituationIndex++;

    setState(State.CollectEmotion);
  }


// 주어진 표정 객체에서 가장 높은 점수를 가진 감정을 찾는 함수
// 감정들을 돌며 가장 큰 점수를 가진 감정의 이름과 점수 반환
function getDominantEmotion(expressions) {
    let dominantEmotionName = "neutral"; // 기본값
    let maxScore = 0;

    if (expressions) {
        for (const emotion of emotions) {
            if (expressions[emotion] !== undefined && expressions[emotion] > maxScore) {
                maxScore = expressions[emotion];
                dominantEmotionName = emotion;
            }
        }
    }
    return { name: dominantEmotionName, score: maxScore };
}

// AI 사용
// 누적된 데이터를 바탕으로 전체적인 주요 감정 결정
// AI한테 무표정이 너무 잘 나와서 다른 감정이 조금이라도 느껴지면
// 그 감정으로 선택할 수 있게 보정해달라고 요청했습니다.
function CaptureExpression(sums, counts, emotionsArray, threshold = 0.05) {
  let highestNonNeutralAvgScore = 0;
  let dominantNonNeutralEmotion = null; // 가장 높은 비-neutral 감정 이름
  let nonNeutralDetected = false;      // 비-neutral 감정이 기준치 이상으로 감지되었는지 여부

  // 각 감정의 평균 점수 계산 및 비-neutral 감정 중 최고점 찾기
  for (const emotion of emotionsArray) {
    if (counts[emotion] && counts[emotion] > 0) {
      const averageScore = sums[emotion] / counts[emotion];

      if (emotion !== "neutral") {
        if (averageScore >= threshold) { // 기준치 이상일 때만 유의미한 감정으로 간주
          nonNeutralDetected = true;
          if (averageScore > highestNonNeutralAvgScore) {
            highestNonNeutralAvgScore = averageScore;
            dominantNonNeutralEmotion = emotion;
          }
        }
      }
    }
  }
  // 최종 주요 감정 결정
  if (nonNeutralDetected && dominantNonNeutralEmotion) {
    // 기준치 이상의 비-neutral 감정이 하나라도 있었다면, 그 중 가장 높은 평균을 가진 감정 반환
    return { name: dominantNonNeutralEmotion, score: highestNonNeutralAvgScore };
  } else {
    // 어떤 비-neutral 감정도 기준치 이상으로 감지되지 않았다면 neutral 반환
    const neutralAverageScore = (counts["neutral"] && counts["neutral"] > 0) ? (sums["neutral"] / counts["neutral"]) : 0;
    return { name: "neutral", score: neutralAverageScore };
  }
}