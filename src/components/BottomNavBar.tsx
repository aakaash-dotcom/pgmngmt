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
    { id: 'home', label: 'Dashboard', icon: 'dashboard' },
    { id: 'rooms', label: 'Rooms', icon: 'meeting_room' },
    { id: 'people', label: 'Tenants', icon: 'groups' },
    { id: 'money', label: 'Accounts', icon: 'account_balance' },
    { id: 'more', label: 'Operations', icon: 'tune' },
  ];

  return (
    <nav
      id="bottom-nav-bar"
      className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] fixed bottom-0 left-0 right-0 w-full h-[60px] z-50 flex justify-around items-center px-1 pb-safe transform-gpu select-none"
    >
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-button-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-150 select-none py-1 px-2.5 sm:px-4 rounded-xl ${
              isActive
                ? 'text-emerald-800 font-black bg-emerald-50/90 border border-emerald-200/80 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold'
            }`}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

