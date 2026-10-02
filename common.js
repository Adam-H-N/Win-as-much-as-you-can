import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getDatabase, ref, onValue, set, update 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const RTDB_URL = "https://win-as-much-as-you-can-e27d9-default-rtdb.asia-southeast1.firebasedatabase.app";

const firebaseConfig = {
  apiKey: "AIzaSyDC-tAqvjlyHEiBXi6J9_y45vG4-8rF8H0",
  authDomain: "win-as-much-as-you-can-e27d9.firebaseapp.com",
  projectId: "win-as-much-as-you-can-e27d9",
  storageBucket: "win-as-much-as-you-can-e27d9.firebasestorage.app",
  messagingSenderId: "474597658335",
  appId: "1:474597658335:web:bbc1904084acc37b0ce36a",
  databaseURL: RTDB_URL
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app, RTDB_URL);

export const TEAMS = [
  { id: 'red', name: 'Red' },
  { id: 'blue', name: 'Blue' },
  { id: 'yellow', name: 'Yellow' },
  { id: 'green', name: 'Green' }
];

export const MULT = { 5: 3, 8: 5, 10: 10 };

export const $ = s => document.querySelector(s);
export const fmt = n => n > 0 ? '+' + n : '' + n;
export const cls = n => n > 0 ? 'pos' : n < 0 ? 'neg' : '';
export const bonus = r => MULT[r] ? `<span class="chip bonus">BONUS ×${MULT[r]}</span>` : '';

export const DEFAULT_STATE = {
  phase: 'lobby',
  round: 1,
  locked: { red: false, blue: false, yellow: false, green: false },
  choices: { red: null, blue: null, yellow: null, green: null },
  bal: { red: 0, blue: 0, yellow: 0, green: 0 },
  history: [],
  total: 0
};

export function getStageInfo(round) {
  if (round <= 4) {
    return { stage: 1, name: 'Stage 1: Building Basics', range: 'Rounds 1–4' };
  } else if (round === 5) {
    return { stage: 2, name: 'Stage 2: First Pivot (×3)', range: 'Round 5' };
  } else if (round <= 7) {
    return { stage: 3, name: 'Stage 3: Escalation', range: 'Rounds 6–7' };
  } else {
    return { stage: 4, name: 'Stage 4: Final Sprint (×5 & ×10)', range: 'Rounds 8–10' };
  }
}

export function renderStageBar(round) {
  const info = getStageInfo(round || 1);
  return `
    <div class="stage-container">
      <div class="stage-header">
        <span class="stage-badge stage-${info.stage}">STAGE ${info.stage}</span>
        <span class="stage-title">${info.name}</span>
      </div>
      <div class="stage-stepper">
        <div class="step ${info.stage >= 1 ? 'active' : ''}">1</div>
        <div class="step-line ${info.stage > 1 ? 'active' : ''}"></div>
        <div class="step ${info.stage >= 2 ? 'active' : ''}">2</div>
        <div class="step-line ${info.stage > 2 ? 'active' : ''}"></div>
        <div class="step ${info.stage >= 3 ? 'active' : ''}">3</div>
        <div class="step-line ${info.stage > 3 ? 'active' : ''}"></div>
        <div class="step ${info.stage >= 4 ? 'active' : ''}">4</div>
      </div>
    </div>`;
}

export function calculatePayoff(choices, round) {
  const mult = MULT[round] || 1;
  const countX = Object.values(choices).filter(c => c === 'X').length;
  const countY = 4 - countX;

  let basePay = { X: 0, Y: 0 };
  if (countX === 4) { basePay = { X: -1, Y: 0 }; }
  else if (countX === 3) { basePay = { X: 1, Y: -3 }; }
  else if (countX === 2) { basePay = { X: 2, Y: -2 }; }
  else if (countX === 1) { basePay = { X: 3, Y: -1 }; }
  else if (countY === 4) { basePay = { X: 0, Y: 1 }; }

  const pay = {};
  for (const t of TEAMS) {
    const choice = choices[t.id];
    pay[t.id] = (choice ? basePay[choice] : 0) * mult;
  }
  return { pay, countX };
}

export function listenState(callback) {
  const stateRef = ref(db, 'gameState');
  onValue(stateRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      set(stateRef, DEFAULT_STATE);
    } else {
      callback(val);
    }
  }, (error) => {
    console.error("Firebase Read Error:", error);
  });
}
