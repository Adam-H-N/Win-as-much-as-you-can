import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getDatabase, ref, onValue, set, update 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDC-tAqvjlyHEiBXi6J9_y45vG4-8rF8H0",
  authDomain: "win-as-much-as-you-can-e27d9.firebaseapp.com",
  projectId: "win-as-much-as-you-can-e27d9",
  storageBucket: "win-as-much-as-you-can-e27d9.firebasestorage.app",
  messagingSenderId: "474597658335",
  appId: "1:474597658335:web:bbc1904084acc37b0ce36a",
  databaseURL: "https://win-as-much-as-you-can-e27d9-default-rtdb.firebaseio.com" // Adjust if regional DB
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

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

// Initial Game State Schema
export const DEFAULT_STATE = {
  phase: 'lobby', // 'lobby' | 'choosing' | 'revealed'
  round: 1,
  locked: { red: false, blue: false, yellow: false, green: false },
  choices: { red: null, blue: null, yellow: null, green: null },
  bal: { red: 0, blue: 0, yellow: 0, green: 0 },
  history: [],
  total: 0
};

// Calculate payoff matrix based on choices
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

// Subscribe to state updates in Realtime DB
export function listenState(callback) {
  const stateRef = ref(db, 'gameState');
  onValue(stateRef, (snapshot) => {
    const val = snapshot.val();
    if (!val) {
      set(stateRef, DEFAULT_STATE);
    } else {
      callback(val);
    }
  });
}