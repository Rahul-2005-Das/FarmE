import React from 'react';
import { EmergencyMarketPage } from './EmergencyMarketPage';

interface Props { onNavigate: (route: string) => void; }

export const FarmerEmergencyPage: React.FC<Props> = ({ onNavigate }) => (
  <EmergencyMarketPage onNavigate={onNavigate} farmerMode />
);
