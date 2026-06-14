// UI Rendering, Event Handlers, and DOM Management
import { getState, updateCalculator, adoptAction, cancelAction, completeAction, logHabit, resetToDefaults, getLevelDetails, BADGES_REGISTRY } from "./state.js";
import { REDUCTION_ACTIONS, DAILY_HABITS } from "./actions.js";
import { generateInsights } from "./advisor.js";

// DOM Selector Cache
const DOM = {
  themeToggle: document.getElementById("theme-toggle"),
  tabButtons: document.querySelectorAll(".tab-btn"),
  viewPanels: document.querySelectorAll(".view-panel"),
  
  // Header Widgets
  headerLevelName: document.getElementById("header-level-name"),
  headerLevelNum: document.getElementById("header-level-num"),
  headerPoints: document.getElementById("header-points"),
  
  // Dashboard Elements
  gaugeValue: document.getElementById("gauge-value"),
  gaugeProgress: document.getElementById("gauge-progress"),
  gaugeRating: document.getElementById("gauge-rating"),
  breakdownBars: document.getElementById("breakdown-bars"),
  compGlobal: document.getElementById("comp-global"),
  compTarget: document.getElementById("comp-target"),
  compNational: document.getElementById("comp-national"),
  
  // Calculator Wizard Elements
  calcForm: document.getElementById("carbon-calc-form"),
  wizardSlides: document.querySelectorAll(".wizard-slide"),
  stepIndicators: document.querySelectorAll(".step-indicator"),
  progressBar: document.getElementById("wizard-progress-bar"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  liveFootprintEst: document.getElementById("live-footprint-est"),
  
  // Actions Hub
  actionCardsGrid: document.getElementById("action-cards-grid"),
  filterCategory: document.getElementById("filter-category"),
  filterImpact: document.getElementById("filter-impact"),
  habitsLogGrid: document.getElementById("habits-log-grid"),
  
  // Advisor Insights
  advisorInsightsList: document.getElementById("advisor-insights-list"),
  advisorRecsGrid: document.getElementById("advisor-recs-grid"),
  projCurrentVal: document.getElementById("proj-current-val"),
  projSavingsVal: document.getElementById("proj-savings-val"),
  projTargetVal: document.getElementById("proj-target-val"),
  comparisonText: document.getElementById("comparison-text"),
  
  // Profile Elements
  profileName: document.getElementById("profile-name"),
  profileLevelTitle: document.getElementById("profile-level-title"),
  profilePoints: document.getElementById("profile-points"),
  xpProgressText: document.getElementById("xp-progress-text"),
  xpProgressBar: document.getElementById("xp-progress-bar"),
  profileBadgesGrid: document.getElementById("profile-badges-grid"),
  btnResetData: document.getElementById("btn-reset-data"),
  toastContainer: document.getElementById("toast-container")
};

// Current Wizard Step State
let currentStep = 0;

/**
 * Initializes the UI modules, registers events, and runs first renders
 */
export function initUI() {
  setupTheme();
  setupNavigation();
  setupWizard();
  setupFilters();
  setupStateListener();
  setupFormListeners();
  
  // Event: Reset data
  if (DOM.btnResetData) {
    DOM.btnResetData.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all inputs, progress, logs, and achievements? This cannot be undone.")) {
        resetToDefaults();
        showToast("EcoSphere Reset", "All data has been cleared and reset to baseline levels.", "warning");
        switchTab("dashboard");
      }
    });
  }
  
  // Initial renders
  renderAll();
}

/**
 * Monitors state change updates and re-renders components reactively
 */
function setupStateListener() {
  document.addEventListener("ecosphereStateUpdate", (e) => {
    const newState = e.detail;
    renderAll(newState);
  });
}

/**
 * Main render function that handles routing data into elements
 */
function renderAll(state = getState()) {
  renderHeader(state);
  renderDashboard(state);
  renderActionsHub(state);
  renderAdvisor(state);
  renderProfile(state);
}

/* ==========================================================================
   THEME SETUP (Dark / Light Theme Toggle)
   ========================================================================== */
function setupTheme() {
  const savedTheme = localStorage.getItem("ecosphere_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  DOM.themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("ecosphere_theme", nextTheme);
    updateThemeIcon(nextTheme);
    showToast("Theme Changed", `Switched to ${nextTheme} theme.`, "info");
  });
}

