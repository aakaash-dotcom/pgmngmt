import React from 'react';
import { TabType } from '../types';
import { OWNER_PHONE_INTL, OWNER_UPI_ID, PG_NAME } from '../data/initialData';
import { AgamLogo } from './AgamLogo';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  onResetData: () => void;
  showResetButton?: boolean;
  onAddTenant: () => void;
  onAddRoom: () => void;
  onAddExpense: () => void;
  onAddIncome: () => void;
  onOpenBulkManager?: () => void;
  onOpenWhatsAppTemplates?: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onResetData,
  showResetButton = false,
  onAddTenant,
  onAddRoom,
  onAddExpense,
  onAddIncome,
  onOpenBulkManager,
  onOpenWhatsAppTemplates,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" id="side-drawer-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-[320px] max-w-[85vw] bg-white text-slate-900 h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-r border-slate-200">
        {/* Drawer Header */}
        <div className="bg-[#0a332c] text-white p-5 border-b border-emerald-900/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <AgamLogo size="md" variant="white" />
            <button
              onClick={onClose}
              className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Menu"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="mt-2 pt-2.5 border-t border-emerald-800/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-100 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-amber-400">call</span>
              {OWNER_PHONE_INTL}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold text-[10px]">
              Gents PG
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 flex flex-col gap-5 flex-1">
          {/* Quick Operations */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Quick Operations
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onClose();
                  onAddTenant();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50 text-slate-800 font-extrabold text-[13px] transition-colors"
              >
                <span className="material-symbols-outlined text-[#0a332c] text-[20px]">person_add</span>
                <span>Admit New Resident</span>
              </button>

              {onOpenBulkManager && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBulkManager();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-amber-50 text-amber-900 font-extrabold text-[13px] transition-colors"
                >
                  <span className="material-symbols-outlined text-amber-700 text-[20px]">corporate_fare</span>
                  <span>Bulk Corporate / Hotel Groups</span>
                </button>
              )}

              {onOpenWhatsAppTemplates && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenWhatsAppTemplates();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-emerald-50 text-emerald-900 font-extrabold text-[13px] transition-colors"
                >
                  <span className="material-symbols-outlined text-emerald-700 text-[20px]">chat</span>
                  <span>WhatsApp Message Templates</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onAddRoom();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-800 font-bold text-[13px] transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600 text-[20px]">meeting_room</span>
                <span>Add / Configure Room</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAddExpense();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-800 font-bold text-[13px] transition-colors"
              >
                <span className="material-symbols-outlined text-rose-600 text-[20px]">receipt_long</span>
                <span>Log PG Expense</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAddIncome();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-slate-100 text-slate-800 font-bold text-[13px] transition-colors"
              >
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">add_card</span>
                <span>Log Other Income</span>
              </button>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Management Modules
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('home');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[13px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 text-[20px]">dashboard</span>
                <span>Overview & Occupancy</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('rooms');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[13px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 text-[20px]">bed</span>
                <span>Rooms & Pricing (1 to 10 Sharing)</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('people');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[13px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 text-[20px]">groups</span>
                <span>Residents & Bulk Groups</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('money');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[13px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 text-[20px]">account_balance</span>
                <span>Ledger & Balance Sheet</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('more');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[13px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500 text-[20px]">build</span>
                <span>Maintenance & Contacts</span>
              </button>
            </div>
          </div>

          {/* Quick Account & Cloud Sync Info */}
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 text-[12px] flex flex-col gap-1.5 mt-auto">
            <div className="font-extrabold text-[#0a332c] flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified_user</span>
                <span>Owner & Manager Dashboard</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-1.5 py-0.5 rounded">CLOUD SYNC</span>
            </div>
            <p className="text-slate-700 font-semibold">
              Phone: {OWNER_PHONE_INTL}
            </p>
            <p className="text-slate-600 font-medium">
              UPI: {OWNER_UPI_ID}
            </p>
            <div className="mt-1 pt-1.5 border-t border-emerald-200/60 flex items-center gap-1.5 text-[11px] text-emerald-900 font-bold">
              <span className="material-symbols-outlined text-emerald-700 text-[15px]">devices</span>
              <span>Multi-device real-time sync active</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2">
          <button
            onClick={() => {
              if (window.confirm('Clear all demo residents, rooms, staff, payments, expenses, and records to start with a clean PG? This action cannot be undone.')) {
                onResetData();
                onClose();
              }
            }}
            className="text-[12px] text-rose-600 hover:bg-rose-50 p-2 rounded-xl text-center font-bold transition-colors flex items-center justify-center gap-1.5 border border-rose-200/60 bg-white shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset & Clear Demo Data</span>
          </button>
          <div className="text-[10px] text-center text-slate-400 font-medium">
            {PG_NAME} • Official Management System
          </div>
        </div>
      </div>
    </div>
  );
};

