import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-lg bg-indigo-950/90 border border-indigo-800 px-3 py-1.5 text-xs font-medium text-indigo-200 shadow-xl backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 text-indigo-400" />
      <span>Offline Sovereign Mode — Zero Wi-Fi packets transmitted. Local 3GB model active.</span>
    </div>
  );
};
