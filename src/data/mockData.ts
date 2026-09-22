import {
  CropListing,
  Order,
  MarketPrice,
  AIAdvice,
  FarmerProfile,
  BuyerProfile,
  BuyerRequirement,
  SupplyDemandSnapshot,
} from '../types';

export const WB_DISTRICTS = [
  'South 24 Parganas',
  'North 24 Parganas',
  'Hooghly',
  'Nadia',
  'Purba Bardhaman',
  'Paschim Bardhaman',
  'Bankura',
  'Purulia',
  'Murshidabad',
  'Birbhum',
  'Howrah',
  'Malda',
  'Jalpaiguri',
  'Darjeeling',
  'Cooch Behar'
];

export const DEMO_FARMER: FarmerProfile = {
  id: 'f-101',
  name: 'Ramesh Mondal',
  mobile: '9830123456',
  role: 'farmer',
  language: 'bn',
  district: 'South 24 Parganas',
  subdivision: 'Baruipur',
  village: 'Champahati Gram Panchayat',
  pinCode: '743330',
  farmSizeAcres: 2.5,
  primaryCrops: ['টমেটো (Tomato)', 'আলু (Potato)', 'বেগুন (Brinjal)'],
  kisanCreditCard: true,
  createdAt: '2026-01-10'
};

export const DEMO_BUYERS: BuyerProfile[] = [
  {
    id: 'b-201',
    name: 'Amitabh Sen',
    businessName: 'Kolkata Fresh Mart',
    buyerType: 'Wholesaler',
    mobile: '9831987654',
    role: 'buyer',
    language: 'en',
    district: 'Kolkata',
    address: 'Posta Wholesale Mandi, Burrabazar, Kolkata - 700007',
    deliveryPreference: 'Central Hub Delivery',
    tradeLicenseNumber: 'WB/KOL/WHL/2024/8891',
    createdAt: '2025-11-20'
  },
  {
    id: 'b-202',
    name: 'Priyanka Das',
    businessName: 'Restaurant FreshBox',
    buyerType: 'Restaurant',
    mobile: '9830765432',
    role: 'buyer',
    language: 'en',
    district: 'North 24 Parganas',
    address: 'Sector V, Salt Lake Electronics Complex, Kolkata - 700091',
    deliveryPreference: 'Direct Farm Pickup',
    tradeLicenseNumber: 'WB/SL/REST/2025/1102',
    createdAt: '2026-02-05'
  },
  {
    id: 'b-203',
    name: 'Suman Mukherjee',
    businessName: 'Bengal Wholesale Hub',
    buyerType: 'Institutional Buyer',
    mobile: '9748234567',
    role: 'buyer',
    language: 'en',
    district: 'Howrah',
    address: 'NH-6 Highway Agro Hub, Dhulagarh, Howrah - 711302',
    deliveryPreference: 'Mandi Pickup',
    tradeLicenseNumber: 'WB/HWH/INST/2023/4521',
    createdAt: '2025-08-14'
  }
];

