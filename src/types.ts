export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
export type RoomStatus = 'full' | 'partial' | 'empty' | 'maintenance';
export type TabType = 'home' | 'rooms' | 'people' | 'money' | 'more';
export type ExpenseCategory = 'Electricity' | 'Maintenance' | 'Internet' | 'Salary' | 'Water' | 'Groceries' | 'Repair' | 'Other';

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roomNumber: number;
  bedNumber?: string;
  rentAmount: number;
  securityDeposit: number;
  status: PaymentStatus;
  balance: number;
  dueDate: string;
  lastPaidDate?: string;
  checkInDate: string;
  checkOutDate?: string;
  emergencyContact: string;
  emergencyPhone: string;
  idProofType: string;
  idProofNumber: string;
  isActive: boolean;
  notes?: string;
  avatarBg?: string;
}

export interface Room {
  id: string;
  number: number;
  name: string;
  capacity: number;
  occupied: number;
  floor: number;
  type: 'AC' | 'Non-AC';
  perBedRent: number;
  status: RoomStatus;
  maintenanceReason?: string;
  occupants: string[];
  amenities?: string[];
}

export interface RentPayment {
  id: string;
  tenantId: string;
  tenantName: string;
  roomNumber: number;
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  balance: number;
  paymentMode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  receiptNo?: string;
  note?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer';
  monthYear: string;
  notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: number;
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved';
  cost?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'info' | 'important';
}
