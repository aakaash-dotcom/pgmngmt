export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partial' | 'Overdue' | 'Company Billed';
export type RoomStatus = 'full' | 'partial' | 'empty' | 'maintenance';
export type TabType = 'home' | 'rooms' | 'people' | 'money' | 'more';
export type BillingModel = 'individual_monthly' | 'company_end_of_month';

export type ExpenseCategory =
  | 'Electricity'
  | 'Building Rent'
  | 'Water Tanker'
  | 'Internet / Wi-Fi'
  | 'Housekeeping & Cleaning'
  | 'Plumbing & Repairs'
  | 'Staff & Caretaker Salary'
  | 'Waste Disposal'
  | 'Property Tax / Govt'
  | 'Miscellaneous';

export type IncomeCategory =
  | 'Monthly Rent'
  | 'Bulk Company Rent'
  | 'Security Deposit'
  | 'Admission / Registration'
  | 'Late Fine / Penalty'
  | 'Extra Amenity / Key'
  | 'Other Income';

export interface BulkGroup {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  rentPerPerson: number;
  advancePerPerson: number;
  billingModel: BillingModel;
  notes?: string;
  createdDate: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email?: string;
  roomNumber: number;
  bedNumber?: string; // e.g. "B1", "B2", "B3"
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

  // Bulk / Corporate Contract fields
  isBulkContract?: boolean;
  groupName?: string; // e.g. "Nepal Hotel Group", "Taj Hotel Batch"
  companyName?: string; // e.g. "Grand Palace Banquets & Hotel"
  companyContactPhone?: string;
  billingModel?: BillingModel; // 'company_end_of_month' or 'individual_monthly'
  
  // Document Collection checklist
  documentsCollected?: boolean; // Overall documents collected
  idDocumentCollected?: boolean; // Aadhaar / Passport collected
  agreementCollected?: boolean; // Signed agreement collected
  documentPhotoUrl?: string;
  termsDocumentUrl?: string;
}

export interface Room {
  id: string;
  number: number;
  name: string;
  capacity: number; // 1 to 10 sharing
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
  bedNumber?: string;
  amount: number;
  month: string;
  year: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  balance: number;
  paymentMode?: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  note?: string;
  isBulkPayment?: boolean;
  companyName?: string;
  groupName?: string;
}

export interface Income {
  id: string;
  title: string;
  category: IncomeCategory;
  amount: number;
  date: string;
  receivedFrom: string;
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
  monthYear: string;
  notes?: string;
  isBulkIncome?: boolean;
  groupName?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidTo: string;
  paymentMode: 'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque';
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

export type StaffRole =
  | 'Cleaner / Housekeeping'
  | 'Electrician'
  | 'Plumber'
  | 'Water Tanker Supplier'
  | 'Cook / Kitchen'
  | 'Caretaker / Security'
  | 'Internet / Wi-Fi Technician'
  | 'Carpenter / Repairs'
  | 'Painter'
  | 'Waste Collector'
  | 'Other Service';

export interface StaffContact {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  alternatePhone?: string;
  notes?: string;
  isAvailable?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'info' | 'important';
}

export interface WhatsAppTemplate {
  id: string;
  title: string;
  topic: string;
  template: string;
  category: 'individual' | 'group' | 'general';
  isDefault?: boolean;
}
