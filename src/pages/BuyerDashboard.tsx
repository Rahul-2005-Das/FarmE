import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Sidebar } from '../components/ui/Sidebar';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import {
  DEMO_CROPS,
  DEMO_ORDERS,
  WB_DISTRICTS
} from '../data/mockData';
import { createOrderLogisticsPlan, loadOrders, saveOrders, saveLogisticsPlan } from '../services/storage';
import { CropListing, Order } from '../types';
import {
  Search,
  Users,
  ClipboardList,
  Truck,
  Filter,
  DollarSign
} from 'lucide-react';

interface BuyerDashboardProps {
  onNavigate: (route: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { language } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCropCategory, setSelectedCropCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState<CropListing | null>(() => {
    try {
      const stored = sessionStorage.getItem('krishok_bandhu_selected_crop');
      if (!stored) return null;
      const selected = JSON.parse(stored) as CropListing;
      return DEMO_CROPS.find((crop) => crop.id === selected.id) ?? selected;
    } catch {
      return null;
    }
  });
  const [orderQuantity, setOrderQuantity] = useState('100');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = loadOrders();
    return saved.length ? saved : DEMO_ORDERS;
  });

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  useEffect(() => {
    if (selectedCrop) sessionStorage.removeItem('krishok_bandhu_selected_crop');
  }, [selectedCrop]);

  const buyerBusiness = (currentUser as any)?.businessName || 'Kolkata Fresh Mart';

  const popularCrops = [
    { id: 'Tomato', label: language === 'bn' ? 'টমেটো' : 'Tomato', emoji: '🍅' },
    { id: 'Potato', label: language === 'bn' ? 'আলু' : 'Potato', emoji: '🥔' },
    { id: 'Onion', label: language === 'bn' ? 'পেঁয়াজ' : 'Onion', emoji: '🧅' },
    { id: 'Brinjal', label: language === 'bn' ? 'বেগুন' : 'Brinjal', emoji: '🍆' },
    { id: 'Cabbage', label: language === 'bn' ? 'বাঁধাকপি' : 'Cabbage', emoji: '🥬' },
    { id: 'Rice', label: language === 'bn' ? 'চাল/ধান' : 'Rice', emoji: '🌾' },
  ];

  // Filter crops based on search & district
  const filteredCrops = DEMO_CROPS.filter((c) => {
    const matchQuery =
      c.cropNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cropNameBn.includes(searchQuery) ||
      c.farmerDistrict.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchDistrict = selectedDistrict === 'All' || c.farmerDistrict === selectedDistrict;
    const matchCategory = selectedCropCategory === 'All' || c.cropNameEn.toLowerCase().includes(selectedCropCategory.toLowerCase());

    return matchQuery && matchDistrict && matchCategory;
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop) return;

    const qty = parseInt(orderQuantity) || 100;
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      cropListingId: selectedCrop.id,
      cropNameBn: selectedCrop.cropNameBn,
      cropNameEn: selectedCrop.cropNameEn,
      quantityKg: qty,
      agreedPricePerKg: selectedCrop.expectedPricePerKg,
      totalAmount: qty * selectedCrop.expectedPricePerKg,
      buyerId: currentUser?.id || 'b-201',
      buyerName: buyerBusiness,
      farmerId: selectedCrop.farmerId,
      farmerName: selectedCrop.farmerName,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0],
      deliveryDate: 'In 3 days',
      pickupLocation: `${selectedCrop.farmerVillage}, ${selectedCrop.farmerDistrict}`,
      destinationLocation: 'Posta Mandi, Kolkata',
      allocationLines: [
        {
          buyerId: currentUser?.id || 'b-201',
          buyerName: buyerBusiness,
          quantityKg: qty,
          pricePerKg: selectedCrop.expectedPricePerKg,
        },
      ],
    };

    const nextOrders = [newOrder, ...orders.filter((item) => item.id !== newOrder.id)];
    setOrders(nextOrders);

    saveLogisticsPlan(createOrderLogisticsPlan(newOrder));

    setOrderSuccess(true);
    setTimeout(() => {
      setOrderSuccess(false);
      setSelectedCrop(null);
      onNavigate('buyer-orders');
    }, 1500);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
      {/* 1. DESKTOP DEEP-GREEN SIDEBAR */}
      <Sidebar
        currentRoute="buyer-dashboard"
        onNavigate={onNavigate}
      />

      {/* 2. MAIN BUYER CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-6 text-left">
        {/* Top Greeting & Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
              {language === 'bn' ? 'ক্রেতা পোর্টাল' : language === 'hi' ? 'खरीदार डैशबोर्ड' : 'Buyer Dashboard'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
              {language === 'bn' ? `স্বাগতম, ${buyerBusiness}` : language === 'hi' ? `स्वागत है, ${buyerBusiness}` : `Welcome, ${buyerBusiness}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'bn' ? 'সরাসরি কৃষকদের কাছ থেকে তাজা ফসল সংগ্রহ করুন' : language === 'hi' ? 'किसानों से सीधे ताजा उपज प्राप्त करें' : 'Find fresh produce directly from farmers'}
            </p>
          </div>

          <LanguageSelector variant="compact" />
        </div>

        {/* Search Bar matching Panel 7 */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'bn' ? 'ফসল, কৃষক বা জেলার নাম দিয়ে খুঁজুন...' : language === 'hi' ? 'फसल, किसान या स्थान खोजें...' : 'Search for crops, farmers or location...'}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* 4 Key Metrics matching Panel 7 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 sm:p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase text-slate-500">
                {language === 'bn' ? 'সক্রিয় অর্ডার' : language === 'hi' ? 'सक्रिय ऑर्डर' : 'Active Orders'}
              </span>
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {orders.length}
            </div>
            <p className="text-[11px] text-blue-700 font-semibold">
              {language === 'bn' ? 'চলতি ডেলিভারি' : language === 'hi' ? 'डिलीवरी जारी' : 'In fulfillment'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase text-slate-500">
                {language === 'bn' ? 'মোট সরবরাহকারী' : language === 'hi' ? 'कुल आपूर्तिकर्ता' : 'Total Suppliers'}
              </span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              12
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold">
              {language === 'bn' ? 'যাচাইকৃত কৃষক' : language === 'hi' ? 'सत्यापित किसान' : 'Verified farmers'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase text-slate-500">
                {language === 'bn' ? 'আসন্ন ডেলিভারি' : language === 'hi' ? 'आगामी डिलीवरी' : 'Pending Delivery'}
              </span>
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              3
            </div>
            <p className="text-[11px] text-amber-700 font-semibold">
              {language === 'bn' ? 'আগামী ৩ দিনের মধ্যে' : language === 'hi' ? '3 दिनों के भीतर' : 'Within 3 days'}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase text-slate-500">
                {language === 'bn' ? 'চলতি মাসের ব্যয়' : language === 'hi' ? 'इस महीने का खर्च' : 'This Month Spend'}
              </span>
              <DollarSign className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ₹ 48,000
            </div>
            <p className="text-[11px] text-purple-700 font-semibold">
              {language === 'bn' ? 'সরাসরি সঞ্চয় ১৫%' : language === 'hi' ? '15% प्रत्यक्ष बचत' : '15% direct savings'}
            </p>
          </Card>
        </div>

        {/* Popular Crops Chips matching Panel 7 */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'bn' ? 'জনপ্রিয় ফসল' : 'Popular Crops'}
            </h3>
            {selectedCropCategory !== 'All' && (
              <button
                onClick={() => setSelectedCropCategory('All')}
                className="text-xs text-blue-700 font-bold hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'সব দেখুন' : 'Show All'}
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {popularCrops.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCropCategory(selectedCropCategory === c.id ? 'All' : c.id)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-2xs ${
                  selectedCropCategory === c.id
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-xs font-semibold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Produce Listing & District Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-extrabold text-base text-slate-900">
              {language === 'bn' ? 'সরাসরি খামার সরবরাহ' : 'Live Farm Supply Listings'} ({filteredCrops.length})
            </h3>

            {/* District Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 outline-none"
              >
                <option value="All">{language === 'bn' ? 'সব জেলা' : 'All Districts'}</option>
                {WB_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of Produce Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCrops.map((item) => (
              <Card key={item.id} className="p-5 border border-slate-200 hover:border-emerald-500 transition-all space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl shrink-0">
                      {item.cropNameEn === 'Tomato' ? '🍅' : item.cropNameEn === 'Potato' ? '🥔' : item.cropNameEn === 'Rice' ? '🌾' : '🥬'}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900">
                        {language === 'bn' ? item.cropNameBn : item.cropNameEn}
                      </h4>
                      <p className="text-xs text-slate-500">
                        👨🌾 {item.farmerName} • 📍 {item.farmerVillage}, {item.farmerDistrict}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.qualityGrade}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 font-medium">
                  <div>
                    <span className="text-slate-400 block">{language === 'bn' ? 'উপলব্ধ পরিমাণ' : 'Available'}</span>
                    <strong className="text-slate-900 text-sm font-extrabold">{item.quantityKg} kg</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{language === 'bn' ? 'প্রত্যাশিত দর' : 'Price'}</span>
                    <strong className="text-emerald-800 text-base font-extrabold">₹{item.expectedPricePerKg} / kg</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'bn' ? 'তোলার তারিখ:' : 'Ready:'} {item.harvestDate}</span>
                  </div>

                  <button
                    onClick={() => setSelectedCrop(item)}
                    className="px-4 py-2 rounded-xl bg-[#0F3E26] hover:bg-[#165636] active:scale-95 text-white font-bold text-xs shadow-2xs transition-transform cursor-pointer"
                  >
                    {language === 'bn' ? 'বুকিং করুন' : 'Place Order'} →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Order Booking Modal */}
      <Modal
        isOpen={!!selectedCrop}
        onClose={() => setSelectedCrop(null)}
        title={language === 'bn' ? 'ফসল বুকিং নিশ্চিত করুন' : 'Confirm Produce Booking'}
        maxWidth="md"
      >
        {selectedCrop && (
          <form onSubmit={handlePlaceOrder} className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900 text-sm">
                {language === 'bn' ? selectedCrop.cropNameBn : selectedCrop.cropNameEn} ({selectedCrop.qualityGrade})
              </div>
              <p className="text-slate-500">কৃষক: {selectedCrop.farmerName} • 📍 {selectedCrop.farmerDistrict}</p>
              <p className="text-emerald-800 font-bold">দর: ₹{selectedCrop.expectedPricePerKg} / কেজি</p>
            </div>

            <Input
              label={language === 'bn' ? 'অর্ডার পরিমাণ (কেজি)' : 'Order Quantity (kg)'}
              type="number"
              min="50"
              max={selectedCrop.quantityKg}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
              required
            />

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex justify-between items-center font-bold">
              <span>{language === 'bn' ? 'মোট প্রদেয় মূল্য:' : 'Total Amount:'}</span>
              <span className="text-emerald-900 text-base">
                ₹{(parseInt(orderQuantity) || 0) * selectedCrop.expectedPricePerKg}
              </span>
            </div>

            {orderSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 text-center">
                ✓ {language === 'bn' ? 'অর্ডার সফলভাবে নিশ্চিত হয়েছে!' : 'Order successfully placed!'}
              </div>
            )}

            <Button variant="farmer" size="lg" fullWidth type="submit">
              {language === 'bn' ? 'অর্ডার নিশ্চিত করুন' : 'Confirm Order'}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
