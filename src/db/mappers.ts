// ==========================================
// Cloud SQL <-> App entity mappers
// ==========================================
// The app's UI entities (src/types.ts) and the Cloud SQL tables
// (src/db/schema.ts) use different field names and shapes. These mappers
// translate both directions so /api/pg/data accepts the exact payload the
// client sends and returns data in the app's shape.
// ==========================================

const toNumber = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toStr = (v: any, fallback = ''): string =>
  v === undefined || v === null || v === '' ? fallback : String(v);

const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const monthYearNow = (): string =>
  new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

const parseAmenities = (raw: any): string[] => {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

// App stores bed numbers like "B1"; the DB column is an integer.
const parseBedNumber = (bed: any): number => {
  if (typeof bed === 'number' && Number.isFinite(bed)) return Math.max(1, Math.trunc(bed));
  const m = String(bed ?? '').match(/\d+/);
  return m ? Math.max(1, parseInt(m[0], 10)) : 1;
};

// ---------------- Rooms ----------------

export const roomToDbRow = (r: any, userId: string) => ({
  id: toStr(r.id),
  userId,
  roomNumber: toStr(r.number ?? r.roomNumber),
  floor: toNumber(r.floor, 1),
  sharingType: toStr(r.sharingType ?? `${toNumber(r.capacity ?? r.totalBeds, 1)}-Sharing`),
  rentPerBed: toNumber(r.perBedRent ?? r.rentPerBed, 0),
  totalBeds: toNumber(r.capacity ?? r.totalBeds, 1),
  amenities: JSON.stringify(r.amenities || []),
  ac: r.type ? r.type === 'AC' : Boolean(r.ac),
  attachedBathroom: r.attachedBathroom ?? true,
  geyser: r.geyser ?? true,
  ventilation: r.ventilation ?? true,
  balcony: r.balcony ?? false,
  notes: toStr(r.notes ?? r.maintenanceReason ?? r.name),
});

export const roomFromDbRow = (r: any): any => ({
  id: r.id,
  number: toNumber(r.roomNumber),
  name: `Room ${r.roomNumber}`,
  capacity: toNumber(r.totalBeds, 1),
  occupied: 0, // occupancy is recomputed client-side from active tenants
  floor: toNumber(r.floor, 1),
  type: r.ac ? 'AC' : 'Non-AC',
  perBedRent: toNumber(r.rentPerBed, 0),
  status: 'empty',
  occupants: [],
  amenities: parseAmenities(r.amenities),
});

// ---------------- Tenants ----------------

export const tenantToDbRow = (t: any, userId: string) => ({
  id: toStr(t.id),
  userId,
  name: toStr(t.name, 'Unknown'),
  phone: toStr(t.phone),
  email: t.email || null,
  roomNumber: toStr(t.roomNumber),
  bedNumber: parseBedNumber(t.bedNumber),
  checkInDate: toStr(t.checkInDate, todayStr()),
  rentAmount: toNumber(t.rentAmount, 0),
  depositAmount: toNumber(t.securityDeposit ?? t.depositAmount, 0),
  idProofType: toStr(t.idProofType, 'Aadhaar'),
  idProofNumber: toStr(t.idProofNumber),
  fatherName: t.fatherName || null,
  emergencyContact: toStr(t.emergencyPhone ?? t.emergencyContact),
  collegeOrCompany: t.collegeOrCompany || null,
  nativePlace: t.nativePlace || null,
  status: t.isActive === false ? 'vacated' : 'active',
  foodPreference: t.foodPreference || null,
  bikeNumber: t.bikeNumber || null,
});

export const tenantFromDbRow = (t: any): any => ({
  id: t.id,
  name: t.name,
  phone: t.phone,
  email: t.email || undefined,
  roomNumber: toNumber(t.roomNumber),
  bedNumber: `B${toNumber(t.bedNumber, 1)}`,
  rentAmount: toNumber(t.rentAmount, 0),
  securityDeposit: toNumber(t.depositAmount, 0),
  status: 'Unpaid',
  balance: 0,
  dueDate: '',
  checkInDate: t.checkInDate || todayStr(),
  emergencyContact: t.emergencyContact || '',
  emergencyPhone: t.emergencyContact || '',
  idProofType: t.idProofType || 'Aadhaar',
  idProofNumber: t.idProofNumber || '',
  isActive: t.status !== 'vacated',
  notes:
    [
      t.fatherName ? `Father: ${t.fatherName}` : '',
      t.collegeOrCompany ? `College/Company: ${t.collegeOrCompany}` : '',
      t.nativePlace ? `Native: ${t.nativePlace}` : '',
      t.bikeNumber ? `Bike: ${t.bikeNumber}` : '',
    ]
      .filter(Boolean)
      .join(' | ') || undefined,
});

// ---------------- Rent Payments ----------------

const paymentStatusToDb = (s: any): string => {
  const v = String(s || '').toLowerCase();
  if (v === 'paid') return 'paid';
  if (v === 'partial') return 'partial';
  return 'unpaid';
};

const dbStatusToPaymentStatus = (s: any): 'Paid' | 'Unpaid' | 'Partial' => {
  const v = String(s || '').toLowerCase();
  if (v === 'paid') return 'Paid';
  if (v === 'partial') return 'Partial';
  return 'Unpaid';
};

export const paymentToDbRow = (p: any, userId: string) => ({
  id: toStr(p.id),
  userId,
  tenantId: toStr(p.tenantId),
  tenantName: toStr(p.tenantName),
  roomNumber: toStr(p.roomNumber),
  monthYear: toStr(
    p.monthYear ?? (p.month && p.year ? `${p.month} ${p.year}` : undefined),
    monthYearNow()
  ),
  amount: toNumber(p.amount, 0),
  paymentDate: toStr(p.paymentDate ?? p.paidDate, todayStr()),
  paymentMode: toStr(p.paymentMode, 'Cash'),
  transactionRef: p.transactionRef || null,
  status: paymentStatusToDb(p.status),
  notes: p.note || p.notes || null,
});

export const paymentFromDbRow = (p: any): any => {
  const [month = '', year = ''] = String(p.monthYear || '').split(' ');
  return {
    id: p.id,
    tenantId: p.tenantId,
    tenantName: p.tenantName,
    roomNumber: toNumber(p.roomNumber),
    amount: toNumber(p.amount, 0),
    month,
    year: toNumber(year, new Date().getFullYear()),
    dueDate: '',
    paidDate: p.paymentDate || undefined,
    status: dbStatusToPaymentStatus(p.status),
    balance: 0,
    paymentMode: p.paymentMode || undefined,
    note: p.notes || undefined,
  };
};

// ---------------- Expenses ----------------

export const expenseToDbRow = (e: any, userId: string) => ({
  id: toStr(e.id),
  userId,
  title: toStr(e.title, 'Expense'),
  amount: toNumber(e.amount, 0),
  category: toStr(e.category, 'Miscellaneous'),
  date: toStr(e.date, todayStr()),
  paidTo: e.paidTo || null,
  paymentMode: toStr(e.paymentMode, 'Cash'),
  receiptUrl: e.receiptUrl || null,
  notes: e.notes || null,
});

export const expenseFromDbRow = (e: any): any => ({
  id: e.id,
  title: e.title,
  amount: toNumber(e.amount, 0),
  category: e.category,
  date: e.date,
  paidTo: e.paidTo || '',
  paymentMode: e.paymentMode || 'Cash',
  monthYear: e.date
    ? new Date(e.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : monthYearNow(),
  notes: e.notes || undefined,
});

// ---------------- Incomes ----------------

export const incomeToDbRow = (i: any, userId: string) => ({
  id: toStr(i.id),
  userId,
  title: toStr(i.title, 'Income'),
  amount: toNumber(i.amount, 0),
  category: toStr(i.category, 'Other Income'),
  date: toStr(i.date, todayStr()),
  receivedFrom: i.receivedFrom || null,
  paymentMode: toStr(i.paymentMode, 'Cash'),
  receiptUrl: i.receiptUrl || null,
  notes: i.notes || null,
});

export const incomeFromDbRow = (i: any): any => ({
  id: i.id,
  title: i.title,
  amount: toNumber(i.amount, 0),
  category: i.category,
  date: i.date,
  receivedFrom: i.receivedFrom || '',
  paymentMode: i.paymentMode || 'Cash',
  monthYear: i.date
    ? new Date(i.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : monthYearNow(),
  notes: i.notes || undefined,
});

// ---------------- Staff Contacts ----------------

export const staffToDbRow = (s: any, userId: string) => ({
  id: toStr(s.id),
  userId,
  name: toStr(s.name, 'Staff'),
  role: toStr(s.role, 'Other Service'),
  phone: toStr(s.phone),
  dutyTimings: s.dutyTimings || null,
  notes: s.notes || null,
});

export const staffFromDbRow = (s: any): any => ({
  id: s.id,
  name: s.name,
  role: s.role,
  phone: s.phone,
  notes: s.notes || undefined,
});

// ---------------- Maintenance Tickets ----------------

const ticketStatusToDb = (s: any): string => {
  const v = String(s || '').toLowerCase();
  if (v === 'resolved') return 'resolved';
  if (v === 'in-progress' || v === 'in_progress') return 'in_progress';
  return 'open';
};

export const ticketToDbRow = (m: any, userId: string) => ({
  id: toStr(m.id),
  userId,
  roomNumber: toStr(m.roomNumber),
  category: toStr(m.category ?? m.priority, 'General'),
  description: toStr(m.description ?? m.title),
  reportedDate: toStr(m.reportedDate, todayStr()),
  resolvedDate: m.resolvedDate || null,
  status: ticketStatusToDb(m.status),
  assignedTo: m.assignedTo || m.reportedBy || null,
  cost: toNumber(m.cost, 0),
  notes: m.title || m.notes || null,
});

export const ticketFromDbRow = (m: any): any => ({
  id: m.id,
  roomNumber: toNumber(m.roomNumber),
  title: m.notes || m.category || 'Maintenance',
  description: m.description || '',
  reportedBy: m.assignedTo || '',
  reportedDate: m.reportedDate || todayStr(),
  priority: 'medium',
  status:
    String(m.status) === 'resolved'
      ? 'resolved'
      : String(m.status) === 'in_progress'
      ? 'in-progress'
      : 'pending',
  cost: toNumber(m.cost, 0),
});