function updateThemeIcon(theme) {
  DOM.themeToggle.innerHTML = theme === "dark" 
    ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
    : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
}

/* ==========================================================================
   ROUTING AND NAVIGATION
   ========================================================================== */
function setupNavigation() {
  DOM.tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPanel = btn.getAttribute("data-target");
      switchTab(targetPanel);
    });
  });
}

function switchTab(panelId) {
  DOM.tabButtons.forEach(btn => {
    if (btn.getAttribute("data-target") === panelId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  DOM.viewPanels.forEach(panel => {
    if (panel.id === `${panelId}-panel`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });
}

/* ==========================================================================
   HEADER RENDERING
   ========================================================================== */
function renderHeader(state) {
  const details = getLevelDetails();
  if (DOM.headerLevelName) DOM.headerLevelName.textContent = details.name;
  if (DOM.headerLevelNum) DOM.headerLevelNum.textContent = `Lvl ${details.level}`;
  if (DOM.headerPoints) DOM.headerPoints.textContent = `${details.points} pts`;
}

/* ==========================================================================
   DASHBOARD VIEW RENDERING
   ========================================================================== */
function renderDashboard(state) {
  const breakdown = state.footprintBreakdown;
  const tons = (breakdown.total / 1000).toFixed(1);
  
  // 1. Render Gauge Ring
  if (DOM.gaugeValue) DOM.gaugeValue.textContent = tons;
  
  // Calculate stroke offset
  // Circumference = 2 * PI * r = 2 * 3.14159 * 90 = 565.48
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  
  // baseline comparison limit: 15.0 tons (standard carbon ceiling scale)
  const maxScaleTons = 15.0;
  const pct = Math.min(100, Math.max(0, (tons / maxScaleTons) * 100));
  const dashoffset = circumference - (pct / 100) * circumference;
  
  if (DOM.gaugeProgress) {
    DOM.gaugeProgress.style.strokeDasharray = circumference;
    DOM.gaugeProgress.style.strokeDashoffset = dashoffset;
  }
  
  // Update colors & rating labels
  if (DOM.gaugeRating) {
    DOM.gaugeRating.className = "gauge-rating";
    if (tons <= 3.0) {
      DOM.gaugeRating.textContent = "Eco Friendly 🌱";
      DOM.gaugeRating.classList.add("rating-good");
      DOM.gaugeProgress.style.stroke = "var(--accent-green)";
    } else if (tons <= 8.0) {
      DOM.gaugeRating.textContent = "Moderate Footprint ⚠️";
      DOM.gaugeRating.classList.add("rating-warning");
      DOM.gaugeProgress.style.stroke = "var(--color-warning)";
    } else {
      DOM.gaugeRating.textContent = "High Footprint 🚨";
      DOM.gaugeRating.classList.add("rating-bad");
      DOM.gaugeProgress.style.stroke = "var(--color-danger)";
    }
  }

  // 2. Render Breakdown Bars (Horizontal Bar Chart with color tags)
  if (DOM.breakdownBars) {
    const total = breakdown.total || 1;
    const catData = [
      { name: "Transportation", val: breakdown.transport, pct: Math.round((breakdown.transport / total) * 100), colorClass: "color-transport" },
      { name: "Household Energy", val: breakdown.energy, pct: Math.round((breakdown.energy / total) * 100), colorClass: "color-energy" },
      { name: "Diet & Food", val: breakdown.food, pct: Math.round((breakdown.food / total) * 100), colorClass: "color-food" },
      { name: "Lifestyle & Waste", val: breakdown.lifestyle, pct: Math.round((breakdown.lifestyle / total) * 100), colorClass: "color-lifestyle" }
    ];

    DOM.breakdownBars.innerHTML = catData.map(c => `
      <div style="margin-bottom: 1.25rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 500; margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="legend-color ${c.colorClass}"></span>
            <span>${c.name}</span>
          </div>
          <span>${(c.val / 1000).toFixed(1)}t CO₂e (${c.pct}%)</span>
        </div>
        <div style="width: 100%; height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden; border: 1px solid var(--glass-border);">
          <div style="width: ${c.pct}%; height: 100%; background: var(--cat-${c.name.toLowerCase().includes('transport') ? 'transport' : c.name.toLowerCase().includes('energy') ? 'energy' : c.name.toLowerCase().includes('food') ? 'food' : 'lifestyle'}); border-radius: 4px; transition: width 0.8s ease-out;"></div>
        </div>
      </div>
    `).join("");
  }

  // 3. Comparisons Widget
  if (DOM.compGlobal) DOM.compGlobal.textContent = `${(tons / 4.5).toFixed(1)}x`; // global avg is 4.5t
  if (DOM.compNational) DOM.compNational.textContent = `${(tons / 16.0).toFixed(1)}x`; // US avg is 16t
  if (DOM.compTarget) DOM.compTarget.textContent = `${(tons / 2.0).toFixed(1)}x`; // sustainable goal target is 2t
}

/* ==========================================================================
   CALCULATOR WIZARD RENDERING & INTERACTION
   ========================================================================== */
function setupWizard() {
  updateWizardButtons();
  
  DOM.btnNext.addEventListener("click", () => {
    if (currentStep < DOM.wizardSlides.length - 1) {
      currentStep++;
      renderWizardStep();
    } else {
      // Form submitted!
      saveCalculatorFormData();
    }
  });

  DOM.btnPrev.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      renderWizardStep();
    }
  });

  // Populate initial values in form
  const state = getState();
  if (state.calculatorInputs) {
    populateFormInputs(state.calculatorInputs);
  }
}

function renderWizardStep() {
  DOM.wizardSlides.forEach((slide, idx) => {
    slide.classList.toggle("active", idx === currentStep);
  });

  DOM.stepIndicators.forEach((ind, idx) => {
    ind.classList.toggle("active", idx === currentStep);
    ind.classList.toggle("completed", idx < currentStep);
  });

  // Update Progress Line
  const pct = (currentStep / (DOM.wizardSlides.length - 1)) * 100;
  DOM.progressBar.style.width = `${pct}%`;

  updateWizardButtons();
  updateLiveFootprintEstimate();
}

function updateWizardButtons() {
  DOM.btnPrev.disabled = currentStep === 0;
  if (currentStep === DOM.wizardSlides.length - 1) {
    DOM.btnNext.innerHTML = `Calculate Total ➔`;
  } else {
    DOM.btnNext.innerHTML = `Continue ➔`;
  }
}

function setupFormListeners() {
  // Listen to form input edits to show Live Estimations dynamically
  const formControls = DOM.calcForm.querySelectorAll("input, select");
  formControls.forEach(ctrl => {
    // Add value bubble updater for ranges
    if (ctrl.type === "range") {
      const bubble = document.getElementById(`${ctrl.id}-val`);
      ctrl.addEventListener("input", () => {
        if (bubble) bubble.textContent = ctrl.value;
        updateLiveFootprintEstimate();
      });
    } else {
      ctrl.addEventListener("change", updateLiveFootprintEstimate);
    }
  });
}

function updateLiveFootprintEstimate() {
  const data = readCalculatorFormValues();
  const footprint = updateCalculator(data); // recalculates internally
  const stateVal = getState();
  const tons = (stateVal.footprintBreakdown.total / 1000).toFixed(1);
  if (DOM.liveFootprintEst) {
    DOM.liveFootprintEst.textContent = `Estimated Footprint: ${tons} tons CO₂e / year`;
  }
}

function readCalculatorFormValues() {
  const formData = new FormData(DOM.calcForm);
  return {
    carKmPerWeek: formData.get("carKmPerWeek") || 0,
    carFuelType: formData.get("carFuelType") || "none",
    transitKmPerWeek: formData.get("transitKmPerWeek") || 0,
    flightHoursPerYear: formData.get("flightHoursPerYear") || 0,
    electricityKwhPerMonth: formData.get("electricityKwhPerMonth") || 0,
    gasKwhPerMonth: formData.get("gasKwhPerMonth") || 0,
    dietType: formData.get("dietType") || "average",
    shoppingHabit: formData.get("shoppingHabit") || "average",
    recycles: formData.get("recycles") === "on"
  };
}

function populateFormInputs(inputs) {
  const form = DOM.calcForm;
  
  if (inputs.carKmPerWeek !== undefined) {
    form.querySelector(`[name="carKmPerWeek"]`).value = inputs.carKmPerWeek;
    const bbl = document.getElementById("carKmPerWeek-val");
    if (bbl) bbl.textContent = inputs.carKmPerWeek;
  }
  
  if (inputs.carFuelType) form.querySelector(`[name="carFuelType"]`).value = inputs.carFuelType;
  
  if (inputs.transitKmPerWeek !== undefined) {
    form.querySelector(`[name="transitKmPerWeek"]`).value = inputs.transitKmPerWeek;
    const bbl = document.getElementById("transitKmPerWeek-val");
    if (bbl) bbl.textContent = inputs.transitKmPerWeek;
  }
  
  if (inputs.flightHoursPerYear !== undefined) {
    form.querySelector(`[name="flightHoursPerYear"]`).value = inputs.flightHoursPerYear;
    const bbl = document.getElementById("flightHoursPerYear-val");
    if (bbl) bbl.textContent = inputs.flightHoursPerYear;
  }
  
  if (inputs.electricityKwhPerMonth !== undefined) {
    form.querySelector(`[name="electricityKwhPerMonth"]`).value = inputs.electricityKwhPerMonth;
    const bbl = document.getElementById("electricityKwhPerMonth-val");
    if (bbl) bbl.textContent = inputs.electricityKwhPerMonth;
  }
  
  if (inputs.gasKwhPerMonth !== undefined) {
    form.querySelector(`[name="gasKwhPerMonth"]`).value = inputs.gasKwhPerMonth;
    const bbl = document.getElementById("gasKwhPerMonth-val");
    if (bbl) bbl.textContent = inputs.gasKwhPerMonth;
  }
  
  if (inputs.dietType) {
    const radio = form.querySelector(`[name="dietType"][value="${inputs.dietType}"]`);
    if (radio) radio.checked = true;
  }
  
  if (inputs.shoppingHabit) {
    const radio = form.querySelector(`[name="shoppingHabit"][value="${inputs.shoppingHabit}"]`);
    if (radio) radio.checked = true;
  }
  
  if (inputs.recycles !== undefined) {
    form.querySelector(`[name="recycles"]`).checked = inputs.recycles;
  }
}

function saveCalculatorFormData() {
  const data = readCalculatorFormValues();
  updateCalculator(data);
  
  showToast("Footprint Updated!", "Your questionnaire has been compiled and dashboard updated.", "success");
  
  // Reset wizard steps
  currentStep = 0;
  renderWizardStep();
  
  switchTab("dashboard");
}

/* ==========================================================================
   REDUCTION ACTION HUB AND HABIT LOGGER
   ========================================================================== */
function setupFilters() {
  DOM.filterCategory.addEventListener("change", () => renderActionsHub());
  DOM.filterImpact.addEventListener("change", () => renderActionsHub());
}

function renderActionsHub(state = getState()) {
  const catFilter = DOM.filterCategory.value;
  const impFilter = DOM.filterImpact.value;
  
  // 1. Render Habits Logger
  if (DOM.habitsLogGrid) {
    const today = new Date().toISOString().split("T")[0];
    DOM.habitsLogGrid.innerHTML = DAILY_HABITS.map(h => {
      const isLoggedToday = state.loggedHabits.some(l => l.id === h.id && l.date === today);
      return `
        <div class="habit-log-item">
          <div class="habit-text-group">
            <span class="habit-name">${h.title}</span>
            <span class="habit-points-offset">+${h.points} XP • Saves ${h.offsetValue} kg CO₂e</span>
          </div>
          <button class="btn-log-habit ${isLoggedToday ? 'logged' : ''}" 
                  data-id="${h.id}" 
                  ${isLoggedToday ? 'disabled' : ''}>
            ${isLoggedToday ? 'Logged ✓' : 'Log Today'}
          </button>
        </div>
      `;
    }).join("");
    
    // Bind habit logging click events
    DOM.habitsLogGrid.querySelectorAll(".btn-log-habit:not(.logged)").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const success = logHabit(id, today);
        if (success) {
          const habitObj = DAILY_HABITS.find(h => h.id === id);
          showToast("Habit Logged!", `Awesome! You earned +${habitObj.points} XP for your green choice.`, "success");
        }
      });
    });
  }

  // 2. Render Reduction Task Cards
  if (DOM.actionCardsGrid) {
    const filtered = REDUCTION_ACTIONS.filter(act => {
      const matchCat = catFilter === "all" || act.category === catFilter;
      const matchImp = impFilter === "all" || act.impact === impFilter;
      return matchCat && matchImp;
    });

    if (filtered.length === 0) {
      DOM.actionCardsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          No actions match selected filters. Try broadening your criteria.
        </div>
      `;
      return;
    }

    DOM.actionCardsGrid.innerHTML = filtered.map(act => {
      const isAdopted = state.adoptedActions.includes(act.id);
      const isCompleted = state.completedActions.includes(act.id);
      
      let cardClass = "glass-card action-card";
      if (isAdopted) cardClass += " adopted";
      if (isCompleted) cardClass += " completed";
      
      let buttonHtml = "";
      if (isCompleted) {
        buttonHtml = `<button class="btn btn-secondary" disabled>Fully Completed</button>`;
      } else if (isAdopted) {
        buttonHtml = `
          <button class="btn btn-secondary btn-cancel-act" data-id="${act.id}">Cancel</button>
          <button class="btn btn-primary btn-complete-act" data-id="${act.id}">Done ✓</button>
        `;
      } else {
        buttonHtml = `<button class="btn btn-primary btn-adopt-act" data-id="${act.id}">Adopt Task</button>`;
      }

      return `
        <div class="${cardClass}">
          ${isCompleted ? '<div class="action-card-completed-seal">✓</div>' : ''}
          <div class="action-card-header">
            <span class="action-category-badge badge-cat-${act.category}">${act.category}</span>
            <span class="action-impact-indicator impact-${act.impact}">${act.impact} Impact</span>
          </div>
          <h3 class="action-card-title">${act.title}</h3>
          <p class="action-card-desc">${act.description}</p>
          <div class="action-metrics-row">
            <div class="metric-item">
              <span class="metric-label">CO₂ Offset</span>
              <span class="metric-val" style="color: var(--accent-green);">${act.offsetValue} kg/yr</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Reward</span>
              <span class="metric-val" style="color: var(--color-info);">${act.points} XP</span>
            </div>
          </div>
          <div class="action-card-footer">
            ${buttonHtml}
          </div>
        </div>
      `;
    }).join("");

    // Bind action buttons
    DOM.actionCardsGrid.querySelectorAll(".btn-adopt-act").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        adoptAction(id);
        const act = REDUCTION_ACTIONS.find(a => a.id === id);
        showToast("Task Adopted", `"${act.title}" added to your target checklist. Go to the Insights tab to see your projected offset!`, "success");
      });
    });

    DOM.actionCardsGrid.querySelectorAll(".btn-cancel-act").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        cancelAction(id);
      });
    });

    DOM.actionCardsGrid.querySelectorAll(".btn-complete-act").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        completeAction(id);
        const act = REDUCTION_ACTIONS.find(a => a.id === id);
        showToast("Action Achieved!", `Congrats! Switched "${act.title}" to completed. Earned +${act.points} XP!`, "success");
      });
    });
  }
}

/* ==========================================================================
   PERSONALIZED ADVISOR / INSIGHTS RENDERING
   ========================================================================== */
function renderAdvisor(state = getState()) {
  const footprint = state.footprintBreakdown;
  const inputs = state.calculatorInputs;
  const adoptedAndCompleted = [...state.adoptedActions, ...state.completedActions];
  
  const advice = generateInsights(footprint, inputs, adoptedAndCompleted);
  
  // 1. Text Summary
  if (DOM.comparisonText) DOM.comparisonText.textContent = advice.overallComparison;
  
  // 2. Observations list
  if (DOM.advisorInsightsList) {
    if (advice.insights.length === 0) {
      DOM.advisorInsightsList.innerHTML = `
        <div class="insight-card">
          <span class="insight-icon">🌟</span>
          <div class="insight-content">
            <h4>Profile Clean</h4>
            <p>Your emissions are low and well-distributed. Keep maintaining your eco-conscious habits!</p>
          </div>
        </div>
      `;
    } else {
      DOM.advisorInsightsList.innerHTML = advice.insights.map(txt => `
        <div class="insight-card">
          <span class="insight-icon">💡</span>
          <div class="insight-content">
            <h4>Advisor Observation</h4>
            <p>${txt}</p>
          </div>
        </div>
      `).join("");
    }
  }

  // 3. Simulated Projection Rings
  const currentTons = (footprint.total / 1000).toFixed(1);
  const offsetTons = (advice.potentialSavings / 1000).toFixed(1);
  const projTons = (advice.projectedTotal / 1000).toFixed(1);

  if (DOM.projCurrentVal) DOM.projCurrentVal.textContent = `${currentTons}t`;
  if (DOM.projSavingsVal) DOM.projSavingsVal.textContent = `-${offsetTons}t`;
  if (DOM.projTargetVal) DOM.projTargetVal.textContent = `${projTons}t`;

  // 4. Advisor Recommended Actions (Actions suggested based on footprint)
  if (DOM.advisorRecsGrid) {
    if (advice.recommendedActions.length === 0) {
      DOM.advisorRecsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">
          All recommended high-priority tasks have already been adopted! Check your Action Hub.
        </div>
      `;
      return;
    }

    DOM.advisorRecsGrid.innerHTML = advice.recommendedActions.map(act => `
      <div class="glass-card action-card" style="border-style: dashed;">
        <div class="action-card-header">
          <span class="action-category-badge badge-cat-${act.category}">${act.category}</span>
          <span class="action-impact-indicator impact-${act.impact}">${act.impact} Impact</span>
        </div>
        <h3 class="action-card-title">${act.title}</h3>
        <p class="action-card-desc">${act.description}</p>
        <div class="action-metrics-row">
          <div class="metric-item">
            <span class="metric-label">Offset</span>
            <span class="metric-val" style="color: var(--accent-green);">${act.offsetValue} kg/yr</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Reward</span>
            <span class="metric-val" style="color: var(--color-info);">${act.points} XP</span>
          </div>
        </div>
        <div class="action-card-footer">
          <button class="btn btn-primary btn-adopt-recs" data-id="${act.id}">Adopt Recommendation</button>
        </div>
      </div>
    `).join("");

    // Bind recommendation adopt click actions
    DOM.advisorRecsGrid.querySelectorAll(".btn-adopt-recs").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        adoptAction(id);
        const act = REDUCTION_ACTIONS.find(a => a.id === id);
        showToast("Task Adopted", `"${act.title}" added to checklist.`, "success");
      });
    });
  }
}

