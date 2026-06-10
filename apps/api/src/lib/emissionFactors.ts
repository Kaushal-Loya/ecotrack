/**
 * Emission factor coefficients used for footprint calculation.
 *
 * Sources:
 *  - Transport & energy: DEFRA 2023 Greenhouse Gas Conversion Factors
 *    https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2023
 *  - Diet: IPCC AR6 (2022)
 *    https://www.ipcc.ch/report/ar6/
 *  - Shopping: WRAP / industry estimates
 *
 * All values are in kg CO₂ per unit as noted.
 */

/** Transport — kg CO₂ per km */
export const TRANSPORT_FACTORS = {
  /** Petrol/diesel average car */
  carPerKm: 0.192,
  /** Average bus (per passenger km) */
  busPerKm: 0.089,
  /** Average train (per passenger km) */
  trainPerKm: 0.041,
  /** Aviation (per passenger km, all-haul average including radiative forcing) */
  flightPerKm: 0.225,
} as const;

/** Diet — kg CO₂ per meal */
export const DIET_FACTORS = {
  beefPerMeal: 6.61,
  otherMeatPerMeal: 1.36,
  vegetarianPerMeal: 0.44,
} as const;

/** Energy — kg CO₂ per kWh */
export const ENERGY_FACTORS = {
  electricityPerKwh: 0.233,
  naturalGasPerKwh: 0.203,
} as const;

/** Shopping — kg CO₂ per item */
export const SHOPPING_FACTORS = {
  clothingPerItem: 10.5,
  onlineOrderPerItem: 0.44,
} as const;
