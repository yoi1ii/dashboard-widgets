import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const LOG_COLLECTION = "clockLogs";

/* 오늘 날짜를 2026-07-13 형식으로 만들기 */
function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* 현재 시간을 08:30 형식으로 만들기 */
function getCurrentTimeText() {
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

/* 새 기록 저장 */
export async function addClockLog(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("기록 내용을 입력해 주세요.");
  }

  const now = new Date();

  await addDoc(collection(db, LOG_COLLECTION), {
    text: cleanText,
    dateKey: getTodayKey(),
    timeText: getCurrentTimeText(),

    /* 서버 기준 저장 시각 */
    createdAt: serverTimestamp(),

    /* 저장 직후 정렬할 때 사용할 임시 시각 */
    clientCreatedAt: now.getTime()
  });
}

/* 오늘 기록을 실시간으로 불러오기 */
export function subscribeTodayClockLogs(callback, errorCallback) {
  const todayQuery = query(
    collection(db, LOG_COLLECTION),
    where("dateKey", "==", getTodayKey())
  );

  const unsubscribe = onSnapshot(
    todayQuery,

    snapshot => {
      const logs = snapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      }));

      logs.sort((a, b) => {
        return (a.clientCreatedAt ?? 0) - (b.clientCreatedAt ?? 0);
      });

      callback(logs);
    },

    error => {
      console.error("기록을 불러오지 못했습니다.", error);

      if (errorCallback) {
        errorCallback(error);
      }
    }
  );

  return unsubscribe;
}

/* 기록 하나 삭제 */
export async function deleteClockLog(logId) {
  if (!logId) {
    throw new Error("삭제할 기록 ID가 없습니다.");
  }

  await deleteDoc(
    doc(db, LOG_COLLECTION, logId)
  );
}
