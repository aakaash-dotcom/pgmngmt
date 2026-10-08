import React from 'react';
import { TabType } from '../types';
import { AgamLogo } from './AgamLogo';

interface TopAppBarProps {
  currentTab: TabType;
  onOpenSideDrawer: () => void;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncTime?: string;
}

const TAB_TITLES: Record<TabType, { label: string; icon: string }> = {
  home: { label: 'Dashboard', icon: 'dashboard' },
  rooms: { label: 'Rooms', icon: 'meeting_room' },
  people: { label: 'Tenants', icon: 'groups' },
  money: { label: 'Accounts', icon: 'account_balance' },
  more: { label: 'Operations', icon: 'tune' },
};

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onOpenSideDrawer,
  cloudSyncStatus = 'synced',
  lastSyncTime = 'Just now',
}) => {
  const current = TAB_TITLES[currentTab] || { label: 'Dashboard', icon: 'dashboard' };

  return (
    <header
      id="top-app-bar"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-[54px] flex items-center justify-between gap-3">
        {/* Left Side: Drawer Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenSideDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
            title="Open Menu"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Official Agam Vector Logo with proper bounds */}
          <div className="flex items-center overflow-visible pl-0.5">
            <AgamLogo size="md" variant="full" />
          </div>
        </div>

        {/* Right Side: Cloud Sync Indicator & Page Badge */}
        <div className="flex items-center gap-2">
          <div
            title={`Cloud Sync: ${
              cloudSyncStatus === 'syncing'
                ? 'Syncing to cloud...'
                : cloudSyncStatus === 'error'
                ? 'Sync failed — changes are saved on this device and will retry'
                : cloudSyncStatus === 'offline'
                ? 'You are offline — changes will sync when you reconnect'
                : 'Live synced across devices'
            } (${lastSyncTime})`}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
              cloudSyncStatus === 'syncing'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : cloudSyncStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : cloudSyncStatus === 'offline'
                ? 'bg-slate-100 text-slate-600 border-slate-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                cloudSyncStatus === 'syncing'
                  ? 'bg-amber-500'
                  : cloudSyncStatus === 'error'
                  ? 'bg-rose-600'
                  : cloudSyncStatus === 'offline'
                  ? 'bg-slate-400'
                  : 'bg-emerald-600'
              }`}
            />
            <span className="hidden md:inline">
              {cloudSyncStatus === 'syncing'
                ? 'Syncing...'
                : cloudSyncStatus === 'error'
                ? 'Sync Failed'
                : cloudSyncStatus === 'offline'
                ? 'Offline'
                : 'Cloud Synced'}
            </span>
          </div>

          <div
            id="current-page-badge"
            className="h-[34px] px-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-[12px] font-black flex items-center gap-1.5 shadow-2xs select-none"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">
              {current.icon}
            </span>
            <span className="tracking-tight uppercase text-slate-900">
              {current.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

