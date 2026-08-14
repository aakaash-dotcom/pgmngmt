import { useState, useEffect } from 'react';
import {
  TabType,
  Room,
  Tenant,
  RentPayment,
  Expense,
  MaintenanceTicket,
  Notice,
} from './types';
import {
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_RENT_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_MAINTENANCE_TICKETS,
  INITIAL_NOTICES,
} from './data/initialData';

import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { SideDrawer } from './components/SideDrawer';
import { HomeScreen } from './components/HomeScreen';
import { RoomsScreen } from './components/RoomsScreen';
import { PeopleScreen } from './components/PeopleScreen';
import { MoneyScreen } from './components/MoneyScreen';
import { MoreScreen } from './components/MoreScreen';

import { AddTenantModal } from './components/modals/AddTenantModal';
import { CollectRentModal } from './components/modals/CollectRentModal';
import { RentReceiptModal } from './components/modals/RentReceiptModal';
import { RoomDetailModal } from './components/modals/RoomDetailModal';
import { TenantDetailModal } from './components/modals/TenantDetailModal';
import { AddExpenseModal } from './components/modals/AddExpenseModal';
import { AddRoomModal } from './components/modals/AddRoomModal';
import { ActionRequiredModal } from './components/modals/ActionRequiredModal';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('people'); // Matching image 1 default or home
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [peopleFilter, setPeopleFilter] = useState<string | undefined>();

  // Data State with LocalStorage
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('agam_pg_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('agam_pg_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [rentPayments, setRentPayments] = useState<RentPayment[]>(() => {
    const saved = localStorage.getItem('agam_pg_payments');
    return saved ? JSON.parse(saved) : INITIAL_RENT_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('agam_pg_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('agam_pg_tickets');
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE_TICKETS;
  });

  const [notices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('agam_pg_notices');
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('agam_pg_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('agam_pg_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('agam_pg_payments', JSON.stringify(rentPayments));
  }, [rentPayments]);

  useEffect(() => {
    localStorage.setItem('agam_pg_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('agam_pg_tickets', JSON.stringify(maintenanceTickets));
  }, [maintenanceTickets]);

  // Modal States
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isCollectRentOpen, setIsCollectRentOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [isTenantDetailOpen, setIsTenantDetailOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isActionRequiredOpen, setIsActionRequiredOpen] = useState(false);

  // Selected Entities for Modals
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<RentPayment | null>(null);
  const [selectedPaymentForCollect, setSelectedPaymentForCollect] = useState<RentPayment | null>(null);
  const [alertType, setAlertType] = useState<'overdue' | 'stayEnding' | 'refundPending'>('overdue');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Reset to default seed
  const handleResetData = () => {
    setRooms(INITIAL_ROOMS);
    setTenants(INITIAL_TENANTS);
    setRentPayments(INITIAL_RENT_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setMaintenanceTickets(INITIAL_MAINTENANCE_TICKETS);
    localStorage.clear();
    showToast('Reset all demo data successfully!');
  };

  // Add Tenant Handler
  const handleAddTenant = (newTenantData: Omit<Tenant, 'id'>) => {
    const newId = `t-${Date.now()}`;
    const newTenant: Tenant = {
      ...newTenantData,
      id: newId,
    };

    setTenants((prev) => [newTenant, ...prev]);

    // Update Room Occupancy
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (Number(r.number) === Number(newTenant.roomNumber)) {
          const updatedOccupants = [...r.occupants, newTenant.name.split(' ')[0]];
          const newOccupied = updatedOccupants.length;
          const status = newOccupied >= r.capacity ? 'full' : newOccupied > 0 ? 'partial' : 'empty';
          return {
            ...r,
            occupied: newOccupied,
            occupants: updatedOccupants,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
        return r;
      })
    );

    // Create Initial Payment Record
    const newPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: newId,
      tenantName: newTenant.name,
      roomNumber: newTenant.roomNumber,
      amount: newTenant.rentAmount,
      month: 'Aug',
      year: 2026,
      dueDate: '05 AUG',
      paidDate: '02 AUG',
      status: 'Paid',
      balance: 0,
      paymentMode: 'UPI',
      receiptNo: `RCP-2026-08${newTenant.roomNumber}`,
    };
    setRentPayments((prev) => [newPayment, ...prev]);

    showToast(`Admitted ${newTenant.name} to Room ${newTenant.roomNumber}!`);
  };

  // Collect Rent Handler
  const handleConfirmPayment = (details: {
    tenantId: string;
    amountPaid: number;
    paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
    month: string;
    receiptNote?: string;
  }) => {
    const tenant = tenants.find((t) => t.id === details.tenantId);
    if (!tenant) return;

    // Update Tenant Status
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === details.tenantId) {
          const newBal = Math.max(0, (t.balance || t.rentAmount) - details.amountPaid);
          const newStatus = newBal === 0 ? 'Paid' : 'Partial';
          return {
            ...t,
            status: newStatus,
            balance: newBal,
            lastPaidDate: new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Update or Create RentPayment Record
    const receiptNo = `RCP-2026-08${tenant.roomNumber}`;
    const updatedPayment: RentPayment = {
      id: `pay-${Date.now()}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      roomNumber: tenant.roomNumber,
      amount: details.amountPaid,
      month: details.month.split(' ')[0] || 'Aug',
      year: 2026,
      dueDate: '05 AUG',
      paidDate: '14 AUG',
      status: 'Paid',
      balance: 0,
      paymentMode: details.paymentMode,
      receiptNo,
      note: details.receiptNote,
    };

    setRentPayments((prev) => [
      updatedPayment,
      ...prev.filter((p) => p.tenantName !== tenant.name),
    ]);

    setSelectedPaymentForReceipt(updatedPayment);
    setIsReceiptModalOpen(true);
    showToast(`Collected ₹${details.amountPaid} from ${tenant.name}!`);
  };

  // Toggle Tenant Active / Vacated status
  const handleToggleTenantActive = (tenantId: string) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;

    const willBeActive = !target.isActive;

    setTenants((prev) =>
      prev.map((t) => {
        if (t.id === tenantId) {
          return {
            ...t,
            isActive: willBeActive,
            checkOutDate: willBeActive ? undefined : new Date().toISOString().split('T')[0],
          };
        }
        return t;
      })
    );

    // Free or fill bed in room
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (Number(r.number) === Number(target.roomNumber)) {
          let updatedOccupants = r.occupants;
          if (!willBeActive) {
            const firstName = target.name.split(' ')[0];
            updatedOccupants = r.occupants.filter((occ) => occ.toLowerCase() !== firstName.toLowerCase());
          } else {
            updatedOccupants = [...r.occupants, target.name.split(' ')[0]];
          }
          const newOccupied = updatedOccupants.length;
          const status = newOccupied >= r.capacity ? 'full' : newOccupied > 0 ? 'partial' : 'empty';
          return {
            ...r,
            occupied: newOccupied,
            occupants: updatedOccupants,
            status: r.status === 'maintenance' ? 'maintenance' : status,
          };
        }
        return r;
      })
    );

    showToast(willBeActive ? `Reactivated ${target.name}` : `${target.name} marked as Vacated.`);
  };

  // Update Tenant Notes
  const handleUpdateTenantNotes = (tenantId: string, notes: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, notes } : t))
    );
    showToast('Tenant remarks updated.');
  };

  // Toggle Room Maintenance
  const handleToggleRoomMaintenance = (
    roomId: string,
    isMaintenance: boolean,
    reason?: string
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: isMaintenance
              ? 'maintenance'
              : r.occupied >= r.capacity
              ? 'full'
              : r.occupied > 0
              ? 'partial'
              : 'empty',
            maintenanceReason: isMaintenance ? reason || 'Under Maintenance' : undefined,
          };
        }
        return r;
      })
    );
    showToast(isMaintenance ? 'Room placed on maintenance' : 'Room restored to operational');
  };

  // Add Room Handler
  const handleAddRoom = (newRoomData: Omit<Room, 'id' | 'occupied' | 'occupants'>) => {
    const newRoom: Room = {
      ...newRoomData,
      id: `room-${Date.now()}`,
      occupied: 0,
      occupants: [],
      status: 'empty',
    };
    setRooms((prev) => [...prev, newRoom]);
    showToast(`Created Room ${newRoom.number} successfully!`);
  };

  // Add Expense Handler
  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Recorded expense of ₹${newExpense.amount}!`);
  };

  // Top App Bar Contextual "ADD" action
  const handleTopBarAddClick = () => {
    switch (currentTab) {
      case 'rooms':
        setIsAddRoomOpen(true);
        break;
      case 'money':
        setIsAddExpenseOpen(true);
        break;
      case 'people':
      case 'home':
      default:
        setIsAddTenantOpen(true);
        break;
    }
  };

  // Navigation with optional filter
  const handleNavigate = (tab: TabType, filter?: string) => {
    setCurrentTab(tab);
    if (tab === 'people' && filter) {
      setPeopleFilter(filter);
    }
  };

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1c1b1b] font-['Work_Sans',sans-serif] selection:bg-[#14352c] selection:text-white pb-20">
      {/* Top App Bar */}
      <TopAppBar
        currentTab={currentTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onAddClick={handleTopBarAddClick}
      />

      {/* Main Canvas Area */}
      <main className="pt-[58px] min-h-[calc(100vh-130px)]">
        {currentTab === 'home' && (
          <HomeScreen
            rooms={rooms}
            tenants={tenants}
            onNavigate={handleNavigate}
            onAddTenant={() => setIsAddTenantOpen(true)}
            onCollectRent={() => {
              setSelectedPaymentForCollect(null);
              setIsCollectRentOpen(true);
            }}
            onOpenAlertModal={(type) => {
              setAlertType(type);
              setIsActionRequiredOpen(true);
            }}
          />
        )}

        {currentTab === 'rooms' && (
          <RoomsScreen
            rooms={rooms}
            onSelectRoom={(room) => {
              setSelectedRoom(room);
              setIsRoomDetailOpen(true);
            }}
            onAddRoom={() => setIsAddRoomOpen(true)}
          />
        )}

        {currentTab === 'people' && (
          <PeopleScreen
            tenants={tenants}
            onSelectTenant={(tenant) => {
              setSelectedTenant(tenant);
              setIsTenantDetailOpen(true);
            }}
            onAddTenant={() => setIsAddTenantOpen(true)}
            initialFilter={peopleFilter}
          />
        )}

        {currentTab === 'money' && (
          <MoneyScreen
            rentPayments={rentPayments}
            expenses={expenses}
            onMarkPaid={(payment) => {
              setSelectedPaymentForCollect(payment);
              setIsCollectRentOpen(true);
            }}
            onViewReceipt={(payment) => {
              setSelectedPaymentForReceipt(payment);
              setIsReceiptModalOpen(true);
            }}
            onAddExpense={() => setIsAddExpenseOpen(true)}
            onDeleteExpense={(id) => {
              setExpenses((prev) => prev.filter((e) => e.id !== id));
              showToast('Expense removed.');
            }}
          />
        )}

        {currentTab === 'more' && (
          <MoreScreen
            maintenanceTickets={maintenanceTickets}
            notices={notices}
            onUpdateTicketStatus={(id, status) => {
              setMaintenanceTickets((prev) =>
                prev.map((t) => (t.id === id ? { ...t, status } : t))
              );
              showToast('Ticket marked as resolved!');
            }}
          />
        )}
      </main>

      {/* Floating Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-50 bg-[#001f18] text-[#ffdf9b] text-[13px] font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#14352c] animate-in fade-in slide-in-from-bottom-3">
          <span className="material-symbols-outlined text-[18px] text-[#ffdf9b]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setPeopleFilter(undefined);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Side Navigation Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        onResetData={handleResetData}
        onAddTenant={() => setIsAddTenantOpen(true)}
        onAddRoom={() => setIsAddRoomOpen(true)}
        onAddExpense={() => setIsAddExpenseOpen(true)}
      />

      {/* Modals */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
        onAddTenant={handleAddTenant}
        rooms={rooms}
      />

      <CollectRentModal
        isOpen={isCollectRentOpen}
        onClose={() => setIsCollectRentOpen(false)}
        tenants={tenants}
        initialPayment={selectedPaymentForCollect}
        onConfirmPayment={handleConfirmPayment}
      />

      <RentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        payment={selectedPaymentForReceipt}
      />

      <RoomDetailModal
        isOpen={isRoomDetailOpen}
        onClose={() => setIsRoomDetailOpen(false)}
        room={selectedRoom}
        tenants={tenants}
        onAddTenantToRoom={() => {
          setIsAddTenantOpen(true);
        }}
        onToggleMaintenance={handleToggleRoomMaintenance}
        onSelectTenant={(tenant) => {
          setSelectedTenant(tenant);
          setIsTenantDetailOpen(true);
        }}
      />

      <TenantDetailModal
        isOpen={isTenantDetailOpen}
        onClose={() => setIsTenantDetailOpen(false)}
        tenant={selectedTenant}
        onCollectRent={(tenant) => {
          setSelectedTenant(tenant);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
        onToggleActiveStatus={handleToggleTenantActive}
        onUpdateTenantNotes={handleUpdateTenantNotes}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAddExpense={handleAddExpense}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onAddRoom={handleAddRoom}
        nextRoomNumber={rooms.length + 1}
      />

      <ActionRequiredModal
        isOpen={isActionRequiredOpen}
        onClose={() => setIsActionRequiredOpen(false)}
        alertType={alertType}
        tenants={tenants}
        onSelectTenant={(t) => {
          setSelectedTenant(t);
          setIsTenantDetailOpen(true);
        }}
        onCollectRent={(t) => {
          setSelectedTenant(t);
          setSelectedPaymentForCollect(null);
          setIsCollectRentOpen(true);
        }}
      />
    </div>
  );
}
