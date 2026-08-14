import React from 'react';
import { TabType } from '../types';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
}) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'rooms', label: 'Rooms', icon: 'bed' },
    { id: 'people', label: 'Tenants', icon: 'group' },
    { id: 'money', label: 'Money', icon: 'payments' },
    { id: 'more', label: 'More', icon: 'more_horiz' },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      className="bg-[#000000] border-t border-[#222222] shadow-[0_-4px_20px_rgba(0,0,0,0.8)] fixed bottom-0 left-0 right-0 w-full h-[70px] z-50 flex justify-around items-center px-2 pb-safe"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-button-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 select-none min-h-[46px] ${
              isActive
                ? 'text-black font-black bg-[#E2FF00] rounded-xl px-3 py-1 min-w-[68px] shadow-[0_0_15px_rgba(226,255,0,0.3)] scale-102'
                : 'text-[#888888] hover:text-white hover:bg-[#141414] rounded-lg px-2 py-1 flex-1'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span className="text-[11px] uppercase tracking-wider font-extrabold mt-0.5">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

