// State Management & LocalStorage Persistence
import { calculateFootprint, getBaselineInputs } from "./calculator.js";
import { REDUCTION_ACTIONS, DAILY_HABITS } from "./actions.js";

const STATE_KEY = "ecosphere_user_state";

// Level Configurations
export const LEVEL_THRESHOLDS = [
  { level: 1, name: "Sprout", minPoints: 0 },
  { level: 2, name: "Sapling", minPoints: 100 },
  { level: 3, name: "Pine", minPoints: 250 },
  { level: 4, name: "Oak", minPoints: 500 },
  { level: 5, name: "Redwood", minPoints: 1000 },
  { level: 6, name: "Eco-Champion", minPoints: 2000 }
];

// Available Badges
export const BADGES_REGISTRY = [
  { id: "badge_first_calc", name: "First Steps", desc: "Completed your first footprint calculation.", icon: "👣" },
  { id: "badge_action_seeker", name: "Action Seeker", desc: "Adopted your first carbon-reduction task.", icon: "🌱" },
  { id: "badge_action_master", name: "Action Master", desc: "Completed your first adopted task.", icon: "🏆" },
  { id: "badge_habit_starter", name: "Habit Starter", desc: "Logged your first eco-habit.", icon: "📅" },
  { id: "badge_habit_streaker", name: "Eco Streaker", desc: "Logged 5 daily habits.", icon: "🔥" },
  { id: "badge_carbon_cutter", name: "Carbon Cutter", desc: "Reduced emissions by 500kg CO2e or more.", icon: "✂️" },
  { id: "badge_green_guru", name: "Green Guru", desc: "Reached Level 4 (Oak).", icon: "🧙‍♂️" }
];

let state = {
  calculatorInputs: null,
  footprintBreakdown: { transport: 0, energy: 0, food: 0, lifestyle: 0, total: 0 },
  adoptedActions: [],  // array of action IDs
  completedActions: [], // array of action IDs
  loggedHabits: [],    // array of objects: { id: string, date: string }
  points: 0,
  badges: []           // array of badge IDs
};

/**
 * Initializes state from LocalStorage or baseline settings
 */
export function initializeState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) {
      state = JSON.parse(raw);
      
      // Safety checks for older formats
      if (!state.adoptedActions) state.adoptedActions = [];
      if (!state.completedActions) state.completedActions = [];
      if (!state.loggedHabits) state.loggedHabits = [];
      if (!state.badges) state.badges = [];
      if (typeof state.points !== "number") state.points = 0;
      
      // Recalculate footprint just in case
      if (state.calculatorInputs) {
        state.footprintBreakdown = calculateFootprint(state.calculatorInputs);
      }
    } else {
      resetToDefaults();
    }
  } catch (e) {
    console.error("Failed to load state from localStorage, initializing defaults:", e);
    resetToDefaults();
  }
  return state;
}

/**
 * Resets state to baseline settings and default calculator values
 */
export function resetToDefaults() {
  state = {
    calculatorInputs: getBaselineInputs(),
    footprintBreakdown: calculateFootprint(getBaselineInputs()),
    adoptedActions: [],
    completedActions: [],
    loggedHabits: [],
    points: 0,
    badges: []
  };
  saveState();
  notifyStateUpdated();
}

/**
 * Saves current state to LocalStorage
 */
export function saveState() {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state to localStorage:", e);
  }
}

/**
 * Dispatches a global event when the state changes
 */
function notifyStateUpdated() {
  const event = new CustomEvent("ecosphereStateUpdate", { detail: state });
  document.dispatchEvent(event);
}

/**
 * Gets the current raw state object (read-only helper)
 */
export function getState() {
  return state;
}

/**
 * Updates the user's questionnaire inputs and recalculates carbon values
 * @param {Object} inputs 
 */
export function updateCalculator(inputs) {
  state.calculatorInputs = { ...state.calculatorInputs, ...inputs };
  state.footprintBreakdown = calculateFootprint(state.calculatorInputs);
  
  // Award first calculation badge
  awardBadge("badge_first_calc");
  
  saveState();
  notifyStateUpdated();
}

