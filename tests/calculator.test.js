import { describe, test, assertEquals, assert } from "./test-runner.js";
import { calculateFootprint, getBaselineInputs, EMISSION_FACTORS } from "../src/js/calculator.js";

export function runCalculatorTests() {
  describe("Carbon Footprint Calculator Formulas", () => {
    
    test("should calculate correct baseline footprint values", () => {
      const inputs = getBaselineInputs();
      const res = calculateFootprint(inputs);

      // Verify categories match formula logic
      // Baseline inputs:
      // carKmPerWeek: 150, carFuelType: 'gasoline'
      // transitKmPerWeek: 50, flightHoursPerYear: 10
      // electricityKwhPerMonth: 300, gasKwhPerMonth: 150
      // dietType: 'average', shoppingHabit: 'average', recycles: false

      // Transport calculation verification:
      // car: 150 * 52 * 0.18 = 1404
      // transit: 50 * 52 * 0.04 = 104
      // flight: 10 * 120 = 1200
      // Total transport = 1404 + 104 + 1200 = 2708
      assertEquals(res.transport, 2708, "Transport calculation baseline match");

      // Energy calculation verification:
      // electricity: 300 * 12 * 0.40 = 1440
      // gas: 150 * 12 * 0.18 = 324
      // Total energy = 1440 + 324 = 1764
      assertEquals(res.energy, 1764, "Energy calculation baseline match");

      // Food calculation verification:
      // 'average' diet = 2000
      assertEquals(res.food, 2000, "Food calculation baseline match");

      // Lifestyle calculation verification:
      // 'average' shopping = 450, recycles: false = 0 discount
      assertEquals(res.lifestyle, 450, "Lifestyle calculation baseline match");

      // Grand total verification
      // 2708 + 1764 + 2000 + 450 = 6922
      assertEquals(res.total, 6922, "Baseline total CO2 match");
    });

    test("should return 0 emissions for zero/none inputs", () => {
      const inputs = {
        carKmPerWeek: 0,
        carFuelType: "none",
        transitKmPerWeek: 0,
        flightHoursPerYear: 0,
        electricityKwhPerMonth: 0,
        gasKwhPerMonth: 0,
        dietType: "vegan", // Minimum possible diet value is 1100
        shoppingHabit: "frugal", // Minimum shopping is 150
        recycles: true // Subtracts 200
      };
      
      const res = calculateFootprint(inputs);
      
      assertEquals(res.transport, 0, "Transport emissions should be 0");
      assertEquals(res.energy, 0, "Energy emissions should be 0");
      assertEquals(res.food, 1100, "Food emissions should match vegan base");
      // Lifestyle shopping base 150 - recycleDiscount 200 is -50, but bound to 0
      assertEquals(res.lifestyle, 0, "Lifestyle emissions bounded to >= 0");
      assertEquals(res.total, 1100, "Total footprint should equal food base");
    });

    test("should handle missing inputs gracefully using fallback values", () => {
      // Pass empty object or undefined values
      const res = calculateFootprint({});
      
      assert(res.transport >= 0, "Transport should fallback to a valid number");
      assert(res.energy >= 0, "Energy should fallback to a valid number");
      assertEquals(res.food, 2000, "Food should fallback to average");
      assertEquals(res.lifestyle, 450, "Lifestyle should fallback to average");
      assert(res.total > 0, "Total should be calculated based on fallbacks");
    });

    test("should scale correctly for heavy consumers", () => {
      const inputs = {
        carKmPerWeek: 500,
        carFuelType: "gasoline",
        transitKmPerWeek: 200,
        flightHoursPerYear: 50,
        electricityKwhPerMonth: 800,
        gasKwhPerMonth: 400,
        dietType: "highMeat",
        shoppingHabit: "heavy",
        recycles: false
      };
      
      const res = calculateFootprint(inputs);
      
      // car: 500 * 52 * 0.18 = 4680
      // transit: 200 * 52 * 0.04 = 416
      // flight: 50 * 120 = 6000
      // transport: 4680 + 416 + 6000 = 11096
      assertEquals(res.transport, 11096, "High-demand transport match");

      // electricity: 800 * 12 * 0.40 = 3840
      // gas: 400 * 12 * 0.18 = 864
      // energy: 3840 + 864 = 4704
      assertEquals(res.energy, 4704, "High-demand energy match");
      
      assertEquals(res.food, 3000, "High-demand meat diet match");
      assertEquals(res.lifestyle, 1000, "High-demand consumerist shopping match");
    });
    
  });
}
