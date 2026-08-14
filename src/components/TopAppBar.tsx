import React from 'react';
import { TabType } from '../types';

interface TopAppBarProps {
  currentTab: TabType;
  onOpenDrawer: () => void;
  onAddClick: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onOpenDrawer,
  onAddClick,
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'money':
        return 'Money';
      case 'rooms':
        return 'Rooms';
      case 'people':
        return 'Tenants';
      case 'more':
        return 'Services';
      case 'home':
      default:
        return 'Agam PG';
    }
  };

  return (
    <header
      id="top-app-bar"
      className="bg-[#000000] text-[#FFFFFF] shadow-md flex justify-between items-center px-4 h-[58px] w-full z-50 fixed top-0 left-0 right-0 border-b border-[#222222]"
    >
      <button
        id="btn-open-menu-drawer"
        aria-label="Menu"
        onClick={onOpenDrawer}
        className="w-[44px] h-[44px] flex items-center justify-center hover:bg-[#1a1a1a] active:scale-95 transition-all text-[#FFFFFF] rounded-lg"
      >
        <span className="material-symbols-outlined text-[24px]">menu</span>
      </button>

      <div className="font-black text-[20px] sm:text-[22px] tracking-tight uppercase text-[#FFFFFF] text-center flex-1 truncate px-2">
        <span className="text-[#E2FF00] mr-1">/</span>
        {getTitle()}
      </div>

      <button
        id="btn-top-app-add"
        onClick={onAddClick}
        className="h-[38px] px-3.5 bg-[#E2FF00] text-black font-black text-[13px] tracking-wider uppercase hover:bg-[#d4f000] active:scale-95 transition-all rounded-lg flex items-center gap-1 shadow-[0_0_12px_rgba(226,255,0,0.3)]"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        <span>ADD</span>
      </button>
    </header>
  );
};

