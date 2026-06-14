// Node environment polyfills for headless testing
if (typeof globalThis.localStorage === "undefined") {
  const store = {};
  globalThis.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k in store) delete store[k]; }
  };
}

if (typeof globalThis.document === "undefined") {
  globalThis.document = {
    dispatchEvent: () => {}
  };
}

import { describe, test, assertEquals, assert } from "./test-runner.js";
import { 
  initializeState, 
  getState, 
  updateCalculator, 
  adoptAction, 
  cancelAction, 
  completeAction, 
  logHabit, 
  getLevelDetails, 
  resetToDefaults
} from "../src/js/state.js";

export function runStateTests() {
  describe("State Management and Gamification System", () => {
    
    test("should initialize state and calculate baseline correctly", () => {
      resetToDefaults();
      const state = getState();
      
      assert(state.calculatorInputs !== null, "Inputs should not be null");
      assertEquals(state.points, 0, "Initial points should be 0");
      assertEquals(state.badges.length, 0, "Should have 0 initial badges");
    });

    test("should update footprint on calculator changes and unlock First Steps badge", () => {
      resetToDefaults();
      
      updateCalculator({
        carKmPerWeek: 10,
        carFuelType: "electric",
        dietType: "vegan"
      });
      
      const state = getState();
      
      assertEquals(state.calculatorInputs.carFuelType, "electric", "Fuel type updated");
      assertEquals(state.calculatorInputs.dietType, "vegan", "Diet type updated");
      assert(state.badges.includes("badge_first_calc"), "Unlocked calculation badge");
    });

    test("should adopt and complete action tasks with correct points and badge awards", () => {
      resetToDefaults();
      
      // Let's adopt a task
      adoptAction("led_lights"); // worth 50 points
      let state = getState();
      assert(state.adoptedActions.includes("led_lights"), "Action adopted");
      assert(state.badges.includes("badge_action_seeker"), "Action seeker badge awarded");
      
      // Let's complete the task
      completeAction("led_lights");
      state = getState();
      assert(!state.adoptedActions.includes("led_lights"), "Removed from adopted list");
      assert(state.completedActions.includes("led_lights"), "Added to completed list");
      assertEquals(state.points, 50, "Earned 50 points from completed action");
      assert(state.badges.includes("badge_action_master"), "Action master badge awarded");
    });

    test("should prevent duplicate logging of the same habit on the same date", () => {
      resetToDefaults();
      
      const success1 = logHabit("habit_veg_meal", "2026-06-14");
      const success2 = logHabit("habit_veg_meal", "2026-06-14"); // Duplicate log
      
      const state = getState();
      
      assert(success1 === true, "First log successful");
      assert(success2 === false, "Second log blocked");
      assertEquals(state.loggedHabits.length, 1, "Only one habit entry registered");
      assertEquals(state.points, 15, "Awarded points only once (15 points)");
    });

    test("should advance levels and award Green Guru badge correctly", () => {
      resetToDefaults();
      
      let lvl = getLevelDetails();
      assertEquals(lvl.level, 1, "Start at level 1");
      assertEquals(lvl.name, "Sprout", "Level title is Sprout");
      
      // Complete high-point actions to trigger level-up
      // Green energy grid: 300 points
      adoptAction("green_energy_grid");
      completeAction("green_energy_grid");
      
      // Plant-based diet: 400 points
      adoptAction("plant_based_diet");
      completeAction("plant_based_diet");
      
      const state = getState();
      assertEquals(state.points, 700, "Accumulated 700 points total");
      
      lvl = getLevelDetails();
      // Level thresholds: Lvl 1: 0, Lvl 2: 100, Lvl 3: 250, Lvl 4: 500, Lvl 5: 1000
      assertEquals(lvl.level, 4, "Advanced to level 4");
      assertEquals(lvl.name, "Oak", "Level title is Oak");
      assert(state.badges.includes("badge_green_guru"), "Green Guru badge awarded");
    });

    test("should evaluate Carbon Cutter badge for large offset completions", () => {
      resetToDefaults();
      
      // Target carbon cutter badge: >= 500 kg total reduction
      // Adopt and complete green energy grid (1200 kg reduction)
      adoptAction("green_energy_grid");
      completeAction("green_energy_grid");
      
      const state = getState();
      assert(state.badges.includes("badge_carbon_cutter"), "Awarded Carbon Cutter badge");
    });
    
  });
}
