// Carbon Footprint Emission Factors and Core Calculations
// Values are in kg CO2e

export const EMISSION_FACTORS = {
  transport: {
    gasoline: 0.18, // per km
    diesel: 0.17,   // per km
    hybrid: 0.10,   // per km
    electric: 0.05, // per km
    transit: 0.04,  // per km
    flight: 120.0   // per hour
  },
  energy: {
    electricity: 0.40, // per kWh
    gas: 0.18          // per kWh
  },
  food: {
    highMeat: 3000.0,  // per year
    average: 2000.0,   // per year
    vegetarian: 1500.0,// per year
    vegan: 1100.0      // per year
  },
  lifestyle: {
    shopping: {
      frugal: 150.0,   // per year
      average: 450.0,  // per year
      heavy: 1000.0    // per year
    },
    recycleDiscount: 200.0 // subtracted if user recycles
  }
};

/**
 * Calculates carbon footprint based on standard questionnaire fields.
 * All inputs are normalized to annual values.
 * 
 * @param {Object} inputs - Questionnaire data
 * @param {number} inputs.carKmPerWeek - Weekly km driven
 * @param {string} inputs.carFuelType - 'gasoline'|'diesel'|'hybrid'|'electric'|'none'
 * @param {number} inputs.transitKmPerWeek - Weekly transit km
 * @param {number} inputs.flightHoursPerYear - Annual flight hours
 * @param {number} inputs.electricityKwhPerMonth - Monthly electricity usage
 * @param {number} inputs.gasKwhPerMonth - Monthly gas usage
 * @param {string} inputs.dietType - 'highMeat'|'average'|'vegetarian'|'vegan'
 * @param {string} inputs.shoppingHabit - 'frugal'|'average'|'heavy'
 * @param {boolean} inputs.recycles - Whether user recycles/composts
 * @returns {Object} CO2e emissions breakdown in kg/year and total
 */
export function calculateFootprint(inputs) {
  // Ensure default fallback values for any missing fields to prevent NaN errors
  const data = {
    carKmPerWeek: Number(inputs?.carKmPerWeek ?? 0),
    carFuelType: inputs?.carFuelType || "none",
    transitKmPerWeek: Number(inputs?.transitKmPerWeek ?? 0),
    flightHoursPerYear: Number(inputs?.flightHoursPerYear ?? 0),
    electricityKwhPerMonth: Number(inputs?.electricityKwhPerMonth ?? 0),
    gasKwhPerMonth: Number(inputs?.gasKwhPerMonth ?? 0),
    dietType: inputs?.dietType || "average",
    shoppingHabit: inputs?.shoppingHabit || "average",
    recycles: !!(inputs?.recycles ?? false)
  };

  // 1. TRANSPORT CALCULATIONS (Annualized)
  const carEmissions = data.carFuelType !== "none" && EMISSION_FACTORS.transport[data.carFuelType]
    ? data.carKmPerWeek * 52 * EMISSION_FACTORS.transport[data.carFuelType]
    : 0;
  
  const transitEmissions = data.transitKmPerWeek * 52 * EMISSION_FACTORS.transport.transit;
  const flightEmissions = data.flightHoursPerYear * EMISSION_FACTORS.transport.flight;
  const transportTotal = Math.round(carEmissions + transitEmissions + flightEmissions);

  // 2. ENERGY CALCULATIONS (Annualized)
  const electricityEmissions = data.electricityKwhPerMonth * 12 * EMISSION_FACTORS.energy.electricity;
  const gasEmissions = data.gasKwhPerMonth * 12 * EMISSION_FACTORS.energy.gas;
  const energyTotal = Math.round(electricityEmissions + gasEmissions);

  // 3. FOOD CALCULATIONS
  const foodTotal = Math.round(EMISSION_FACTORS.food[data.dietType] || EMISSION_FACTORS.food.average);

  // 4. LIFESTYLE & WASTE CALCULATIONS
  const shoppingBase = EMISSION_FACTORS.lifestyle.shopping[data.shoppingHabit] || EMISSION_FACTORS.lifestyle.shopping.average;
  const recycleSub = data.recycles ? EMISSION_FACTORS.lifestyle.recycleDiscount : 0;
  const lifestyleTotal = Math.round(Math.max(0, shoppingBase - recycleSub));

  const total = transportTotal + energyTotal + foodTotal + lifestyleTotal;

  return {
    transport: transportTotal,
    energy: energyTotal,
    food: foodTotal,
    lifestyle: lifestyleTotal,
    total: total
  };
}

/**
 * Returns default answers for a typical baseline user
 */
export function getBaselineInputs() {
  return {
    carKmPerWeek: 150,
    carFuelType: "gasoline",
    transitKmPerWeek: 50,
    flightHoursPerYear: 10,
    electricityKwhPerMonth: 300,
    gasKwhPerMonth: 150,
    dietType: "average",
    shoppingHabit: "average",
    recycles: false
  };
}