/**
 * Adopts a carbon-saving action task
 * @param {string} actionId 
 */
export function adoptAction(actionId) {
  if (state.completedActions.includes(actionId)) return; // Already finished
  if (!state.adoptedActions.includes(actionId)) {
    state.adoptedActions.push(actionId);
    
    // Award badge
    awardBadge("badge_action_seeker");
    
    saveState();
    notifyStateUpdated();
  }
}

/**
 * Cancels adoption of a task
 * @param {string} actionId 
 */
export function cancelAction(actionId) {
  const index = state.adoptedActions.indexOf(actionId);
  if (index > -1) {
    state.adoptedActions.splice(index, 1);
    saveState();
    notifyStateUpdated();
  }
}

/**
 * Completes an adopted action task, awarding points and evaluating badges
 * @param {string} actionId 
 */
export function completeAction(actionId) {
  const adoptIndex = state.adoptedActions.indexOf(actionId);
  if (adoptIndex > -1) {
    state.adoptedActions.splice(adoptIndex, 1);
  }
  
  if (!state.completedActions.includes(actionId)) {
    state.completedActions.push(actionId);
    
    // Find the action reward points
    const actionObj = REDUCTION_ACTIONS.find(a => a.id === actionId);
    if (actionObj) {
      addPoints(actionObj.points);
    }
    
    // Evaluate badges
    awardBadge("badge_action_master");
    
    // Check total savings badge
    const totalReduction = state.completedActions.reduce((sum, id) => {
      const act = REDUCTION_ACTIONS.find(a => a.id === id);
      return sum + (act ? act.offsetValue : 0);
    }, 0);
    
    if (totalReduction >= 500) {
      awardBadge("badge_carbon_cutter");
    }
    
    saveState();
    notifyStateUpdated();
  }
}

/**
 * Logs a daily green habit, awarding points and evaluating badges
 * @param {string} habitId 
 * @param {string} dateStr - e.g. '2026-06-14'
 */
export function logHabit(habitId, dateStr) {
  // Prevent logging the same habit on the exact same date twice
  const alreadyLogged = state.loggedHabits.some(h => h.id === habitId && h.date === dateStr);
  if (alreadyLogged) return false;

  state.loggedHabits.push({ id: habitId, date: dateStr });
  
  const habitObj = DAILY_HABITS.find(h => h.id === habitId);
  if (habitObj) {
    addPoints(habitObj.points);
  }

  // Badges check
  awardBadge("badge_habit_starter");
  if (state.loggedHabits.length >= 5) {
    awardBadge("badge_habit_streaker");
  }

  saveState();
  notifyStateUpdated();
  return true;
}

/**
 * Helper to add points and handle level-up badges
 * @param {number} amt 
 */
export function addPoints(amt) {
  state.points += amt;
  const currentLvl = getLevelDetails().level;
  if (currentLvl >= 4) {
    awardBadge("badge_green_guru");
  }
}

/**
 * Awards a badge if it isn't already unlocked
 * @param {string} badgeId 
 */
export function awardBadge(badgeId) {
  if (!state.badges.includes(badgeId)) {
    state.badges.push(badgeId);
    // Visual notifications will be handled by the UI using event hooks
    return true;
  }
  return false;
}

/**
 * Returns user level details: current level, level title, min/max points, percent progress
 */
export function getLevelDetails() {
  const points = state.points;
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (points >= LEVEL_THRESHOLDS[i].minPoints) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
    } else {
      break;
    }
  }

  if (!nextLevel) {
    // Max level reached
    return {
      level: currentLevel.level,
      name: currentLevel.name,
      points: points,
      minPoints: currentLevel.minPoints,
      nextLevelPoints: currentLevel.minPoints,
      percent: 100
    };
  }

  const range = nextLevel.minPoints - currentLevel.minPoints;
  const progress = points - currentLevel.minPoints;
  const pct = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    points: points,
    minPoints: currentLevel.minPoints,
    nextLevelPoints: nextLevel.minPoints,
    percent: pct
  };
}