export const DEMO_CROPS: CropListing[] = [
  {
    id: 'crop-1',
    farmerId: 'f-101',
    farmerName: 'Ramesh Mondal',
    farmerVillage: 'Champahati',
    farmerDistrict: 'South 24 Parganas',
    farmerMobile: '9830123456',
    cropNameBn: 'টমেটো',
    cropNameEn: 'Tomato',
    category: 'Vegetables',
    variety: 'Hybrid Pusa Ruby',
    quantityKg: 500,
    qualityGrade: 'Grade A',
    harvestDate: '4 days (৪ দিন বাকি)',
    expectedPricePerKg: 35,
    minimumOfferPrice: 32,
    status: 'active',
    verifiedByFPO: true
  },
  {
    id: 'crop-2',
    farmerId: 'f-102',
    farmerName: 'Subhash Barman',
    farmerVillage: 'Singur',
    farmerDistrict: 'Hooghly',
    farmerMobile: '9832221100',
    cropNameBn: 'আলু (জ্যোতি)',
    cropNameEn: 'Potato (Jyoti)',
    category: 'Vegetables',
    variety: 'Jyoti New Harvest',
    quantityKg: 2400,
    qualityGrade: 'Grade A',
    harvestDate: 'Ready (তোলা সম্পন্ন)',
    expectedPricePerKg: 19,
    minimumOfferPrice: 17,
    status: 'active',
    verifiedByFPO: true
  },
  {
    id: 'crop-3',
    farmerId: 'f-103',
    farmerName: 'Parimal Roy',
    farmerVillage: 'Ranaghat',
    farmerDistrict: 'Nadia',
    farmerMobile: '9434889900',
    cropNameBn: 'ফুলকপি',
    cropNameEn: 'Cauliflower',
    category: 'Vegetables',
    variety: 'Snowball Early',
    quantityKg: 850,
    qualityGrade: 'Grade A',
    harvestDate: '2 days (২ দিন বাকি)',
    expectedPricePerKg: 24,
    minimumOfferPrice: 22,
    status: 'active',
    verifiedByFPO: false
  },
  {
    id: 'crop-4',
    farmerId: 'f-104',
    farmerName: 'Anjali Mahato',
    farmerVillage: 'Balarampur',
    farmerDistrict: 'Purulia',
    farmerMobile: '9641778899',
    cropNameBn: 'পটল',
    cropNameEn: 'Pointed Gourd (Potol)',
    category: 'Vegetables',
    variety: 'Local Green',
    quantityKg: 350,
    qualityGrade: 'Grade B',
    harvestDate: 'Ready (তোলা সম্পন্ন)',
    expectedPricePerKg: 42,
    minimumOfferPrice: 38,
    status: 'in_negotiation',
    verifiedByFPO: true
  },
  {
    id: 'crop-5',
    farmerId: 'f-101',
    farmerName: 'Ramesh Mondal',
    farmerVillage: 'Champahati',
    farmerDistrict: 'South 24 Parganas',
    farmerMobile: '9830123456',
    cropNameBn: 'বেগুন (মুক্তকেশী)',
    cropNameEn: 'Brinjal (Muktakeshi)',
    category: 'Vegetables',
    variety: 'Muktakeshi Dark Purple',
    quantityKg: 600,
    qualityGrade: 'Grade A',
    harvestDate: '3 days (৩ দিন বাকি)',
    expectedPricePerKg: 28,
    minimumOfferPrice: 25,
    status: 'active',
    verifiedByFPO: true
  }
];

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-7801',
    cropListingId: 'crop-1',
    cropNameBn: 'টমেটো',
    cropNameEn: 'Tomato',
    quantityKg: 300,
    agreedPricePerKg: 34,
    totalAmount: 10200,
    buyerId: 'b-201',
    buyerName: 'Kolkata Fresh Mart',
    farmerId: 'f-101',
    farmerName: 'Ramesh Mondal',
    status: 'confirmed',
    createdAt: '2026-03-11',
    deliveryDate: '2026-03-15',
    pickupLocation: 'Champahati, South 24 Parganas',
    destinationLocation: 'Posta Mandi, Kolkata'
  },
  {
    id: 'ORD-7762',
    cropListingId: 'crop-2',
    cropNameBn: 'আলু (জ্যোতি)',
    cropNameEn: 'Potato (Jyoti)',
    quantityKg: 1200,
    agreedPricePerKg: 18.5,
    totalAmount: 22200,
    buyerId: 'b-203',
    buyerName: 'Bengal Wholesale Hub',
    farmerId: 'f-102',
    farmerName: 'Subhash Barman',
    status: 'dispatched',
    createdAt: '2026-03-09',
    deliveryDate: '2026-03-13',
    pickupLocation: 'Singur, Hooghly',
    destinationLocation: 'Dhulagarh Hub, Howrah'
  },
  {
    id: 'ORD-7640',
    cropListingId: 'crop-5',
    cropNameBn: 'বেগুন (মুক্তকেশী)',
    cropNameEn: 'Brinjal (Muktakeshi)',
    quantityKg: 250,
    agreedPricePerKg: 28,
    totalAmount: 7000,
    buyerId: 'b-202',
    buyerName: 'Restaurant FreshBox',
    farmerId: 'f-101',
    farmerName: 'Ramesh Mondal',
    status: 'delivered',
    createdAt: '2026-03-02',
    deliveryDate: '2026-03-05',
    pickupLocation: 'Champahati, South 24 Parganas',
    destinationLocation: 'Salt Lake Sector V, Kolkata'
  }
];

export const DEMO_MARKET_PRICES: MarketPrice[] = [
  {
    cropNameBn: 'টমেটো (Tomato)',
    cropNameEn: 'Tomato',
    mandiName: 'Baruipur Mandi',
    district: 'South 24 Parganas',
    minPrice: 30,
    maxPrice: 38,
    modalPrice: 35,
    trend: 'up',
    unit: '₹ / kg',
    updatedAt: 'আজ সকাল ৮:০০'
  },
  {
    cropNameBn: 'আলু জ্যোতি (Potato Jyoti)',
    cropNameEn: 'Potato (Jyoti)',
    mandiName: 'Sheoraphuli Mandi',
    district: 'Hooghly',
    minPrice: 16,
    maxPrice: 21,
    modalPrice: 19,
    trend: 'stable',
    unit: '₹ / kg',
    updatedAt: 'আজ সকাল ৭:৩০'
  },
  {
    cropNameBn: 'বেগুন (Brinjal)',
    cropNameEn: 'Brinjal',
    mandiName: 'Posta Bazar',
    district: 'Kolkata',
    minPrice: 24,
    maxPrice: 32,
    modalPrice: 28,
    trend: 'up',
    unit: '₹ / kg',
    updatedAt: 'আজ সকাল ৯:১৫'
  },
  {
    cropNameBn: 'ফুলকপি (Cauliflower)',
    cropNameEn: 'Cauliflower',
    mandiName: 'Ranaghat Mandi',
    district: 'Nadia',
    minPrice: 18,
    maxPrice: 26,
    modalPrice: 23,
    trend: 'down',
    unit: '₹ / piece',
    updatedAt: 'আজ সকাল ৮:৪৫'
  },
  {
    cropNameBn: 'পেঁয়াজ (Onion Nasik)',
    cropNameEn: 'Onion',
    mandiName: 'Koley Market',
    district: 'Kolkata',
    minPrice: 26,
    maxPrice: 32,
    modalPrice: 29,
    trend: 'stable',
    unit: '₹ / kg',
    updatedAt: 'আজ সকাল ৬:৩০'
  }
];

