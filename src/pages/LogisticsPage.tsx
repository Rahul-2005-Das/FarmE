import React, { useEffect, useState } from 'react';
import { BarChart3, MapPin, Route, Truck, Users, AlertTriangle, CalendarClock, TrendingDown, Percent, PackageCheck, Play, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { MarketNetworkMap } from '../components/MarketNetworkMap';
import { LogisticsPlan } from '../types';
import { generateLogisticsPlan } from '../services/logisticsEngine';
import { createOrderLogisticsPlan, loadLogisticsPlans, loadOrderLogistics, loadOrders, saveLogisticsPlan } from '../services/storage';

interface LogisticsPageProps { onNavigate: (route: string) => void; }

const PlanState: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

export const LogisticsPage: React.FC<LogisticsPageProps> = () => {
  const [plan, setPlan] = useState<LogisticsPlan>(() => {
    const latestOrder = loadOrders()[0];
    return (latestOrder && loadOrderLogistics(latestOrder.id))
      ?? loadLogisticsPlans()[0]
      ?? (latestOrder ? createOrderLogisticsPlan(latestOrder) : generateLogisticsPlan());
  });

  useEffect(() => { saveLogisticsPlan(plan); }, [plan]);

  const routeNames = plan.route.stops.map((stop) => stop.name);
  const statusSequence: LogisticsPlan['status'][] = ['Order Confirmed', 'Farmers Grouped', 'Collection Planned', 'Vehicle Assigned', 'Pickup Started', 'Pickup Completed', 'In Transit', 'Near Buyer', 'Delivered'];
  const currentStatusIndex = statusSequence.indexOf(plan.status);
  const advanceStatus = () => {
    const nextIndex = Math.min(currentStatusIndex + 1, statusSequence.length - 1);
    setPlan({
      ...plan,
      status: statusSequence[nextIndex],
      timeline: plan.timeline.map((event, index) => ({ ...event, completed: index <= nextIndex, current: index === nextIndex })),
    });
  };
  const resetStatus = () => setPlan({
    ...plan,
    status: 'Order Confirmed',
    timeline: plan.timeline.map((event, index) => ({ ...event, completed: index === 0, current: index === 0 })),
  });
  const pooledCost = plan.costIntelligence?.totalCost ?? 0;
  const individualCost = pooledCost + Math.round((plan.savings?.individualDistanceKm ?? 0) * 15) + 1000;
  const poolingSavings = Math.max(0, individualCost - pooledCost);

  return (
    <PlanState>
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8 text-left pb-24">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Smart Logistics Recommendation — Prototype
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Logistics Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Intelligent aggregation and routing simulation.</p>
          </div>
          <LanguageSelector variant="compact" />
        </div>

        <Card className="p-5 border border-emerald-200 bg-emerald-50/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <PackageCheck className="w-6 h-6 text-emerald-700 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Buyer Order → Coordinated Delivery</p>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">{plan.totalQuantityKg} kg {plan.crop} for {plan.buyerName}</h2>
                <p className="text-xs text-slate-600 mt-1">{plan.buyerLocation} · Prototype route pooling logic, not live GPS.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={resetStatus} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button type="button" onClick={advanceStatus} disabled={currentStatusIndex >= statusSequence.length - 1} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                <Play className="w-3.5 h-3.5" /> Advance demo
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-200 pt-3 text-sm">
            <span className="text-slate-600">Current delivery status</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 font-extrabold text-amber-900">{plan.status}</span>
          </div>
        </Card>

        {/* 1. Shipment Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 border border-slate-200">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <div className="text-xl font-extrabold text-slate-900 mt-2">{plan.totalQuantityKg} kg</div>
            <div className="text-xs text-slate-500">Total Produce</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <Users className="w-5 h-5 text-emerald-700" />
            <div className="text-xl font-extrabold text-slate-900 mt-2">{plan.farmers.length}</div>
            <div className="text-xs text-slate-500">Farmers</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <Truck className="w-5 h-5 text-emerald-700" />
            <div className="text-xl font-extrabold text-slate-900 mt-2">1</div>
            <div className="text-xs text-slate-500">Coordinated Shipment</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <Percent className="w-5 h-5 text-emerald-700" />
            <div className="text-xl font-extrabold text-slate-900 mt-2">{plan.vehicle.utilizationPercent}%</div>
            <div className="text-xs text-slate-500">Vehicle Utilization</div>
          </Card>
          <Card className="p-4 border border-slate-200">
            <Route className="w-5 h-5 text-emerald-700" />
            <div className="text-xl font-extrabold text-slate-900 mt-2">{plan.route.stops.filter((stop) => stop.type === 'farmer').length}</div>
            <div className="text-xs text-slate-500">Pickup Stops</div>
          </Card>
        </div>

        {/* 2. Farmer Aggregation */}
        <Card className="p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">Farmer Aggregation</h2>
          </div>
          <div className="space-y-2 text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">
            {plan.farmers.map((f, i) => (
              <div key={i} className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                <span>{f.name}</span>
                <span className="font-bold">{f.quantityKg} kg</span>
              </div>
            ))}
            <div className="flex justify-between font-extrabold text-emerald-900 pt-2 border-t border-slate-300">
              <span>Total Coordinated Shipment</span>
              <span>{plan.totalQuantityKg} kg</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic">Reduces individual transport costs by aggregating partial loads.</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 3. Collection Point */}
          <Card className="p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              <h2 className="font-extrabold text-slate-900">Collection Point</h2>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{plan.collectionPoint.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-slate-500 text-xs">Capacity</p><strong>{plan.collectionPoint.capacityKg} kg</strong></div>
              <div><p className="text-slate-500 text-xs">Required</p><strong>{plan.totalQuantityKg} kg</strong></div>
            </div>
            <p className="text-xs text-slate-500">Suitability Score: <strong className="text-emerald-700">{plan.collectionPoint.suitabilityScore}/100</strong></p>
          </Card>

          {/* 4. Vehicle & Load */}
          <Card className="p-5 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <h2 className="font-extrabold text-slate-900">Vehicle & Load Optimization</h2>
            </div>
            <div className="flex justify-between text-sm">
              <strong>{plan.vehicle.name}</strong>
              <strong>{plan.vehicle.usedKg} / {plan.vehicle.capacityKg} kg</strong>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-700" style={{ width: `${plan.vehicle.utilizationPercent}%` }} />
            </div>
            <p className="text-xs text-slate-500">
              {plan.vehicle.utilizationPercent}% utilized · {plan.vehicle.remainingKg} kg remaining
            </p>
          </Card>
        </div>

        {/* 5. Route Optimization */}
        <Card className="p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">Route Optimization</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h3 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Traditional Route</h3>
              <p className="text-sm font-bold text-slate-800 mb-2">Farmer A → Buyer<br/>Farmer B → Buyer<br/>Farmer C → Buyer</p>
              <p className="text-xs text-slate-500">Combined Distance: <strong>{plan.savings?.individualDistanceKm} km</strong></p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="text-xs font-bold text-emerald-700 mb-2 uppercase tracking-wider">Coordinated Route</h3>
              <div className="flex flex-col gap-1 text-sm font-bold text-emerald-900 mb-2">
                {routeNames.map((name, idx) => (
                  <div key={idx}>{idx + 1}. {name}</div>
                ))}
              </div>
              <p className="text-xs text-emerald-800">Total Distance: <strong>{plan.route.totalDistanceKm} km</strong></p>
            </div>
          </div>
          <p className="text-sm font-bold text-emerald-900 text-center">
            {plan.savings?.distanceReducedPercent}% reduction in total travel distance
          </p>
        </Card>

        <Card className="p-5 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="font-extrabold text-slate-900">Why Route Pooling Helps</h2>
              <p className="text-xs text-slate-500">Illustrative comparison for this prototype order.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Without pooling</h3>
              <p className="text-sm font-bold text-slate-800">{plan.farmers.length} separate pickups · {plan.farmers.length} trips</p>
              <p className="text-sm text-slate-600">Estimated cost: <strong>₹{individualCost}</strong></p>
              <p className="text-xs text-slate-500">Small loads leave capacity unused.</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">With pooling</h3>
              <p className="text-sm font-bold text-emerald-900">1 {plan.vehicle.name} · {plan.farmers.length} coordinated pickups</p>
              <p className="text-sm text-emerald-900">Estimated cost: <strong>₹{pooledCost}</strong></p>
              <p className="text-xs text-emerald-800">Estimated saving: <strong>₹{poolingSavings}</strong> through shared capacity.</p>
            </div>
          </div>
        </Card>

        {/* 6. Delivery Schedule */}
        <Card className="p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">Delivery Schedule (Prototype Estimate)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><p className="text-xs text-slate-500">Pickup Slot</p><strong>{plan.deliverySchedule?.pickupSlot}</strong></div>
            <div><p className="text-xs text-slate-500">Departure</p><strong>{plan.deliverySchedule?.departureTime}</strong></div>
            <div><p className="text-xs text-slate-500">Est. Arrival</p><strong>{plan.deliverySchedule?.estimatedArrival}</strong></div>
            <div><p className="text-xs text-slate-500">Delivery Window</p><strong>{plan.deliverySchedule?.deliveryWindow}</strong></div>
          </div>
        </Card>

        {/* 7. Timeline */}
        <Card className="p-5 border border-slate-200 space-y-3">
          <h2 className="font-extrabold text-slate-900">Logistics Status</h2>
          <ShipmentTimeline events={plan.timeline} />
        </Card>

        {/* 8. Market Network Map */}
        <Card className="p-5 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-slate-900">Market Network Prototype</h2>
          </div>
          <p className="text-xs text-slate-500">Visualizing farmer locations, collection point, and buyer.</p>
          <div className="h-64 sm:h-96 rounded-xl overflow-hidden border border-slate-200">
            <MarketNetworkMap plan={plan} />
          </div>
        </Card>

        {/* 9. Efficiency / Savings */}
        <Card className="p-5 border border-emerald-100 bg-emerald-50/50 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-700" />
            <h2 className="font-extrabold text-emerald-950">Logistics Efficiency Score & Savings</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-emerald-100 text-center">
              <div className="text-4xl font-extrabold text-emerald-700 mb-2">{plan.efficiencyPercent}/100</div>
              <p className="text-xs text-emerald-900 font-bold uppercase tracking-wide">Prototype Efficiency Score</p>
              <div className="mt-3 space-y-1 text-xs text-slate-600 text-left">
                <div className="flex justify-between"><span>Vehicle Utilization</span><span>{plan.efficiencyMetrics?.vehicleUtilization}</span></div>
                <div className="flex justify-between"><span>Route Efficiency</span><span>{plan.efficiencyMetrics?.routeEfficiency}</span></div>
                <div className="flex justify-between"><span>Aggregation</span><span>{plan.efficiencyMetrics?.aggregation}</span></div>
              </div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Illustrative Logistics Cost</h3>
              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between"><span>Base Transport Cost</span><span>₹{plan.costIntelligence?.baseCost}</span></div>
                <div className="flex justify-between"><span>Distance Component</span><span>₹{plan.costIntelligence?.distanceCost}</span></div>
                <div className="flex justify-between text-emerald-700"><span>Load Efficiency Bonus</span><span>₹{plan.costIntelligence?.loadEfficiencyBonus}</span></div>
                <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 mt-2">
                  <span>Total Estimated Cost</span>
                  <span>₹{plan.costIntelligence?.totalCost}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-900 pt-1">
                  <span>Cost per kg</span>
                  <span>₹{plan.costIntelligence?.costPerKg}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-100 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <p>Calculations and AI explanations are strictly deterministic prototype logic. Costs are illustrative and do not reflect live transport market prices.</p>
          </div>
        </Card>
      </div>
    </PlanState>
  );
};
