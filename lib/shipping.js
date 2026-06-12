export const GOVERNORATE_RATES = {
  cairo: { name: "Cairo", base: 75, extraKg: 10 },
  giza: { name: "Giza", base: 75, extraKg: 10 },
  alexandria: { name: "Alexandria", base: 95, extraKg: 12 },
  dakahlia: { name: "Dakahlia", base: 110, extraKg: 15 },
  gharbia: { name: "Gharbia", base: 110, extraKg: 15 },
  monufia: { name: "Monufia", base: 110, extraKg: 15 },
  qalyubia: { name: "Qalyubia", base: 95, extraKg: 12 },
  beheira: { name: "Beheira", base: 110, extraKg: 15 },
  damietta: { name: "Damietta", base: 110, extraKg: 15 },
  kafr_el_sheikh: { name: "Kafr El Sheikh", base: 110, extraKg: 15 },
  sharqia: { name: "Sharqia", base: 110, extraKg: 15 },
  port_said: { name: "Port Said", base: 120, extraKg: 18 },
  ismailia: { name: "Ismailia", base: 120, extraKg: 18 },
  suez: { name: "Suez", base: 120, extraKg: 18 },
  fayoum: { name: "Fayoum", base: 130, extraKg: 18 },
  beni_suef: { name: "Beni Suef", base: 130, extraKg: 18 },
  minya: { name: "Minya", base: 130, extraKg: 18 },
  assiut: { name: "Assiut", base: 135, extraKg: 18 },
  sohag: { name: "Sohag", base: 135, extraKg: 18 },
  qena: { name: "Qena", base: 140, extraKg: 20 },
  luxor: { name: "Luxor", base: 140, extraKg: 20 },
  aswan: { name: "Aswan", base: 145, extraKg: 20 },
  red_sea: { name: "Red Sea", base: 150, extraKg: 22 },
  new_valley: { name: "New Valley", base: 160, extraKg: 25 },
  matrouh: { name: "Matrouh", base: 150, extraKg: 22 },
  north_sinai: { name: "North Sinai", base: 160, extraKg: 25 },
  south_sinai: { name: "South Sinai", base: 160, extraKg: 25 }
};

export function calculateFedExShipping(cartItems, governorateKey) {
  const rateCard = GOVERNORATE_RATES[governorateKey];
  if (!rateCard || cartItems.length === 0) return { totalShipping: 0, billableWeight: 0 };

  let totalActualWeight = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalThickness = 0;

  cartItems.forEach((item) => {
    const w = Number(item.width_cm || 30);
    const h = Number(item.height_cm || 40);
    const d = Number(item.depth_cm || 4);
    const itemWeight = Number(item.weight_kg || 2);

    totalActualWeight += itemWeight;
    if (w > maxLength) maxLength = w;
    if (h > maxWidth) maxWidth = h;
    totalThickness += d;
  });

  const finalLength = maxLength + 3;
  const finalWidth = maxWidth + 3;
  const finalHeight = totalThickness + 3;

  const volumetricWeight = (finalLength * finalWidth * finalHeight) / 5000;
  const billableWeight = Math.ceil(Math.max(totalActualWeight, volumetricWeight));

  const baseCost = rateCard.base + (billableWeight - 1) * rateCard.extraKg;
  const withFuel = baseCost * 1.18;
  const withVAT = withFuel * 1.14;

  return {
    totalShipping: Math.round(withVAT * 1.03),
    billableWeight,
    boxDimensions: { length: finalLength, width: finalWidth, height: finalHeight }
  };
}
