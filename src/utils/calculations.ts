import { AdminSettings, ConfigState, ServicePackage } from '../types';

export function calculateCosts(config: ConfigState, admin: AdminSettings) {
  // 1. Calculate Technician Hourly Rate
  const dailyRate = (admin.techMonthlySalary + admin.techMonthlyOverhead) / admin.workingDaysPerMonth;
  const hourlyRate = dailyRate / 8;

  // 2. Calculate Total Equipment Maintenance Hours and Fixed Costs per year
  let totalEquipmentHours = 0;
  let fixedEquipmentCost = 0;
  let totalRooms = 0;
  let weightedMultiplierSum = 0;

  config.locations.forEach(loc => {
    const locMultiplier = admin.locationMultiplier[loc.city] || 1.0;
    totalRooms += loc.rooms.length;
    weightedMultiplierSum += loc.rooms.length * locMultiplier;

    loc.rooms.forEach(room => {
      room.equipment.forEach(eq => {
        const item = admin.catalog?.find(c => c.id === eq.catalogId);
        if (!item) return;

        if (item.costType === 'hourly') {
          totalEquipmentHours += item.costValue * eq.quantity;
        } else if (item.costType === 'monthly') {
          fixedEquipmentCost += item.costValue * 12 * eq.quantity;
        } else if (item.costType === 'annual') {
          fixedEquipmentCost += item.costValue * eq.quantity;
        }
      });
    });
  });

  const avgLocMultiplier = totalRooms > 0 ? weightedMultiplierSum / totalRooms : 1.0;

  // 3. Calculate Preventative Visit Hours per year
  // Base hours for a visit + time to check equipment
  const hoursPerVisit = admin.basePreventativeVisitHours + (totalEquipmentHours * 0.2); // Assume checking takes 20% of full maintenance time
  const totalVisits = (config.incidentVisitsPerYear || 0) + (config.proactiveVisitsPerYear || 0);
  const totalVisitHours = totalVisits * hoursPerVisit;

  // 4. Proactive Maintenance & Service Catalog Costs
  let proactiveHours = admin.remoteSupportBaseHours + (totalRooms * admin.remoteSupportHoursPerRoom) + (totalEquipmentHours * 0.05);

  let fixedServiceCost = 0;

  // Add costs from included services in the selected package
  const selectedPkg = admin.servicePackages?.find(p => p.id === config.servicePackage);
  if (selectedPkg && selectedPkg.includedServices) {
    selectedPkg.includedServices.forEach(srvId => {
      const item = admin.catalog?.find(c => c.id === srvId);
      if (!item) return;

      if (item.costType === 'hourly') {
        proactiveHours += item.costValue; // Add to proactive/service hours
      } else if (item.costType === 'monthly') {
        fixedServiceCost += item.costValue * 12;
      } else if (item.costType === 'annual') {
        fixedServiceCost += item.costValue;
      } else if (item.costType === 'per_unit') {
        fixedServiceCost += item.costValue * (item.unitCount || 1);
      }
    });
  }

  // 5. Total Hours
  const totalAnnualHours = totalEquipmentHours + totalVisitHours + proactiveHours;

  // 8. Logistics Cost (Fuel & Parking)
  const fuelCost = admin.fuelCostPerVisit || 0;
  const parkingCost = admin.parkingCostPerVisit || 0;
  const totalLogisticsCost = totalVisits * (fuelCost + parkingCost);

  // 9. Base Cost
  const laborCost = totalAnnualHours * hourlyRate * avgLocMultiplier;
  const annualBaseCost = laborCost + totalLogisticsCost + fixedEquipmentCost + fixedServiceCost;

  // 10. Apply Markup
  const markupMultiplier = 1 + admin.markupPercentage / 100;
  const annualPrice = annualBaseCost * markupMultiplier;

  // 11. Billing Cycle Breakdown
  let periodicPrice = annualPrice;
  if (config.billingCycle === 'Aylık') periodicPrice = annualPrice / 12;
  if (config.billingCycle === 'Üç Aylık') periodicPrice = annualPrice / 4;

  return {
    hourlyRate,
    totalAnnualHours,
    annualBaseCost,
    annualPrice,
    periodicPrice,
    breakdown: {
      equipmentHours: totalEquipmentHours,
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
