import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LanguageSelector } from '../components/ui/LanguageSelector';
import { Sidebar } from '../components/ui/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { DEMO_BUYER_REQUIREMENTS, DEMO_CROPS, WB_DISTRICTS } from '../data/mockData';
import { matchBuyerToListing } from '../services/matchingEngine';
import { addBuyerDemand, loadBuyerDemands, loadFarmerListings } from '../services/storage';
import {
  BuyerDemandPost,
  BuyerRequirement,
  CropListing,
  FarmerProduceListing,
  ProduceGrade,
} from '../types';
import { ArrowLeft, ChevronDown, ChevronUp, Filter, Search } from 'lucide-react';

interface BuyerFindProducePageProps {
  onNavigate: (route: string) => void;
  initialShowDemand?: boolean;
}

type SortMode = 'match' | 'price' | 'distance' | 'freshness';

const toCropListing = (listing: FarmerProduceListing): CropListing => ({
  id: listing.id,
  farmerId: listing.farmerId,
  farmerName: listing.farmerName,
  farmerVillage: listing.location.village,
  farmerDistrict: listing.location.district,
  farmerMobile: listing.farmerMobile,
  cropNameBn: listing.cropBn || listing.crop,
  cropNameEn: listing.crop,
  category: 'Vegetables',
  variety: listing.grade,
  quantityKg: listing.quantity,
  qualityGrade:
    listing.grade === 'Grade A' ? 'Grade A' : listing.grade === 'Grade B' ? 'Grade B' : 'Grade B',
  harvestDate: listing.harvestDate,
  expectedPricePerKg: listing.expectedPrice,
  status: 'active',
  verifiedByFPO: false,
});

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full rounded-full bg-emerald-700" style={{ width: `${value}%` }} />
    </div>
  </div>
);

