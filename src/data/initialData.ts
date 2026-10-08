import { Room, Tenant, RentPayment, Expense, Income, MaintenanceTicket, Notice, StaffContact, WhatsAppTemplate } from '../types';

export const OWNER_PHONE = '86106 53352';
export const OWNER_PHONE_INTL = '+91 86106 53352';
export const PG_NAME = "Agam Men's PG & Stay";
export const OWNER_UPI_ID = '8610653352@okaxis';

// Clean defaults: 0 rooms, 0 tenants, 0 mock records
export const INITIAL_ROOMS: Room[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_RENT_PAYMENTS: RentPayment[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_INCOMES: Income[] = [];
export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [];
export const INITIAL_STAFF_CONTACTS: StaffContact[] = [];
export const INITIAL_NOTICES: Notice[] = [];

export const INITIAL_WA_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Monthly Rent Due Reminder',
    topic: 'Rent Reminder',
    category: 'individual',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - RENT REMINDER*\n\nDear *{name}* (Room {room}, {bed}),\n\nThis is a friendly reminder that your monthly accommodation fee of *₹{rent}* is due on *{due_date}*.\n\n💳 *UPI ID:* {upi_id}\n📱 *GPay / PhonePe / Paytm:* {owner_phone}\n🏨 *PG:* {pg_name}\n\nKindly complete the payment and share the transaction screenshot. Thank you for your cooperation!\n- Management, {pg_name}`
  },
  {
    id: 'tmpl-3',
    title: 'Advance / Security Deposit Confirmation',
    topic: 'Deposit Receipt',
    category: 'individual',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - ADVANCE RECEIPT*\n\nDear *{name}*,\n\nWe have received your advance / security deposit of *₹{deposit}* for *Room {room} ({bed})*.\n\n✅ *Status:* Confirmed & Bed Allocated\n📅 *Check-In Date:* {check_in_date}\n\nWelcome to Agam Men's PG & Stay! For any assistance, please contact the caretaker or manager at {owner_phone}.`
  },
  {
    id: 'tmpl-4',
    title: 'Hostel Gate Timings & House Rules',
    topic: 'House Rules',
    category: 'general',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - IMPORTANT HOUSE RULES*\n\nDear Residents,\n\nPlease make note of our community guidelines for a comfortable stay:\n\n🚪 *Main Gate Closes at 10:30 PM strictly.*\n🧹 Housekeeping cleanings on Monday, Wednesday & Saturday mornings.\n🚭 Smoking and alcohol are strictly prohibited on premises.\n⚡ Please turn off lights, fans, and ACs when leaving your room.\n\nFor any repair or maintenance issues, contact caretaker Somu or manager at *{owner_phone}*.\n- Management, {pg_name}`
  },
  {
    id: 'tmpl-5',
    title: 'Water Tanker & Supply Notice',
    topic: 'Water Notice',
    category: 'general',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - WATER SUPPLY NOTICE*\n\nDear Residents,\n\nWater tanker delivery and overhead tank chlorination is scheduled today between *{time_slot}*.\n\nWater flow may be temporarily paused for 45 minutes during the refill. Please store necessary water in advance.\n\n- Management, {pg_name}`
  },
  {
    id: 'tmpl-6',
    title: 'Wi-Fi & Fiber Maintenance Notice',
    topic: 'WiFi Notice',
    category: 'general',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - WI-FI MAINTENANCE*\n\nDear Residents,\n\nHigh-speed fiber line optimization & mesh router maintenance is in progress today between *11:00 AM to 1:00 PM*.\n\nSpeeds may fluctuate briefly. Inconvenience is regretted.\n- Management, {pg_name}`
  }
];

export const MONTHLY_TREND_DATA = [
  { month: 'Mar', revenue: 0, expense: 0, profit: 0 },
  { month: 'Apr', revenue: 0, expense: 0, profit: 0 },
  { month: 'May', revenue: 0, expense: 0, profit: 0 },
  { month: 'Jun', revenue: 0, expense: 0, profit: 0 },
  { month: 'Jul', revenue: 0, expense: 0, profit: 0 },
  { month: 'Aug', revenue: 0, expense: 0, profit: 0 }
];
