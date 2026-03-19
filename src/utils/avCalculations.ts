import { AdminSettings, ConfigState, ServicePackage, AddonDetail } from '../types';

export function calculateCosts(config: ConfigState, admin: AdminSettings) {
  // 1. Calculate Technician Hourly Rate
  const dailyRate = (admin.techMonthlySalary + admin.techMonthlyOverhead) / admin.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  // 2. Calculate Total Equipment Maintenance Hours and Fixed Costs per year
  let totalEquipmentHours = 0;
  let fixedEquipmentCost = 0;
  let totalRooms = 0;
  let weightedMultiplierSum = 0;
  let rawTotalEquipmentHours = 0;

  config.locations.forEach(loc => {
    const locMultiplier = admin.locationMultiplier[loc.city] || 1.0;
    totalRooms += loc.rooms.length;
    weightedMultiplierSum += loc.rooms.length * locMultiplier;

    let locEqHours = 0;
    loc.rooms.forEach(room => {
      room.equipment.forEach(eq => {
        const item = admin.catalog?.find(c => c.id === eq.catalogId);
        if (!item) return;

        if (item.costType === 'hourly') {
          locEqHours += item.costValue * eq.quantity;
        } else if (item.costType === 'monthly') {
          fixedEquipmentCost += item.costValue * 12 * eq.quantity;
        } else if (item.costType === 'annual') {
          fixedEquipmentCost += item.costValue * eq.quantity;
        }
      });
    });

    rawTotalEquipmentHours += locEqHours;

    // Apply Economy of Scale discount to this location's equipment hours
    let scaleMultiplier = 1.0;
    if (admin.scaleDiscountThreshold && admin.scaleDiscountThreshold > 0 && loc.rooms.length > admin.scaleDiscountThreshold) {
      const extraRooms = loc.rooms.length - admin.scaleDiscountThreshold;
      let discount = extraRooms * (admin.scaleDiscountRatePerRoom || 0);
      if (admin.scaleMaxDiscount && discount > admin.scaleMaxDiscount) {
        discount = admin.scaleMaxDiscount;
      }
      scaleMultiplier = Math.max(0.1, 1 - (discount / 100)); // Max 90% discount safety limit
    }

    totalEquipmentHours += (locEqHours * scaleMultiplier);
  });

  const scaleDiscountHours = rawTotalEquipmentHours - totalEquipmentHours;

  const avgLocMultiplier = totalRooms > 0 ? weightedMultiplierSum / totalRooms : 1.0;

  // 3. Calculate Preventative Visit Hours per year
  // Base hours for a visit + time to check equipment
  const hoursPerVisit = admin.basePreventativeVisitHours + (totalEquipmentHours * 0.2); // Assume checking takes 20% of full maintenance time
  const totalVisits = (config.incidentVisitsPerYear || 0) + (config.proactiveVisitsPerYear || 0);
  const totalVisitHours = totalVisits * hoursPerVisit;

  // 4. Proactive Maintenance & Service Catalog Costs
  let proactiveHours = admin.remoteSupportBaseHours + (totalRooms * admin.remoteSupportHoursPerRoom) + (totalEquipmentHours * 0.05);
  let fixedServiceCost = 0;

  // 4b. Add-on Services ("toppings") - Separated for breakdown visibility
  let totalAddonBaseCost = 0;
  const addonDetails: AddonDetail[] = [];
  const markupMultiplier = 1 + admin.markupPercentage / 100;

  const selectedAddons = config.selectedAddons || [];
  selectedAddons.forEach(addon => {
    const item = admin.catalog?.find(c => c.id === addon.id);
    if (!item) return;

    const qty = addon.quantity || 1;
    let addonBaseCost = 0;

    if (item.costType === 'hourly') {
      addonBaseCost = item.costValue * qty * hourlyRate * avgLocMultiplier;
    } else if (item.costType === 'monthly') {
      addonBaseCost = item.costValue * 12 * qty;
    } else if (item.costType === 'annual') {
      addonBaseCost = item.costValue * qty;
    } else if (item.costType === 'per_unit') {
      addonBaseCost = item.costValue * (item.unitCount || 1) * qty;
    }

    totalAddonBaseCost += addonBaseCost;
    
    addonDetails.push({
      id: item.id,
      name: item.name,
      quantity: qty,
      cost: addonBaseCost,
      price: addonBaseCost * markupMultiplier
    });
  });

  // 5. Total Hours
  const totalAnnualHours = totalEquipmentHours + totalVisitHours + proactiveHours;

  // 8. Logistics Cost (Fuel & Parking)
  const fuelCost = admin.fuelCostPerVisit || 0;
  const parkingCost = admin.parkingCostPerVisit || 0;
  const totalLogisticsCost = totalVisits * (fuelCost + parkingCost);

  // 9. Base Cost
  const laborCost = totalAnnualHours * hourlyRate * avgLocMultiplier;
  const annualBaseCost = laborCost + totalLogisticsCost + fixedEquipmentCost + fixedServiceCost + totalAddonBaseCost;

  // 10. Apply Markup
  const annualPrice = annualBaseCost * markupMultiplier;

  // 10.5 Ad-hoc Price
  const adhocMarkupMultiplier = 1 + (admin.adhocMarkupPercentage || 100) / 100;
  let adhocAnnualPrice = 0;
  
  if (admin.adhocCalculationMethod === 'fixed_visit') {
    // Fixed visit fee for visits + add-on costs with ad-hoc markup
    adhocAnnualPrice = (totalVisits * (admin.fixedPerCallPrice || 0)) + (totalAddonBaseCost * adhocMarkupMultiplier);
  } else {
    // Markup based logic: apply ad-hoc markup to all base costs
    adhocAnnualPrice = annualBaseCost * adhocMarkupMultiplier;
  }

  // 11. Billing Cycle Breakdown
  const cycleMultiplier = admin.billingCycleMultiplier?.[config.billingCycle] || 1.0;
  const finalAnnualPrice = annualPrice * cycleMultiplier;

  let periodicPrice = finalAnnualPrice;
  if (config.billingCycle === 'Aylık') periodicPrice = finalAnnualPrice / 12;
  if (config.billingCycle === 'Üç Aylık') periodicPrice = finalAnnualPrice / 4;

  return {
    hourlyRate,
    totalAnnualHours,
    annualBaseCost,
    annualPrice: finalAnnualPrice,
    periodicPrice,
    adhocAnnualPrice,
    breakdown: {
      equipmentHours: totalEquipmentHours,
      scaleDiscountHours,
      visitHours: totalVisitHours,
      proactiveHours,
      totalLogisticsCost,
      fixedEquipmentCost,
      fixedServiceCost,
      // Costs including markup
      equipmentCost: (totalEquipmentHours * hourlyRate * avgLocMultiplier + fixedEquipmentCost) * markupMultiplier,
      visitCost: totalVisitHours * hourlyRate * avgLocMultiplier * markupMultiplier,
      proactiveCost: (proactiveHours * hourlyRate * avgLocMultiplier + fixedServiceCost) * markupMultiplier,
      logisticsCost: totalLogisticsCost * markupMultiplier,
      // Add-on specific
      addonCost: totalAddonBaseCost * markupMultiplier,
      addonDetails
    }
  };
}

export function calculatePackageCost(config: ConfigState, admin: AdminSettings, pkgId: ServicePackage) {
  const tempConfig = { ...config };
  const packages = admin.servicePackages || [];
  const pkg = packages.find(p => p.id === pkgId);
  if (pkg) {
    tempConfig.servicePackage = pkgId;
    tempConfig.incidentVisitsPerYear = pkg.incidentVisits;
    tempConfig.proactiveVisitsPerYear = pkg.proactiveVisits;
  }
  return calculateCosts(tempConfig, admin);
}