export const BuyerFindProducePage: React.FC<BuyerFindProducePageProps> = ({
  onNavigate,
  initialShowDemand = false,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [district, setDistrict] = useState('All');
  const [quality, setQuality] = useState('All');
  const [minQty, setMinQty] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('match');
  const [whyId, setWhyId] = useState<string | null>(null);
  const [showDemandForm, setShowDemandForm] = useState(initialShowDemand);
  const [demands, setDemands] = useState<BuyerDemandPost[]>(() => loadBuyerDemands());

  const [demandCrop, setDemandCrop] = useState('Tomato');
  const [demandQty, setDemandQty] = useState('400');
  const [demandQuality, setDemandQuality] = useState<ProduceGrade>('Grade A');
  const [demandMaxPrice, setDemandMaxPrice] = useState('31');
  const [demandDate, setDemandDate] = useState('Within 5 days');
  const [demandDistrict, setDemandDistrict] = useState('Kolkata');
  const [demandError, setDemandError] = useState<string | null>(null);

  const buyerRequirement: BuyerRequirement = useMemo(() => {
    const fromDemo =
      DEMO_BUYER_REQUIREMENTS.find((r) => r.buyerId === currentUser?.id) ||
      DEMO_BUYER_REQUIREMENTS[0];
    const latestDemand = demands.find((d) => d.buyerId === (currentUser?.id || fromDemo.buyerId));
    if (latestDemand) {
      return {
        buyerId: latestDemand.buyerId,
        businessName: latestDemand.buyerName,
        buyerType: fromDemo.buyerType,
        crop: latestDemand.crop,
        requiredQuantityKg: latestDemand.requiredQuantityKg,
        minimumQuality: latestDemand.quality,
        offeredPricePerKg: latestDemand.maxPricePerKg,
        district: latestDemand.district,
        deliveryDeadlineDays: 5,
      };
    }
    return fromDemo;
  }, [currentUser?.id, demands]);

  const listings = useMemo(() => {
    const published = loadFarmerListings().map(toCropListing);
    return [...published, ...DEMO_CROPS];
  }, []);

  const enriched = useMemo(() => {
    return listings.map((item) => {
      const asFarmer: Pick<
        FarmerProduceListing,
        'crop' | 'quantity' | 'grade' | 'expectedPrice' | 'harvestDate' | 'location'
      > = {
        crop: item.cropNameEn,
        quantity: item.quantityKg,
        grade: item.qualityGrade === 'Export Quality' ? 'Grade A' : item.qualityGrade,
        expectedPrice: item.expectedPricePerKg,
        harvestDate: item.harvestDate,
        location: { district: item.farmerDistrict, village: item.farmerVillage },
      };
      const match = matchBuyerToListing(asFarmer, {
        ...buyerRequirement,
        crop: buyerRequirement.crop || item.cropNameEn,
      });
      // Re-score against listing crop for produce browse
      const cropAligned = matchBuyerToListing(asFarmer, {
        ...buyerRequirement,
        crop: item.cropNameEn.split(' ')[0],
      });
      return { item, match: cropAligned.breakdown.crop < 50 ? match : cropAligned };
    });
  }, [listings, buyerRequirement]);

  const filtered = useMemo(() => {
    let rows = enriched.filter(({ item }) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        !q ||
        item.cropNameEn.toLowerCase().includes(q) ||
        item.cropNameBn.includes(searchQuery) ||
        item.farmerName.toLowerCase().includes(q) ||
        item.farmerDistrict.toLowerCase().includes(q);
      const matchDistrict = district === 'All' || item.farmerDistrict === district;
      const matchQuality = quality === 'All' || item.qualityGrade === quality;
      const matchQty = !minQty || item.quantityKg >= (parseInt(minQty, 10) || 0);
      return matchQuery && matchDistrict && matchQuality && matchQty;
    });

    rows = [...rows].sort((a, b) => {
      if (sortMode === 'price') return a.item.expectedPricePerKg - b.item.expectedPricePerKg;
      if (sortMode === 'distance') return b.match.breakdown.distance - a.match.breakdown.distance;
      if (sortMode === 'freshness') {
        const da = parseInt(a.item.harvestDate.replace(/\D/g, '') || '9', 10);
        const db = parseInt(b.item.harvestDate.replace(/\D/g, '') || '9', 10);
        return da - db;
      }
      return b.match.score - a.match.score;
    });

    return rows;
  }, [enriched, searchQuery, district, quality, minQty, sortMode]);

  const handleSaveDemand = (e: React.FormEvent) => {
    e.preventDefault();
    setDemandError(null);
    const qty = parseInt(demandQty, 10);
    const price = parseFloat(demandMaxPrice);
    if (!demandCrop.trim()) {
      setDemandError(t('phase3.errMissingCrop'));
      return;
    }
    if (!qty || qty <= 0) {
      setDemandError(t('phase3.errInvalidQty'));
      return;
    }
    if (!price || price <= 0) {
      setDemandError(t('phase3.errMissingPrice'));
      return;
    }

    const post: BuyerDemandPost = {
      id: `DEM-${Date.now().toString().slice(-5)}`,
      buyerId: currentUser?.id || 'b-201',
      buyerName: (currentUser as { businessName?: string })?.businessName || 'Kolkata Fresh Mart',
      crop: demandCrop,
      requiredQuantityKg: qty,
      quality: demandQuality,
      maxPricePerKg: price,
      deliveryDate: demandDate,
      district: demandDistrict,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDemands(addBuyerDemand(post));
    setShowDemandForm(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#F8FAF8] text-slate-800">
      <Sidebar currentRoute="buyer-find-produce" onNavigate={onNavigate} />

      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 max-w-6xl mx-auto space-y-5 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('buyer-dashboard')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer mb-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('common.back')}
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('phase3.findProduceTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('phase3.findProduceSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDemandForm(true)}
              className="px-3 py-2 rounded-xl bg-[#0F3E26] text-white text-xs font-bold cursor-pointer min-h-[44px]"
            >
              {t('phase3.postDemand')}
            </button>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('phase3.searchProducePlaceholder')}
              className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none font-medium"
              aria-label={t('phase3.searchProducePlaceholder')}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
            aria-label={t('common.location')}
          >
            <option value="All">{t('common.allDistricts')}</option>
            {WB_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
            aria-label={t('phase3.qualityFilter')}
          >
            <option value="All">{t('phase3.allQuality')}</option>
            <option value="Grade A">Grade A</option>
            <option value="Grade B">Grade B</option>
            <option value="Export Quality">Export Quality</option>
          </select>
          <input
            type="number"
            min={0}
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            placeholder={t('phase3.minQuantity')}
            className="px-3 py-2 rounded-xl border border-slate-300 w-32 font-semibold"
            aria-label={t('phase3.minQuantity')}
          />
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold"
            aria-label={t('phase3.sortBy')}
          >
            <option value="match">{t('phase3.sortBestMatch')}</option>
            <option value="price">{t('phase3.sortPrice')}</option>
            <option value="distance">{t('phase3.sortDistance')}</option>
            <option value="freshness">{t('phase3.sortFreshness')}</option>
          </select>
        </div>

        {demands.length > 0 && (
          <p className="text-[11px] text-emerald-800 font-semibold">
            {t('phase3.activeDemandsCount', { count: demands.length })}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <Card className="p-6 border border-dashed border-slate-300 text-center text-sm text-slate-500 md:col-span-2">
              {t('phase3.noListingsFound')}
            </Card>
          ) : (
            filtered.map(({ item, match }) => (
              <Card key={item.id} className="p-5 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{item.cropNameEn}</h3>
                    <p className="text-xs text-slate-500">
                      {item.farmerName} · {item.farmerVillage}, {item.farmerDistrict}
                    </p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.qualityGrade}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-y border-slate-100 py-2">
                  <div>
                    <span className="text-slate-400 block">{t('common.quantity')}</span>
                    <strong>
                      {item.quantityKg} {t('common.kg')}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block">{t('phase3.expectedPriceLabel')}</span>
                    <strong className="text-emerald-800">
                      ₹{item.expectedPricePerKg}/{t('common.kg')}
                    </strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('smartListing.summaryHarvest')}: {item.harvestDate}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-emerald-900">
                    {t('phase3.aiMatch')}: {match.score}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setWhyId(whyId === item.id ? null : item.id)}
                    className="text-xs font-bold text-slate-700 hover:underline cursor-pointer flex items-center gap-1"
                    aria-expanded={whyId === item.id}
                  >
                    {t('phase3.whyThisMatch')}
                    {whyId === item.id ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                {whyId === item.id && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <ScoreBar label={t('phase3.compatCrop')} value={match.breakdown.crop} />
                    <ScoreBar label={t('phase3.compatQuantity')} value={match.breakdown.quantity} />
                    <ScoreBar label={t('phase3.compatQuality')} value={match.breakdown.quality} />
                    <ScoreBar label={t('phase3.compatPrice')} value={match.breakdown.price} />
                    <ScoreBar label={t('phase3.compatDistance')} value={match.breakdown.distance} />
                    <ScoreBar label={t('phase3.compatTiming')} value={match.breakdown.timing} />
                    <p className="text-[11px] text-slate-400">{t('phase3.illustrativeNote')}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem('krishok_bandhu_selected_crop', JSON.stringify(item));
                    onNavigate('buyer-dashboard');
                  }}
                  className="w-full rounded-xl bg-blue-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-blue-800"
                >
                  Open order desk
                </button>
              </Card>
            ))
          )}
        </div>
      </main>

      <Modal
        isOpen={showDemandForm}
        onClose={() => setShowDemandForm(false)}
        title={t('phase3.postDemandTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleSaveDemand} className="space-y-3 text-left">
          <Input
            label={t('phase3.demandCrop')}
            value={demandCrop}
            onChange={(e) => setDemandCrop(e.target.value)}
            required
          />
          <Input
            label={t('phase3.requiredQty')}
            type="number"
            min={1}
            value={demandQty}
            onChange={(e) => setDemandQty(e.target.value)}
            required
          />
          <label className="block text-xs font-semibold text-slate-700">
            {t('phase3.qualityFilter')}
            <select
              value={demandQuality}
              onChange={(e) => setDemandQuality(e.target.value as ProduceGrade)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
            >
              <option value="Grade A">Grade A</option>
              <option value="Grade B">Grade B</option>
              <option value="Grade C">Grade C</option>
            </select>
          </label>
          <Input
            label={t('phase3.maxPrice')}
            type="number"
            min={1}
            value={demandMaxPrice}
            onChange={(e) => setDemandMaxPrice(e.target.value)}
            required
          />
          <Input
            label={t('phase3.deliveryDate')}
            value={demandDate}
            onChange={(e) => setDemandDate(e.target.value)}
          />
          <label className="block text-xs font-semibold text-slate-700">
            {t('common.location')}
            <select
              value={demandDistrict}
              onChange={(e) => setDemandDistrict(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm"
            >
              {WB_DISTRICTS.concat(['Kolkata']).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          {demandError && (
            <p className="text-xs text-rose-700 font-semibold" role="alert">
              {demandError}
            </p>
          )}
          <Button variant="farmer" fullWidth type="submit">
            {t('phase3.saveDemand')}
          </Button>
          <p className="text-[11px] text-slate-400">{t('phase3.prototypeLabel')}</p>
        </form>
      </Modal>
    </div>
  );
};
