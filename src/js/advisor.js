// Personalized Insights and AI Advisor logic
import { REDUCTION_ACTIONS } from "./actions.js";

/**
 * Generates structured, personalized insights based on a user's footprint details and input selections.
 * 
 * @param {Object} footprint - Calculated footprint breakdown (transport, energy, food, lifestyle, total)
 * @param {Object} inputs - Original user inputs
 * @param {Array<string>} adoptedActionIds - List of IDs of already adopted actions to avoid suggesting them again
 * @returns {Object} Structured insights: general advice, top recommendations list, target savings
 */
export function generateInsights(footprint, inputs, adoptedActionIds = []) {
  const totalTons = (footprint.total / 1000).toFixed(1);
  const transportTons = (footprint.transport / 1000).toFixed(1);
  const energyTons = (footprint.energy / 1000).toFixed(1);
  const foodTons = (footprint.food / 1000).toFixed(1);
  const lifestyleTons = (footprint.lifestyle / 1000).toFixed(1);

  // Benchmarks (in tons/year)
  // Global average is ~4.5 tons, US is ~15-16 tons, sustainable target is < 2.0 tons.
  const targetTons = 2.0;
  
  // Find highest sector
  const sectors = [
    { name: "Transportation", value: footprint.transport, tons: transportTons, key: "transport" },
    { name: "Household Energy", value: footprint.energy, tons: energyTons, key: "energy" },
    { name: "Diet & Food", value: footprint.food, tons: foodTons, key: "food" },
    { name: "Lifestyle & Waste", value: footprint.lifestyle, tons: lifestyleTons, key: "lifestyle" }
  ];
  
  // Sort sectors by highest emissions
  sectors.sort((a, b) => b.value - a.value);
  const highestSector = sectors[0];

  const insightsList = [];
  const recommendedActionIds = [];

  // Generate sector-specific insights and prioritize actions
  
  // 1. Transportation
  if (footprint.transport > 2500 || highestSector.key === "transport") {
    if (inputs.carFuelType === "gasoline" || inputs.carFuelType === "diesel") {
      insightsList.push(`Your private vehicle runs on fossil fuels (${inputs.carFuelType}), generating substantial emissions (${transportTons}t). Consider upgrading to a hybrid or electric vehicle, or carpooling to halve your commute footprint.`);
      recommendedActionIds.push("carpool_commute");
    }
    if (inputs.transitKmPerWeek < 20 && inputs.carKmPerWeek > 100) {
      insightsList.push("You make limited use of public transit. Switching even two trips a week from driving to public transit can significantly lower your weekly carbon output.");
      recommendedActionIds.push("public_transit");
    }
    if (inputs.flightHoursPerYear > 15) {
      insightsList.push(`With ${inputs.flightHoursPerYear} flight hours annually, air travel is a major contributor to your transport total. Minimizing non-essential short flights could save hundreds of kilograms of emissions.`);
      recommendedActionIds.push("reduce_flight");
    }
    if (inputs.carKmPerWeek > 0) {
      recommendedActionIds.push("active_commute");
      recommendedActionIds.push("eco_driving");
    }
  }

  // 2. Household Energy
  if (footprint.energy > 2000 || highestSector.key === "energy") {
    if (inputs.electricityKwhPerMonth > 400) {
      insightsList.push(`Your electricity consumption (${inputs.electricityKwhPerMonth} kWh/mo) is above average. Switching to a 100% green energy provider can virtually eliminate grid electricity emissions.`);
      recommendedActionIds.push("green_energy_grid");
      recommendedActionIds.push("smart_thermostat");
    } else {
      recommendedActionIds.push("led_lights");
      recommendedActionIds.push("cold_wash_laundry");
    }
    if (inputs.gasKwhPerMonth > 200) {
      insightsList.push("Your gas utility usage contributes heavily to heating emissions. Setting your thermostat 1-2 degrees lower in winter can reduce gas draw by up to 10%.");
      recommendedActionIds.push("reduce_thermostat");
    }
  }

  // 3. Diet & Food
  if (footprint.food >= 2000 || highestSector.key === "food") {
    if (inputs.dietType === "highMeat" || inputs.dietType === "average") {
      insightsList.push("Animal agriculture has a heavy methane footprint. Swapping beef or lamb for plant-based proteins, even a few days a week, is one of the most effective personal carbon-saving steps.");
      recommendedActionIds.push("meatless_mondays");
      recommendedActionIds.push("plant_based_diet");
    }
    insightsList.push("Minimize food waste by planning meals and composting leftovers. Combating food waste reduces indirect agricultural footprint and landfill gas generation.");
    recommendedActionIds.push("reduce_food_waste");
    recommendedActionIds.push("shop_local");
  }

  // 4. Lifestyle & Shopping
  if (footprint.lifestyle > 500 || highestSector.key === "lifestyle") {
    if (inputs.shoppingHabit === "heavy") {
      insightsList.push("Frequent retail shopping has high embedded emissions from manufacturing and transport. Transitioning to buying second-hand, renting, or repairing items keeps resources in a circular loop.");
      recommendedActionIds.push("reduce_fast_fashion");
      recommendedActionIds.push("conscious_shopping");
    }
    if (!inputs.recycles) {
      insightsList.push("Landfill waste creates methane as organic matter breaks down anaerobically. Implementing recycling and home composting diverts waste and scores you an immediate emissions credit.");
      recommendedActionIds.push("compost_recycle");
    }
    recommendedActionIds.push("digital_cleanup");
  }

  // Ensure default recommendations if list is sparse
  if (recommendedActionIds.length < 3) {
    recommendedActionIds.push("led_lights", "compost_recycle", "meatless_mondays");
  }

  // Filter recommended actions to:
  // - Only unique ones
  // - Actions that are NOT already adopted
  const uniqueRecommendations = [...new Set(recommendedActionIds)];
  const filteredRecommendations = uniqueRecommendations
    .filter(id => !adoptedActionIds.includes(id))
    .map(id => REDUCTION_ACTIONS.find(a => a.id === id))
    .filter(Boolean)
    .slice(0, 4); // Suggest top 4 matching recommendations

  // Calculate potential savings if user implements all suggested recommendations
  const potentialSavings = filteredRecommendations.reduce((acc, act) => acc + act.offsetValue, 0);

  // Overall text summaries
  let overallComparison = "";
  const diffPct = Math.round(Math.abs((footprint.total - (targetTons * 1000)) / (targetTons * 1000) * 100));

  if (footprint.total > targetTons * 1000) {
    overallComparison = `Your footprint of ${totalTons}t is ${diffPct}% above the sustainable global target of ${targetTons}t per year. By adopting the recommendations below, you can trim your footprint significantly.`;
  } else {
    overallComparison = `Outstanding! Your footprint of ${totalTons}t is ${diffPct}% below the target threshold of ${targetTons}t per year. Keep up the clean lifestyle, and look at actions below for further refinements.`;
  }

  return {
    highestSector: highestSector.name,
    highestSectorPercent: Math.round((highestSector.value / (footprint.total || 1)) * 100),
    overallComparison,
    insights: insightsList.slice(0, 3), // Top 3 text observations
    recommendedActions: filteredRecommendations,
    potentialSavings: potentialSavings,
    projectedTotal: Math.max(0, footprint.total - potentialSavings)
  };
}
