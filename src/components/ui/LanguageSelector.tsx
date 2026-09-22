import React, { useState } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';
import { Language } from '../../types';

export const LanguageSelector: React.FC<{ variant?: 'button' | 'compact' | 'header' }> = ({
  variant = 'header',
}) => {
  const { language, setLanguage, availableLanguages } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLangObj = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 min-h-[38px] cursor-pointer shadow-2xs transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Change Language"
      >
        <span className="text-sm">🌐</span>
        <span className="font-bold text-slate-800">
          {currentLangObj.nativeName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-200 z-50 p-1.5 text-left animate-in fade-in duration-100">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              Select Language / ভাষা
            </div>
            {availableLanguages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as Language);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between min-h-[38px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
