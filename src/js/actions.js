export const REDUCTION_ACTIONS = [
  {
    id: "led_lights",
    title: "Switch to LED Lighting",
    description: "Replace standard incandescent light bulbs with energy-efficient LED bulbs. LEDs use up to 75-80% less energy.",
    category: "energy",
    impact: "low",
    ease: "easy",
    offsetValue: 150, // kg CO2e per year
    points: 50
  },
  {
    id: "smart_thermostat",
    title: "Install a Smart Thermostat",
    description: "Optimize heating and cooling settings automatically based on your schedule to avoid wasting energy.",
    category: "energy",
    impact: "medium",
    ease: "medium",
    offsetValue: 320,
    points: 150
  },
  {
    id: "cold_wash_laundry",
    title: "Cold Water Laundry",
    description: "Wash clothes in cold water rather than warm/hot water. About 75-90% of the energy used is for heating water.",
    category: "energy",
    impact: "low",
    ease: "easy",
    offsetValue: 110,
    points: 60
  },
  {
    id: "reduce_thermostat",
    title: "Lower Heating / Raise AC",
    description: "Adjust your home thermostat by 1-2 degrees (lower in winter, higher in summer) to save on climate control.",
    category: "energy",
    impact: "medium",
    ease: "easy",
    offsetValue: 260,
    points: 100
  },
  {
    id: "green_energy_grid",
    title: "Switch to Green Energy",
    description: "Opt for a 100% renewable energy supplier through your local utility provider if available, or buy green certificates.",
    category: "energy",
    impact: "high",
    ease: "medium",
    offsetValue: 1200,
    points: 300
  },
  {
    id: "carpool_commute",
    title: "Carpool to Work/School",
    description: "Share rides with colleagues or classmates twice a week to split transport emissions in half for those days.",
    category: "transport",
    impact: "medium",
    ease: "medium",
    offsetValue: 680,
    points: 120
  },
  {
    id: "public_transit",
    title: "Use Public Transit",
    description: "Swap driving for bus, subway, or train transit three times a week for your daily commute.",
    category: "transport",
    impact: "high",
    ease: "medium",
    offsetValue: 1100,
    points: 200
  },
  {
    id: "active_commute",
    title: "Walk or Bike for Short Trips",
    description: "Walk or cycle instead of driving for any trips under 3 km. Great for your health and the environment.",
    category: "transport",
    impact: "medium",
    ease: "easy",
    offsetValue: 350,
    points: 180
  },
  {
    id: "eco_driving",
    title: "Practice Eco-Driving Habits",
    description: "Maintain a steady speed, avoid rapid acceleration/braking, and keep tires properly inflated to save fuel.",
    category: "transport",
    impact: "low",
    ease: "easy",
    offsetValue: 180,
    points: 70
  },
  {
    id: "reduce_flight",
    title: "Skip One Short-Haul Flight",
    description: "Replace one domestic flight with train travel or hold the meeting virtually to avoid heavy takeoff emissions.",
    category: "transport",
    impact: "high",
    ease: "hard",
    offsetValue: 400,
    points: 250
  },
  {
    id: "meatless_mondays",
    title: "Meat-Free Mondays",
    description: "Cut out meat for one full day per week. Animal farming contributes highly to methane and water footprint.",
    category: "food",
    impact: "medium",
    ease: "easy",
    offsetValue: 300,
    points: 80
  },
  {
    id: "plant_based_diet",
    title: "Shift to Mostly Plant-Based",
    description: "Adopt a vegetarian or vegan lifestyle, minimizing animal product consumption entirely.",
    category: "food",
    impact: "high",
    ease: "hard",
    offsetValue: 1000,
    points: 400
  },
  {
    id: "reduce_food_waste",
    title: "Zero Food Waste",
    description: "Plan meals, store food correctly, use leftovers, and compost food scraps. Wasted food accounts for 8% of global emissions.",
    category: "food",
    impact: "medium",
    ease: "medium",
    offsetValue: 380,
    points: 150
  },
  {
    id: "shop_local",
    title: "Buy Local & Seasonal Food",
    description: "Source food locally and in-season to minimize carbon emissions from cold storage and transcontinental air shipping.",
    category: "food",
    impact: "low",
    ease: "medium",
    offsetValue: 120,
    points: 90
  },
  {
    id: "reduce_fast_fashion",
    title: "Avoid Fast Fashion",
    description: "Buy fewer clothing items, select second-hand/vintage, and mend clothes instead of discarding. Textile production is highly polluting.",
    category: "lifestyle",
    impact: "medium",
    ease: "medium",
    offsetValue: 250,
    points: 110
  },
  {
    id: "compost_recycle",
    title: "Recycle & Compost Properly",
    description: "Sort paper, plastic, metal, glass, and compost organic matter to divert reusable materials from methane-producing landfills.",
    category: "lifestyle",
    impact: "medium",
    ease: "easy",
    offsetValue: 220,
    points: 100
  },
  {
    id: "digital_cleanup",
    title: "Digital Clean-Up",
    description: "Clean up unused cloud data, unsubscribe from spam, and shut down devices at night. Internet data centers require massive cooling and power.",
    category: "lifestyle",
    impact: "low",
    ease: "easy",
    offsetValue: 45,
    points: 50
  },
  {
    id: "conscious_shopping",
    title: "Buy Durable & Refurbished",
    description: "When buying electronics or appliances, choose repaired or high-durability items to reduce manufacturing demand.",
    category: "lifestyle",
    impact: "high",
    ease: "hard",
    offsetValue: 500,
    points: 200
  }
];

export const DAILY_HABITS = [
  { id: "habit_veg_meal", title: "Eat all plant-based meals today", category: "food", offsetValue: 2.7, points: 15 },
  { id: "habit_active_transit", title: "Walk, bike, or ride public transit instead of driving", category: "transport", offsetValue: 3.5, points: 20 },
  { id: "habit_no_heating_ac", title: "Keep heating/AC off (or at eco-level) today", category: "energy", offsetValue: 1.8, points: 10 },
  { id: "habit_no_waste", title: "Ensure zero food waste today", category: "food", offsetValue: 1.0, points: 10 },
  { id: "habit_line_dry", title: "Line dry clothes instead of using the dryer", category: "energy", offsetValue: 1.5, points: 15 }
];
