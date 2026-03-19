import { AdminSettings, ConfigState, ServicePackage, AddonDetail, GeneralSettings } from '../types';

export function calculateCosts(config: ConfigState, admin: AdminSettings, general: GeneralSettings) {
  // 1. Calculate Technician Hourly Rate
  const dailyRate = (general.techMonthlySalary + general.techMonthlyOverhead) / general.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  // 2. Calculate Total Equipment Maintenance Hours and Fixed Costs per year
  let totalEquipmentHours = 0;
  let fixedEquipmentCost = 0;
  let totalDevices = 0;
  let weightedMultiplierSum = 0;
  let rawTotalEquipmentHours = 0;

  config.locations.forEach(loc => {
    const locMultiplier = general.locationMultiplier[loc.city] || 1.0;
    
    let locEqHours = 0;
    let locDeviceCount = 0;

    // Zebra uses direct equipment list on location
    (loc.equipment || []).forEach(eq => {
      const item = admin.catalog?.find(c => c.id === eq.catalogId);
      if (!item) return;

      locDeviceCount += eq.quantity;

      if (item.costType === 'hourly') {
        locEqHours += item.costValue * eq.quantity;
      } else if (item.costType === 'monthly') {
        fixedEquipmentCost += item.costValue * 12 * eq.quantity;
      } else if (item.costType === 'annual') {
        fixedEquipmentCost += item.costValue * eq.quantity;
      }
    });

    totalDevices += locDeviceCount;
    weightedMultiplierSum += locDeviceCount * locMultiplier;
    rawTotalEquipmentHours += locEqHours;

    // Apply Economy of Scale discount to this location's equipment hours based on device count
    let scaleMultiplier = 1.0;
    if (admin.scaleDiscountThreshold && admin.scaleDiscountThreshold > 0 && locDeviceCount > admin.scaleDiscountThreshold) {
      const extraDevices = locDeviceCount - admin.scaleDiscountThreshold;
      let discount = extraDevices * (admin.scaleDiscountRatePerRoom || 0); // Using same field name for per-unit discount
      if (admin.scaleMaxDiscount && discount > admin.scaleMaxDiscount) {
        discount = admin.scaleMaxDiscount;
      }
      scaleMultiplier = Math.max(0.1, 1 - (discount / 100)); 
    }

    totalEquipmentHours += (locEqHours * scaleMultiplier);
  });

  const scaleDiscountHours = rawTotalEquipmentHours - totalEquipmentHours;
  const avgLocMultiplier = totalDevices > 0 ? weightedMultiplierSum / totalDevices : 1.0;

  // 3. Calculate Preventative Visit Hours per year
  const hoursPerVisit = admin.basePreventativeVisitHours + (totalEquipmentHours * 0.1); // Slightly lower overhead for Zebra checkups
  const totalVisits = (config.incidentVisitsPerYear || 0) + (config.proactiveVisitsPerYear || 0);
  const totalVisitHours = totalVisits * hoursPerVisit;

  // 4. Proactive Maintenance & Service Catalog Costs
  // For Zebra, we use totalDevices instead of totalRooms for overhead
  let proactiveHours = admin.remoteSupportBaseHours + (totalDevices * (admin.remoteSupportHoursPerRoom || 0.05)) + (totalEquipmentHours * 0.05);
  let fixedServiceCost = 0;

  // 4b. Add-on Services ("toppings")
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
  const totalLogisticsCost = totalVisits * ((general.fuelCostPerVisit || 0) + (general.parkingCostPerVisit || 0));

  // 9. Base Cost
  const laborCost = totalAnnualHours * hourlyRate * avgLocMultiplier;
  const annualBaseCost = laborCost + totalLogisticsCost + fixedEquipmentCost + fixedServiceCost + totalAddonBaseCost;

  // 10. Apply Markup
  const annualPrice = annualBaseCost * markupMultiplier;

  // 10.5 Ad-hoc Price
  const adhocMarkupMultiplier = 1 + (admin.adhocMarkupPercentage || 100) / 100;
  let adhocAnnualPrice = 0;
  
  if (admin.adhocCalculationMethod === 'fixed_visit') {
    adhocAnnualPrice = (totalVisits * (admin.fixedPerCallPrice || 0)) + (totalAddonBaseCost * adhocMarkupMultiplier);
  } else {
    adhocAnnualPrice = annualBaseCost * adhocMarkupMultiplier;
  }

  // 11. Billing Cycle Breakdown
  const cycleMultiplier = general.billingCycleMultiplier?.[config.billingCycle] || 1.0;
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
      equipmentCost: (totalEquipmentHours * hourlyRate * avgLocMultiplier + fixedEquipmentCost) * markupMultiplier,
      visitCost: totalVisitHours * hourlyRate * avgLocMultiplier * markupMultiplier,
      proactiveCost: (proactiveHours * hourlyRate * avgLocMultiplier + fixedServiceCost) * markupMultiplier,
      logisticsCost: totalLogisticsCost * markupMultiplier,
      addonCost: totalAddonBaseCost * markupMultiplier,
      addonDetails
    }
  };
}

export function calculatePackageCost(config: ConfigState, admin: AdminSettings, pkgId: ServicePackage, general: GeneralSettings) {
  const tempConfig = { ...config };
  const packages = admin.servicePackages || [];
  const pkg = packages.find(p => p.id === pkgId);
  if (pkg) {
    tempConfig.servicePackage = pkgId;
    tempConfig.incidentVisitsPerYear = pkg.incidentVisits;
    tempConfig.proactiveVisitsPerYear = pkg.proactiveVisits;
  }
  return calculateCosts(tempConfig, admin, general);
}
