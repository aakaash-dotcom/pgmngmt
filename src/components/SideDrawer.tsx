import React from 'react';
import { TabType } from '../types';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: TabType) => void;
  onResetData: () => void;
  onAddTenant: () => void;
  onAddRoom: () => void;
  onAddExpense: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onResetData,
  onAddTenant,
  onAddRoom,
  onAddExpense,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" id="side-drawer-overlay">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-[300px] max-w-[85vw] bg-[#0d0d0d] text-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-r border-[#262626]">
        {/* Drawer Header */}
        <div className="bg-[#000000] text-white p-5 border-b border-[#262626] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#E2FF00] text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                apartment
              </span>
              <span className="text-[22px] font-black text-white uppercase tracking-tight">Agam PG</span>
            </div>
            <button
              onClick={onClose}
              className="text-[#888888] hover:text-white p-1 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <p className="text-[12px] text-[#888888] font-medium leading-snug">
            Property Management & Occupancy System
          </p>
          <div className="mt-2 pt-2 border-t border-[#222222] flex items-center justify-between text-[11px] text-[#aaaaaa]">
            <span>📍 Tech Zone 4, Bengaluru</span>
            <span className="bg-[#E2FF00] px-2 py-0.5 rounded text-black font-black uppercase text-[10px]">Active</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 flex flex-col gap-5 flex-1">
          {/* Quick Actions */}
          <div>
            <span className="text-[11px] font-black text-[#E2FF00] uppercase tracking-widest block mb-2 px-2">
              Quick Actions
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onClose();
                  onAddTenant();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[#1a1a1a] text-white font-bold text-[14px] transition-colors group"
              >
                <span className="material-symbols-outlined text-[#E2FF00] text-[20px] group-hover:scale-110 transition-transform">person_add</span>
                <span>Add New Tenant</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAddRoom();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[#1a1a1a] text-white font-bold text-[14px] transition-colors group"
              >
                <span className="material-symbols-outlined text-[#E2FF00] text-[20px] group-hover:scale-110 transition-transform">meeting_room</span>
                <span>Add / Configure Room</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAddExpense();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-[#1a1a1a] text-white font-bold text-[14px] transition-colors group"
              >
                <span className="material-symbols-outlined text-[#E2FF00] text-[20px] group-hover:scale-110 transition-transform">receipt_long</span>
                <span>Record PG Expense</span>
              </button>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <span className="text-[11px] font-black text-[#E2FF00] uppercase tracking-widest block mb-2 px-2">
              Navigation
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('home');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#1a1a1a] text-[#cccccc] hover:text-white text-[14px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[#888888] text-[20px]">dashboard</span>
                <span>Dashboard & Occupancy</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('rooms');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#1a1a1a] text-[#cccccc] hover:text-white text-[14px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[#888888] text-[20px]">bed</span>
                <span>Rooms & Beds (18 Rooms)</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('people');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#1a1a1a] text-[#cccccc] hover:text-white text-[14px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[#888888] text-[20px]">group</span>
                <span>Tenants Directory</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('money');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#1a1a1a] text-[#cccccc] hover:text-white text-[14px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[#888888] text-[20px]">payments</span>
                <span>Rent Collections & Dues</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('more');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#1a1a1a] text-[#cccccc] hover:text-white text-[14px] font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-[#888888] text-[20px]">restaurant</span>
                <span>Mess Menu & Notices</span>
              </button>
            </div>
          </div>

          {/* Caretaker / Support Box */}
          <div className="bg-[#141414] p-3.5 rounded-xl border border-[#262626] text-[12px] flex flex-col gap-1">
            <div className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <span className="material-symbols-outlined text-[#E2FF00] text-[16px]">call</span>
              <span>Warden / Caretaker</span>
            </div>
            <p className="text-[#cccccc] font-medium">Mr. Rajesh Gowda: +91 98450 99881</p>
            <p className="text-[#888888] text-[11px]">Gate Closes at 10:30 PM</p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#262626] bg-[#000000] flex flex-col gap-2">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo records back to initial screenshot state?')) {
                onResetData();
                onClose();
              }
            }}
            className="text-[12px] text-[#ff453a] hover:bg-[#2a0d0d] p-2 rounded-xl text-center font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset Demo Data</span>
          </button>
          <div className="text-[10px] text-center text-[#666666] uppercase tracking-widest font-mono">
            Agam PG • Bold Edition v3.0
          </div>
        </div>
      </div>
    </div>
  );
};