export const DEMO_AI_ADVICE: AIAdvice[] = [
  {
    id: 'ai-1',
    titleBn: 'টমেটোর চাহিদায় ঊর্ধ্বগতি পূর্বাভাস',
    titleEn: 'Tomato Demand Spike Forecast',
    summaryBn: 'আসন্ন ৩ দিনে কলকাতার বড় বাজারে টমেটোর সরবরাহ ২০% কমতে পারে। আপনার তোলা টমেটোর দর ৩৫ টাকা বা তার বেশিতে চুক্তি করার পরামর্শ।',
    summaryEn: 'Wholesale arrivals in Kolkata are expected to drop ~20% over the next 72 hrs. Hold out for ₹35+/kg or coordinate direct delivery.',
    urgency: 'high',
    category: 'price',
    timestamp: 'আজ, ১০:১৫ AM'
  },
  {
    id: 'ai-2',
    titleBn: 'দক্ষিণ ২৪ পরগনায় হালকা বৃষ্টির সম্ভাবনা',
    titleEn: 'Rain Advisory for South 24 Parganas',
    summaryBn: 'আগামীকাল বিকেলে বজ্রবিদ্যুৎসহ হালকা বৃষ্টি হতে পারে। মাঠের পরিপক্ক সবজি আজকেই ঢেকে রাখার অথবা তুলে ফেলার প্রস্তুতি নিন।',
    summaryEn: 'Scattered light showers forecast tomorrow evening. Harvest mature produce or prep proper tarp coverage.',
    urgency: 'medium',
    category: 'weather',
    timestamp: 'আজ, সকাল ৭:০০'
  },
  {
    id: 'ai-3',
    titleBn: 'যৌথ পরিবহন (লজিস্টিকস) সমন্বয় সুযোগ',
    titleEn: 'Consolidated Logistics Opportunity',
    summaryBn: 'চম্পাহাটি অঞ্চলে আরও ৩ জন কৃষক কলকাতার পোস্তাতে পণ্য পাঠাচ্ছেন। একসঙ্গে ট্রাক শেয়ার করলে পরিবহন খরচ প্রতি কেজিতে ১.৫ টাকা সাশ্রয় হবে।',
    summaryEn: '3 nearby farmers in Champahati are scheduling transport to Posta Mandi. Pooling vehicles can save ₹1.5/kg in transit cost.',
    urgency: 'info',
    category: 'demand',
    timestamp: 'গতকাল'
  }
];

export const DEMO_MARKET_REFERENCE: Record<string, { min: number; max: number }> = {
  Tomato: { min: 29, max: 32 },
  Potato: { min: 16, max: 21 },
  Onion: { min: 26, max: 32 },
  Brinjal: { min: 24, max: 32 },
};

export const DEMO_BUYER_REQUIREMENTS: BuyerRequirement[] = [
  {
    buyerId: 'b-201',
    businessName: 'Kolkata Fresh Mart',
    buyerType: 'Wholesaler',
    crop: 'Tomato',
    requiredQuantityKg: 300,
    minimumQuality: 'Grade A',
    offeredPricePerKg: 31,
    district: 'Kolkata',
    deliveryDeadlineDays: 5,
  },
  {
    buyerId: 'b-202',
    businessName: 'Restaurant FreshBox',
    buyerType: 'Restaurant',
    crop: 'Tomato',
    requiredQuantityKg: 200,
    minimumQuality: 'Grade A',
    offeredPricePerKg: 30,
    district: 'North 24 Parganas',
    deliveryDeadlineDays: 5,
  },
  {
    buyerId: 'b-203',
    businessName: 'Bengal Wholesale Hub',
    buyerType: 'Institutional Buyer',
    crop: 'Tomato',
    requiredQuantityKg: 1200,
    minimumQuality: 'Grade A',
    offeredPricePerKg: 29,
    district: 'Howrah',
    deliveryDeadlineDays: 3,
  },
];

export const DEMO_SUPPLY_DEMAND: SupplyDemandSnapshot[] = [
  { crop: 'Tomato', supplyKg: 1700, demandKg: 2400, upcomingHarvestKg: 600, farmersHarvestingSoon: 18 },
  { crop: 'Potato', supplyKg: 6100, demandKg: 4800, upcomingHarvestKg: 900, farmersHarvestingSoon: 26 },
  { crop: 'Onion', supplyKg: 3200, demandKg: 3000, upcomingHarvestKg: 350, farmersHarvestingSoon: 11 },
];
