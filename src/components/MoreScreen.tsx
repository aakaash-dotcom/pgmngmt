import React, { useState } from 'react';
import { MaintenanceTicket, Notice } from '../types';

interface MoreScreenProps {
  maintenanceTickets: MaintenanceTicket[];
  notices: Notice[];
  onAddNotice?: (notice: Notice) => void;
  onAddTicket?: (ticket: MaintenanceTicket) => void;
  onUpdateTicketStatus?: (id: string, status: MaintenanceTicket['status']) => void;
}

export const MoreScreen: React.FC<MoreScreenProps> = ({
  maintenanceTickets,
  notices,
  onUpdateTicketStatus,
}) => {
  const [activeSection, setActiveSection] = useState<'notices' | 'maintenance' | 'mess' | 'property'>('notices');

  const messMenu = [
    { day: 'Monday', b: 'Idli, Sambar, Coconut Chutney', l: 'Rice, Dal Tadka, Aloo Gobi, Curd', d: 'Roti, Paneer Butter Masala, Rice, Rasam' },
    { day: 'Tuesday', b: 'Poha, Sev, Boiled Egg / Banana', l: 'Veg Pulao, Raita, Mix Veg Curry', d: 'Chapati, Dal Makhani, Jeera Rice, Gulab Jamun' },
    { day: 'Wednesday', b: 'Medu Vada, Upma, Chutney', l: 'Rice, Sambar, Bhindi Fry, Papad', d: 'Egg Curry / Paneer Curry, Roti, Rice' },
    { day: 'Thursday', b: 'Aloo Paratha, Curd, Pickle', l: 'Rajma Chawal, Green Salad, Curd', d: 'Roti, Kadhai Veg, Lemon Rice, Kheer' },
    { day: 'Friday', b: 'Poori, Aloo Masala, Halwa', l: 'Rice, Drumstick Sambar, Cabbage Poriyal', d: 'Veg Biryani, Mirchi Ka Salan, Raita' },
    { day: 'Saturday', b: 'Masala Dosa, Chutney, Tea', l: 'Khichdi, Kadhi, Papad, Pickle', d: 'Roti, Chana Masala, Steamed Rice, Curd' },
    { day: 'Sunday (Special)', b: 'Chole Bhature, Lassi', l: 'Chicken Biryani / Paneer Biryani, Gulab Jamun, Raita', d: 'Roti, Dal Tadka, Gobi Manchurian, Rice' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-4 pb-24 flex flex-col gap-5">
      {/* Property Badge */}
      <div className="bg-[#121212] text-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#262626] flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#E2FF00]/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-black text-white uppercase tracking-tight">Agam PG Hostel</span>
            <span className="bg-[#E2FF00] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-[0_0_8px_rgba(226,255,0,0.3)]">
              Verified
            </span>
          </div>
          <p className="text-[13px] text-[#888888] font-bold uppercase tracking-wider mt-1">
            Premium Gents & Ladies Hostel • Tech Zone 4, Bengaluru
          </p>
          <div className="flex items-center gap-4 mt-3 text-[12px] text-[#aaaaaa] font-bold">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#E2FF00]">call</span>
              +91 98450 99881
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#E2FF00]">wifi</span>
              Agam_5G_Fiber
            </span>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="grid grid-cols-4 bg-[#141414] rounded-xl p-1 shadow-md border border-[#262626] text-[12px]">
        <button
          onClick={() => setActiveSection('notices')}
          className={`py-2 text-center font-black uppercase tracking-wider rounded-lg transition-all ${
            activeSection === 'notices' ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
          }`}
        >
          Notices
        </button>
        <button
          onClick={() => setActiveSection('maintenance')}
          className={`py-2 text-center font-black uppercase tracking-wider rounded-lg transition-all ${
            activeSection === 'maintenance' ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
          }`}
        >
          Repairs
        </button>
        <button
          onClick={() => setActiveSection('mess')}
          className={`py-2 text-center font-black uppercase tracking-wider rounded-lg transition-all ${
            activeSection === 'mess' ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
          }`}
        >
          Mess Menu
        </button>
        <button
          onClick={() => setActiveSection('property')}
          className={`py-2 text-center font-black uppercase tracking-wider rounded-lg transition-all ${
            activeSection === 'property' ? 'bg-[#E2FF00] text-black shadow-[0_0_12px_rgba(226,255,0,0.3)]' : 'text-[#888888] hover:text-white'
          }`}
        >
          Amenities
        </button>
      </div>

      {/* Notices Section */}
      {activeSection === 'notices' && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest">
              PG Notice Board
            </h3>
            <span className="text-[11px] text-[#E2FF00] font-black uppercase tracking-wider">Active Bulletins</span>
          </div>

          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-[#121212] rounded-2xl border p-4 shadow-md relative overflow-hidden flex flex-col gap-2 ${
                notice.priority === 'important' ? 'border-[#E2FF00] border-l-[4px] border-l-[#E2FF00]' : 'border-[#262626]'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="text-[17px] font-black text-white uppercase tracking-tight flex items-center gap-1.5">
                  {notice.priority === 'important' && (
                    <span className="material-symbols-outlined text-[#E2FF00] text-[20px]">priority_high</span>
                  )}
                  {notice.title}
                </h4>
                <span className="text-[11px] text-[#aaaaaa] font-bold bg-[#1f1f1f] px-2 py-0.5 rounded border border-[#333333]">
                  {notice.date}
                </span>
              </div>
              <p className="text-[14px] text-[#cccccc] leading-relaxed font-medium">{notice.content}</p>
              <div className="text-[11px] text-[#888888] font-bold pt-2 border-t border-[#262626] flex justify-between uppercase tracking-wider">
                <span>Issued by: {notice.author}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Repairs & Maintenance Section */}
      {activeSection === 'maintenance' && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest">
              Maintenance Tickets
            </h3>
            <span className="text-[11px] bg-[#ffaa00] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
              {maintenanceTickets.filter((t) => t.status !== 'resolved').length} Active
            </span>
          </div>

          {maintenanceTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-[#121212] rounded-2xl border border-[#262626] p-4 shadow-md flex flex-col gap-2.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-[#E2FF00] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded mr-2">
                    Room {ticket.roomNumber}
                  </span>
                  <h4 className="text-[16px] font-black text-white uppercase tracking-tight inline">{ticket.title}</h4>
                </div>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ticket.status === 'in-progress'
                      ? 'bg-[#ffaa00] text-black'
                      : ticket.status === 'resolved'
                      ? 'bg-[#E2FF00] text-black'
                      : 'bg-[#ff3b30] text-white'
                  }`}
                >
                  {ticket.status}
                </span>
              </div>

              <p className="text-[13px] text-[#cccccc] font-medium">{ticket.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[12px] text-[#888888] font-bold">
                <span>Reported: {ticket.reportedDate} ({ticket.reportedBy})</span>
                {ticket.cost && (
                  <span className="font-black text-white">Est. Cost: ₹{ticket.cost}</span>
                )}
              </div>

              {onUpdateTicketStatus && ticket.status !== 'resolved' && (
                <button
                  onClick={() => onUpdateTicketStatus(ticket.id, 'resolved')}
                  className="mt-1 w-full py-2 bg-[#1f1f1f] hover:bg-[#E2FF00] hover:text-black text-[#E2FF00] text-[12px] font-black uppercase tracking-wider rounded-xl transition-colors text-center border border-[#333333]"
                >
                  ✓ Mark Issue as Resolved
                </button>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Mess Menu */}
      {activeSection === 'mess' && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[12px] font-black text-[#888888] uppercase tracking-widest">
              Weekly Meal Timetable
            </h3>
            <span className="text-[11px] text-[#E2FF00] font-black uppercase tracking-wider">3 Meals + Snacks</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {messMenu.map((m) => (
              <div key={m.day} className="bg-[#121212] rounded-2xl border border-[#262626] p-3.5 shadow-md flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-black text-[15px] text-[#E2FF00] uppercase tracking-wider">{m.day}</span>
                </div>
                <div className="text-[13px] grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-[#262626]">
                  <div>
                    <span className="text-[10px] text-[#888888] uppercase font-black tracking-wider block">Breakfast (7:30 - 9:30 AM)</span>
                    <span className="text-white font-medium">{m.b}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#888888] uppercase font-black tracking-wider block">Lunch (12:30 - 2:30 PM)</span>
                    <span className="text-white font-medium">{m.l}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#888888] uppercase font-black tracking-wider block">Dinner (8:00 - 10:00 PM)</span>
                    <span className="text-white font-medium">{m.d}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Amenities & Rules */}
      {activeSection === 'property' && (
        <section className="flex flex-col gap-3">
          <div className="bg-[#121212] rounded-2xl border border-[#262626] p-4 shadow-md">
            <h4 className="font-black text-[16px] text-white uppercase tracking-tight mb-3">Hostel Amenities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px] text-[#cccccc]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">wifi</span>
                <span className="font-bold">High Speed Wi-Fi</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">local_laundry_service</span>
                <span className="font-bold">Washing Machines</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">water_drop</span>
                <span className="font-bold">RO Purified Water</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">videocam</span>
                <span className="font-bold">24/7 CCTV Security</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">cleaning_services</span>
                <span className="font-bold">Daily Housekeeping</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1a1a1a] border border-[#262626]">
                <span className="material-symbols-outlined text-[#E2FF00]">bolt</span>
                <span className="font-bold">Power Backup Gen</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121212] rounded-2xl border border-[#262626] p-4 shadow-md text-[13px] text-[#cccccc] flex flex-col gap-2">
            <h4 className="font-black text-[16px] text-white uppercase tracking-tight">Hostel Rules & Policies</h4>
            <ul className="list-disc pl-4 flex flex-col gap-1 text-[13px] font-medium">
              <li>Main gate locks strictly at 10:30 PM.</li>
              <li>Monthly rent to be paid on or before the 5th of each month.</li>
              <li>1 month notice period required prior to vacating the room.</li>
              <li>Smoking and alcohol strictly prohibited on premises.</li>
              <li>Visitors allowed in lounge area only between 10:00 AM and 7:00 PM.</li>
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