/* ==========================================================================
   PROFILE & ACHIEVEMENTS PANEL RENDERING
   ========================================================================== */
function renderProfile(state = getState()) {
  const details = getLevelDetails();
  
  if (DOM.profileName) DOM.profileName.textContent = "Eco Explorer";
  if (DOM.profileLevelTitle) DOM.profileLevelTitle.textContent = `${details.name} (Level ${details.level})`;
  if (DOM.profilePoints) DOM.profilePoints.textContent = `${details.points} Total XP`;
  
  // Progress bar calculation
  if (DOM.xpProgressBar) {
    DOM.xpProgressBar.style.width = `${details.percent}%`;
  }
  if (DOM.xpProgressText) {
    if (details.nextLevelPoints === details.minPoints) {
      DOM.xpProgressText.textContent = "Max Level Reached!";
    } else {
      DOM.xpProgressText.textContent = `${details.points} / ${details.nextLevelPoints} XP to next level`;
    }
  }

  // Renders Badge Achievements
  if (DOM.profileBadgesGrid) {
    DOM.profileBadgesGrid.innerHTML = BADGES_REGISTRY.map(badge => {
      const isUnlocked = state.badges.includes(badge.id);
      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : ''}" title="${badge.desc}">
          <span class="badge-avatar">${badge.icon}</span>
          <span class="badge-name">${badge.name}</span>
          <span class="badge-desc">${isUnlocked ? 'Completed' : 'Locked'}</span>
        </div>
      `;
    }).join("");
  }
}

/* ==========================================================================
   TOAST FLOATING ALERTS SYSTEM
   ========================================================================== */
export function showToast(title, desc, type = "success") {
  if (!DOM.toastContainer) return;
  
  const toast = document.createElement("div");
  
  let icon = "🌱";
  let toastClass = "toast";
  if (type === "warning") {
    icon = "⚠️";
    toastClass += " badge-toast";
  } else if (type === "info") {
    icon = "⚡";
  } else if (type === "badge") {
    icon = "🏆";
    toastClass += " badge-toast";
  }

  toast.className = toastClass;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-message">
      <span class="toast-title">${title}</span>
      <span class="toast-desc">${desc}</span>
    </div>
  `;

  DOM.toastContainer.appendChild(toast);

  // Auto remove toast after 4s
  setTimeout(() => {
    toast.style.animation = "fadeIn var(--transition-normal) reverse forwards";
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}
