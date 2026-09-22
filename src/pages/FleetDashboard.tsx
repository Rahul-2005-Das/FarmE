import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, MapPin, Package, Route, Truck, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Sidebar } from '../components/ui/Sidebar';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { ShipmentTimeline } from '../components/ShipmentTimeline';
import { LogisticsPlan } from '../types';
import { createOrderLogisticsPlan, loadCurrentLogisticsPlan, loadOrders, saveLogisticsPlan, updateOrderStatus } from '../services/storage';
import { generateLogisticsPlan } from '../services/logisticsEngine';

interface FleetDashboardProps { onNavigate: (route: string) => void; view?: 'dashboard' | 'shipments' | 'active' | 'route' | 'history' | 'emergency' | 'profile'; }

const statusSequence: LogisticsPlan['status'][] = ['Order Confirmed', 'Farmers Grouped', 'Collection Planned', 'Vehicle Assigned', 'Pickup Started', 'Pickup Completed', 'In Transit', 'Near Buyer', 'Delivered'];

export const FleetDashboard: React.FC<FleetDashboardProps> = ({ onNavigate, view = 'dashboard' }) => {
  const [plan, setPlan] = useState<LogisticsPlan>(() => {
    const order = loadOrders()[0];
    return loadCurrentLogisticsPlan() ?? (order ? createOrderLogisticsPlan(order) : generateLogisticsPlan());
  });

  useEffect(() => { saveLogisticsPlan(plan); }, [plan]);

  const statusIndex = statusSequence.indexOf(plan.status);
  const advance = () => {
    const next = Math.min(statusIndex + 1, statusSequence.length - 1);
    const nextStatus = statusSequence[next];
    const orderStatus = nextStatus === 'Delivered' ? 'delivered' : nextStatus === 'In Transit' || nextStatus === 'Near Buyer' ? 'dispatched' : 'confirmed';
    updateOrderStatus(plan.orderId, orderStatus);
    setPlan({ ...plan, status: nextStatus, orderStatus, timeline: plan.timeline.map((event, index) => ({ ...event, completed: index <= next, current: index === next })) });
  };
  const reset = () => {
    updateOrderStatus(plan.orderId, 'confirmed');
    setPlan({ ...plan, status: 'Order Confirmed', orderStatus: 'confirmed', timeline: plan.timeline.map((event, index) => ({ ...event, completed: index === 0, current: index === 0 })) });
  };
  const pickupStops = plan.route.stops.filter((stop) => stop.type === 'farmer');
  const nav = [
    ['fleet-dashboard', 'Dashboard'], ['fleet-shipments', 'Shipments'], ['fleet-active-delivery', 'Active Delivery'],
    ['fleet-route', 'Route'], ['fleet-history', 'History'], ['fleet-emergency', 'Emergency'], ['fleet-profile', 'Profile'],
  ];

  if (view === 'emergency') {
    return <FleetShell currentRoute="fleet-emergency" nav={nav} onNavigate={onNavigate}>
      <Card className="border-2 border-rose-300 bg-rose-50 p-6 space-y-4"><div className="flex items-center gap-3"><AlertTriangle className="text-rose-700" /><div><span className="text-xs font-bold uppercase text-rose-800">Emergency Demo</span><h1 className="text-2xl font-extrabold text-slate-900">Vehicle issue detected</h1></div></div><div className="grid grid-cols-2 gap-3 text-sm"><div><span className="text-slate-500">Shipment</span><strong className="block">{plan.orderId ?? 'KB-1024'}</strong></div><div><span className="text-slate-500">Current route</span><strong className="block">{plan.status}</strong></div></div><p className="text-sm text-rose-900">Request a prototype recovery route or return to the active delivery plan.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={() => onNavigate('fleet-route')} className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-bold text-white">View Recovery Route</button><button type="button" onClick={() => onNavigate('fleet-active-delivery')} className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-bold text-rose-800">Return to Shipment</button></div></Card>
    </FleetShell>;
  }

  if (view === 'profile') return <FleetShell currentRoute="fleet-profile" nav={nav} onNavigate={onNavigate}><Card className="p-6 space-y-3"><h1 className="text-2xl font-extrabold">Fleet Driver Profile</h1><p className="text-sm text-slate-600">Demo Fleet Driver · Driver ID fleet-001</p><p className="text-xs text-slate-500">This is prototype driver identity data.</p></Card></FleetShell>;
  if (view === 'history') return <FleetShell currentRoute="fleet-history" nav={nav} onNavigate={onNavigate}><Card className="p-6 space-y-4"><h1 className="text-2xl font-extrabold">Shipment History</h1><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><div className="rounded-xl border border-slate-200 p-4"><strong>KB-1024 · Tomatoes</strong><p className="text-sm text-slate-600">500 kg · Kolkata Fresh Mart</p><p className="text-xs text-emerald-700 font-bold mt-2">Delivered · Demo completed</p></div><div className="rounded-xl border border-slate-200 p-4"><strong>ORD-7762 · Potato</strong><p className="text-sm text-slate-600">1,200 kg · Bengal Wholesale Hub</p><p className="text-xs text-emerald-700 font-bold mt-2">Delivered · Prototype history</p></div></div></Card></FleetShell>;

  const routeView = view === 'route';
  const activeView = view === 'active' || view === 'shipments' || routeView;
  return <FleetShell currentRoute={routeView ? 'fleet-route' : view === 'shipments' ? 'fleet-shipments' : view === 'active' ? 'fleet-active-delivery' : 'fleet-dashboard'} nav={nav} onNavigate={onNavigate}>
    <div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-900">Fleet Operations · Prototype</span><h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">{routeView ? 'Route Optimization — Prototype Simulation' : activeView ? 'Assigned Shipment' : 'Fleet Driver Dashboard'}</h1><p className="mt-1 text-sm text-slate-500">{plan.orderId ?? 'KB-1024'} · {plan.crop} · {plan.buyerName}</p></div><LanguageSelector variant="compact" /></div>
    {!routeView && <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">{[['Active Deliveries', '1'], ['Today', '2'], ['Utilization', `${plan.vehicle.utilizationPercent}%`], ['Distance', `${plan.route.totalDistanceKm} km`], ['Pending Pickups', `${pickupStops.length}`], ['Completed', plan.status === 'Delivered' ? '1' : '0']].map(([label, value]) => <Card key={label} className="p-4 border border-slate-200"><p className="text-xs text-slate-500">{label}</p><strong className="mt-2 block text-xl font-extrabold text-slate-900">{value}</strong></Card>)}</div>}
    <Card className="border border-slate-200 p-5 space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-800">Assigned Shipment</p><h2 className="text-xl font-extrabold text-slate-900">{plan.orderId ?? 'KB-1024'} · {plan.totalQuantityKg} kg {plan.crop}</h2><p className="text-sm text-slate-600">Vehicle: {plan.vehicle.name} · Capacity {plan.vehicle.capacityKg} kg · {plan.vehicle.utilizationPercent}% utilized</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-900">{plan.status}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-amber-600" style={{ width: `${plan.vehicle.utilizationPercent}%` }} /></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{plan.farmers.map((farmer) => <div key={farmer.id} className="rounded-xl bg-slate-50 p-3 text-sm"><strong>{farmer.name}</strong><p className="text-slate-600">{farmer.quantityKg} kg · {farmer.location}</p></div>)}</div>{routeView && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">{plan.route.stops.map((stop) => stop.name).join(' → ')}<p className="mt-2 text-xs font-normal">{plan.route.totalDistanceKm} km · ETA {plan.deliverySchedule?.estimatedArrival} · Indicative cost ₹{plan.costIntelligence?.totalCost}</p></div>}</Card>
    {!routeView && <Card className="border border-slate-200 p-5 space-y-4"><div className="flex items-center justify-between"><h2 className="font-extrabold text-slate-900">Delivery Workflow</h2><div className="flex gap-2"><button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold">Reset</button><button type="button" onClick={advance} disabled={statusIndex >= statusSequence.length - 1} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Advance demo</button></div></div><ShipmentTimeline events={plan.timeline} /></Card>}
  </FleetShell>;
};

const FleetShell: React.FC<{ children: React.ReactNode; currentRoute: string; nav: string[][]; onNavigate: (route: string) => void }> = ({ children, currentRoute, nav, onNavigate }) => <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8]"><Sidebar currentRoute={currentRoute} onNavigate={onNavigate} fleetNav={nav} /><main className="mx-auto flex-1 max-w-6xl space-y-6 px-4 py-6 sm:px-8 sm:py-8 text-left pb-24">{children}</main></div>;
