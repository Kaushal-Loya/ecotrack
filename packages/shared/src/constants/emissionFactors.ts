export const TRANSPORT_FACTORS = {
  carPerKm: 0.192,
  busPerKm: 0.089,
  trainPerKm: 0.041,
  flightPerKm: 0.225,
} as const;

export const DIET_FACTORS = {
  beefPerMeal: 6.61,
  otherMeatPerMeal: 1.36,
  vegetarianPerMeal: 0.44,
} as const;

export const ENERGY_FACTORS = {
  electricityPerKwh: 0.233,
  naturalGasPerKwh: 0.203,
} as const;

export const SHOPPING_FACTORS = {
  clothingPerItem: 10.5,
  onlineOrderPerItem: 0.44,
} as const;
