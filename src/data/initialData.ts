import { Room, Tenant, RentPayment, Expense, Income, MaintenanceTicket, Notice, StaffContact, BulkGroup, WhatsAppTemplate } from '../types';

export const OWNER_PHONE = '86106 53352';
export const OWNER_PHONE_INTL = '+91 86106 53352';
export const PG_NAME = "Agam Men's PG & Stay";
export const OWNER_UPI_ID = '8610653352@okaxis';

export const INITIAL_BULK_GROUPS: BulkGroup[] = [
  {
    id: 'grp-1',
    name: 'Nepal Hotel Hospitality Group',
    companyName: 'The Royal Grand Hotel & Banquets',
    contactPerson: 'Sunil Thapa (Supervisor)',
    contactPhone: '+91 98451 12345',
    rentPerPerson: 4500,
    advancePerPerson: 4500,
    billingModel: 'company_end_of_month',
    notes: '12 staff members. Advance collected at check-in. Monthly rent paid collectively by Hotel accounts on the 30th.',
    createdDate: '2025-06-01',
  },
  {
    id: 'grp-2',
    name: 'Apex IT Trainees Batch',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    contactPerson: 'HR Ramesh Nair',
    contactPhone: '+91 99160 88990',
    rentPerPerson: 4800,
    advancePerPerson: 4800,
    billingModel: 'company_end_of_month',
    notes: 'Trainee batch. Company transfers consolidated monthly accommodation fees.',
    createdDate: '2025-10-15',
  }
];

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    number: 101,
    name: 'Room 101',
    capacity: 4,
    occupied: 4,
    floor: 1,
    type: 'AC',
    perBedRent: 4500,
    status: 'full',
    occupants: ['Rahul', 'Bikash', 'Samir', 'Rajesh'],
    amenities: ['Attached Bath', 'Balcony', 'Geyser', 'Study Desk', 'Individual Wardrobes']
  },
  {
    id: 'room-2',
    number: 102,
    name: 'Room 102',
    capacity: 3,
    occupied: 2,
    floor: 1,
    type: 'AC',
    perBedRent: 4800,
    status: 'partial',
    occupants: ['Karthik', 'Manoj'],
    amenities: ['Attached Bath', 'Geyser', 'Balcony']
  },
  {
    id: 'room-3',
    number: 103,
    name: 'Room 103',
    capacity: 2,
    occupied: 0,
    floor: 1,
    type: 'Non-AC',
    perBedRent: 3800,
    status: 'empty',
    occupants: [],
    amenities: ['Fan', 'Cupboards', 'Shared Bath']
  },
  {
    id: 'room-4',
    number: 104,
    name: 'Room 104',
    capacity: 6,
    occupied: 0,
    floor: 1,
    type: 'Non-AC',
    perBedRent: 3500,
    status: 'maintenance',
    maintenanceReason: 'Bathroom tap replacement & whitewash',
    occupants: [],
    amenities: ['Shared Bath', 'Cupboards', '6-Locker Setup']
  },
  {
    id: 'room-5',
    number: 201,
    name: 'Room 201',
    capacity: 4,
    occupied: 4,
    floor: 2,
    type: 'AC',
    perBedRent: 4500,
    status: 'full',
    occupants: ['Prakash', 'Suresh', 'Amit', 'Nitin'],
    amenities: ['Attached Bath', 'Balcony', 'Geyser']
  },
  {
    id: 'room-6',
    number: 202,
    name: 'Room 202',
    capacity: 3,
    occupied: 2,
    floor: 2,
    type: 'AC',
    perBedRent: 4800,
    status: 'partial',
    occupants: ['Vikram', 'Ramesh'],
    amenities: ['Attached Bath', 'Geyser']
  },
  {
    id: 'room-7',
    number: 203,
    name: 'Room 203',
    capacity: 2,
    occupied: 2,
    floor: 2,
    type: 'AC',
    perBedRent: 5500,
    status: 'full',
    occupants: ['Surya', 'Pratap'],
    amenities: ['Attached Bath', 'Balcony', 'Study Table', 'Workstation']
  },
  {
    id: 'room-8',
    number: 204,
    name: 'Room 204',
    capacity: 4,
    occupied: 4,
    floor: 2,
    type: 'Non-AC',
    perBedRent: 3800,
    status: 'full',
    occupants: ['Hari', 'Ganesh', 'Ravi', 'Pavan'],
    amenities: ['Attached Bath', 'Geyser', 'Cupboards']
  },
  {
    id: 'room-9',
    number: 301,
    name: 'Room 301',
    capacity: 1,
    occupied: 1,
    floor: 3,
    type: 'AC',
    perBedRent: 8500,
    status: 'full',
    occupants: ['Vivek'],
    amenities: ['Single Executive Room', 'Attached Bath', 'Balcony', 'Smart TV']
  },
  {
    id: 'room-10',
    number: 302,
    name: 'Room 302',
    capacity: 5,
    occupied: 2,
    floor: 3,
    type: 'AC',
    perBedRent: 4200,
    status: 'partial',
    occupants: ['Sanjay', 'Kiran'],
    amenities: ['Attached Bath', 'Geyser', 'Spacious Balcony']
  },
  {
    id: 'room-11',
    number: 303,
    name: 'Room 303',
    capacity: 8,
    occupied: 4,
    floor: 3,
    type: 'AC',
    perBedRent: 3800,
    status: 'partial',
    occupants: ['Naveen', 'Ashok', 'Dinesh', 'Babu'],
    amenities: ['Attached 2-Bath', '8 Wardrobes', 'Balcony', 'Geyser']
  },
  {
    id: 'room-12',
    number: 304,
    name: 'Room 304',
    capacity: 2,
    occupied: 0,
    floor: 3,
    type: 'Non-AC',
    perBedRent: 3800,
    status: 'empty',
    occupants: [],
    amenities: ['Fan', 'Cupboards', 'Shared Bath']
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 't-1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@example.com',
    roomNumber: 101,
    bedNumber: 'B1',
    rentAmount: 4500,
    securityDeposit: 4500,
    status: 'Paid',
    balance: 0,
    dueDate: '2026-08-05',
    lastPaidDate: '2026-08-03',
    checkInDate: '2025-06-15',
    emergencyContact: 'Vijay Sharma (Father)',
    emergencyPhone: '+91 98765 43219',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-8921',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly',
    notes: 'Software engineer at IT park. Very prompt with UPI rent.'
  },
  {
    id: 't-np-1',
    name: 'Bikash Thapa',
    phone: '+91 98451 11201',
    roomNumber: 101,
    bedNumber: 'B2',
    rentAmount: 4500,
    securityDeposit: 4500,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-30',
    checkInDate: '2025-06-01',
    emergencyContact: 'Sunil Thapa (Supervisor)',
    emergencyPhone: '+91 98451 12345',
    idProofType: 'Passport',
    idProofNumber: 'NP-CIT-882190',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Nepal Hotel Hospitality Group',
    companyName: 'The Royal Grand Hotel & Banquets',
    companyContactPhone: '+91 98451 12345',
    billingModel: 'company_end_of_month',
    notes: 'Advance paid on arrival. Monthly rent billed to The Royal Grand Hotel at month end.'
  },
  {
    id: 't-np-2',
    name: 'Samir Gurung',
    phone: '+91 98451 11202',
    roomNumber: 101,
    bedNumber: 'B3',
    rentAmount: 4500,
    securityDeposit: 4500,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-30',
    checkInDate: '2025-06-01',
    emergencyContact: 'Sunil Thapa (Supervisor)',
    emergencyPhone: '+91 98451 12345',
    idProofType: 'Passport',
    idProofNumber: 'NP-CIT-882191',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Nepal Hotel Hospitality Group',
    companyName: 'The Royal Grand Hotel & Banquets',
    companyContactPhone: '+91 98451 12345',
    billingModel: 'company_end_of_month',
    notes: 'Advance paid. Monthly rent billed directly to company.'
  },
  {
    id: 't-np-3',
    name: 'Rajesh Shrestha',
    phone: '+91 98451 11203',
    roomNumber: 101,
    bedNumber: 'B4',
    rentAmount: 4500,
    securityDeposit: 4500,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-30',
    checkInDate: '2025-06-01',
    emergencyContact: 'Sunil Thapa (Supervisor)',
    emergencyPhone: '+91 98451 12345',
    idProofType: 'Passport',
    idProofNumber: 'NP-CIT-882192',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Nepal Hotel Hospitality Group',
    companyName: 'The Royal Grand Hotel & Banquets',
    companyContactPhone: '+91 98451 12345',
    billingModel: 'company_end_of_month',
    notes: 'Advance collected. Company invoice generated on the 30th.'
  },
  {
    id: 't-2',
    name: 'Amit Kumar',
    phone: '+91 98123 45678',
    email: 'amit.kumar@example.com',
    roomNumber: 201,
    bedNumber: 'B3',
    rentAmount: 4500,
    securityDeposit: 4500,
    status: 'Overdue',
    balance: 4500,
    dueDate: '2026-08-05',
    checkInDate: '2025-08-10',
    emergencyContact: 'Ramesh Kumar (Brother)',
    emergencyPhone: '+91 98123 45670',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-4412',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly',
    notes: 'Salary credit delayed till 12th Aug. Promised to clear soon.'
  },
  {
    id: 't-3',
    name: 'Vikram Singh',
    phone: '+91 99887 76655',
    email: 'vikram.singh@example.com',
    roomNumber: 202,
    bedNumber: 'B1',
    rentAmount: 4800,
    securityDeposit: 4800,
    status: 'Partial',
    balance: 1800,
    dueDate: '2026-08-05',
    lastPaidDate: '2026-08-02',
    checkInDate: '2025-11-20',
    emergencyContact: 'Mahendra Singh (Father)',
    emergencyPhone: '+91 99887 76650',
    idProofType: 'Aadhaar',
    idProofNumber: 'DL-1420110012345',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly',
    notes: 'Paid ₹3,000 partial on 2nd Aug; ₹1,800 balance pending.'
  },
  {
    id: 't-4',
    name: 'Karthik Raja',
    phone: '+91 97111 22334',
    roomNumber: 102,
    bedNumber: 'B1',
    rentAmount: 4800,
    securityDeposit: 4800,
    status: 'Paid',
    balance: 0,
    dueDate: '2026-08-05',
    lastPaidDate: '2026-08-01',
    checkInDate: '2025-07-01',
    emergencyContact: 'Mother',
    emergencyPhone: '+91 97111 22300',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-7766',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly'
  },
  {
    id: 't-5',
    name: 'Manoj Kumar',
    phone: '+91 97111 33445',
    roomNumber: 102,
    bedNumber: 'B2',
    rentAmount: 4800,
    securityDeposit: 4800,
    status: 'Overdue',
    balance: 4800,
    dueDate: '2026-08-05',
    checkInDate: '2025-09-10',
    emergencyContact: 'Brother',
    emergencyPhone: '+91 97111 33400',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-3321',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly'
  },
  {
    id: 't-ap-1',
    name: 'Hari Prasad',
    phone: '+91 98450 11001',
    roomNumber: 204,
    bedNumber: 'B1',
    rentAmount: 3800,
    securityDeposit: 3800,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-31',
    checkInDate: '2025-10-15',
    emergencyContact: 'Apex HR Ramesh',
    emergencyPhone: '+91 99160 88990',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-9911',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Apex IT Trainees Batch',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    companyContactPhone: '+91 99160 88990',
    billingModel: 'company_end_of_month',
    notes: 'Advance collected. Monthly rent billed to Apex Cloud Solutions.'
  },
  {
    id: 't-ap-2',
    name: 'Ganesh Rao',
    phone: '+91 98450 11002',
    roomNumber: 204,
    bedNumber: 'B2',
    rentAmount: 3800,
    securityDeposit: 3800,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-31',
    checkInDate: '2025-10-15',
    emergencyContact: 'Apex HR Ramesh',
    emergencyPhone: '+91 99160 88990',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-9912',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Apex IT Trainees Batch',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    companyContactPhone: '+91 99160 88990',
    billingModel: 'company_end_of_month'
  },
  {
    id: 't-ap-3',
    name: 'Ravi Teja',
    phone: '+91 98450 11003',
    roomNumber: 204,
    bedNumber: 'B3',
    rentAmount: 3800,
    securityDeposit: 3800,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-31',
    checkInDate: '2025-10-15',
    emergencyContact: 'Apex HR Ramesh',
    emergencyPhone: '+91 99160 88990',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-9913',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Apex IT Trainees Batch',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    companyContactPhone: '+91 99160 88990',
    billingModel: 'company_end_of_month'
  },
  {
    id: 't-ap-4',
    name: 'Pavan Kalyan',
    phone: '+91 98450 11004',
    roomNumber: 204,
    bedNumber: 'B4',
    rentAmount: 3800,
    securityDeposit: 3800,
    status: 'Company Billed',
    balance: 0,
    dueDate: '2026-08-31',
    checkInDate: '2025-10-15',
    emergencyContact: 'Apex HR Ramesh',
    emergencyPhone: '+91 99160 88990',
    idProofType: 'Aadhaar',
    idProofNumber: 'XXXX-XXXX-9914',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: true,
    groupName: 'Apex IT Trainees Batch',
    companyName: 'Apex Cloud Solutions Pvt Ltd',
    companyContactPhone: '+91 99160 88990',
    billingModel: 'company_end_of_month'
  },
  {
    id: 't-6',
    name: 'Vivek Murthy',
    phone: '+91 98222 11000',
    roomNumber: 301,
    bedNumber: 'B1',
    rentAmount: 8500,
    securityDeposit: 8500,
    status: 'Paid',
    balance: 0,
    dueDate: '2026-08-05',
    lastPaidDate: '2026-08-01',
    checkInDate: '2025-05-01',
    emergencyContact: 'Wife',
    emergencyPhone: '+91 98222 11005',
    idProofType: 'Passport',
    idProofNumber: 'Z-8910291',
    documentsCollected: true,
    idDocumentCollected: true,
    agreementCollected: true,
    isActive: true,
    isBulkContract: false,
    billingModel: 'individual_monthly'
  }
];

export const INITIAL_RENT_PAYMENTS: RentPayment[] = [
  // August 2026
  {
    id: 'pay-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    bedNumber: 'B1',
    amount: 4500,
    month: 'Aug 2026',
    year: 2026,
    dueDate: '2026-08-05',
    paidDate: '2026-08-03',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI',
    note: 'Google Pay UPI Reference #89129012'
  },
  {
    id: 'pay-2',
    tenantId: 't-3',
    tenantName: 'Vikram Singh',
    roomNumber: 202,
    bedNumber: 'B1',
    amount: 3000,
    month: 'Aug 2026',
    year: 2026,
    dueDate: '2026-08-05',
    paidDate: '2026-08-02',
    status: 'Partial',
    balance: 1800,
    paymentMode: 'UPI',
    note: 'PhonePe UPI #33441029 (₹1800 pending)'
  },
  {
    id: 'pay-3',
    tenantId: 't-4',
    tenantName: 'Karthik Raja',
    roomNumber: 102,
    bedNumber: 'B1',
    amount: 4800,
    month: 'Aug 2026',
    year: 2026,
    dueDate: '2026-08-05',
    paidDate: '2026-08-01',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-4',
    tenantId: 't-6',
    tenantName: 'Vivek Murthy',
    roomNumber: 301,
    bedNumber: 'B1',
    amount: 8500,
    month: 'Aug 2026',
    year: 2026,
    dueDate: '2026-08-05',
    paidDate: '2026-08-01',
    status: 'Paid',
    balance: 0,
    paymentMode: 'Bank Transfer'
  },
  {
    id: 'pay-5',
    tenantId: 't-np-1',
    tenantName: 'Bikash Thapa',
    roomNumber: 101,
    bedNumber: 'B2',
    amount: 4500,
    month: 'Aug 2026',
    year: 2026,
    dueDate: '2026-08-30',
    paidDate: '2026-08-10',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },

  // July 2026
  {
    id: 'pay-bulk-jul',
    tenantId: 'bulk-royal-grand',
    tenantName: 'The Royal Grand Hotel & Banquets (Nepal Staff Group)',
    roomNumber: 101,
    amount: 13500,
    month: 'Jul 2026',
    year: 2026,
    dueDate: '2026-07-31',
    paidDate: '2026-07-31',
    status: 'Paid',
    balance: 0,
    paymentMode: 'Bank Transfer',
    isBulkPayment: true,
    companyName: 'The Royal Grand Hotel & Banquets',
    groupName: 'Nepal Hotel Hospitality Group'
  },
  {
    id: 'pay-jul-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    amount: 4500,
    month: 'Jul 2026',
    year: 2026,
    dueDate: '2026-07-05',
    paidDate: '2026-07-04',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-jul-2',
    tenantId: 't-3',
    tenantName: 'Vikram Singh',
    roomNumber: 202,
    amount: 4800,
    month: 'Jul 2026',
    year: 2026,
    dueDate: '2026-07-05',
    paidDate: '2026-07-05',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-jul-3',
    tenantId: 't-6',
    tenantName: 'Vivek Murthy',
    roomNumber: 301,
    amount: 8500,
    month: 'Jul 2026',
    year: 2026,
    dueDate: '2026-07-05',
    paidDate: '2026-07-02',
    status: 'Paid',
    balance: 0,
    paymentMode: 'Bank Transfer'
  },

  // June 2026
  {
    id: 'pay-jun-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    amount: 4500,
    month: 'Jun 2026',
    year: 2026,
    dueDate: '2026-06-05',
    paidDate: '2026-06-03',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-jun-2',
    tenantId: 't-3',
    tenantName: 'Vikram Singh',
    roomNumber: 202,
    amount: 4800,
    month: 'Jun 2026',
    year: 2026,
    dueDate: '2026-06-05',
    paidDate: '2026-06-05',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-jun-3',
    tenantId: 't-6',
    tenantName: 'Vivek Murthy',
    roomNumber: 301,
    amount: 8500,
    month: 'Jun 2026',
    year: 2026,
    dueDate: '2026-06-05',
    paidDate: '2026-06-01',
    status: 'Paid',
    balance: 0,
    paymentMode: 'Bank Transfer'
  },

  // May 2026
  {
    id: 'pay-may-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    amount: 4500,
    month: 'May 2026',
    year: 2026,
    dueDate: '2026-05-05',
    paidDate: '2026-05-04',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-may-2',
    tenantId: 't-3',
    tenantName: 'Vikram Singh',
    roomNumber: 202,
    amount: 4800,
    month: 'May 2026',
    year: 2026,
    dueDate: '2026-05-05',
    paidDate: '2026-05-05',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },

  // April 2026
  {
    id: 'pay-apr-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    amount: 4500,
    month: 'Apr 2026',
    year: 2026,
    dueDate: '2026-04-05',
    paidDate: '2026-04-03',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },
  {
    id: 'pay-apr-2',
    tenantId: 't-3',
    tenantName: 'Vikram Singh',
    roomNumber: 202,
    amount: 4800,
    month: 'Apr 2026',
    year: 2026,
    dueDate: '2026-04-05',
    paidDate: '2026-04-05',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  },

  // March 2026
  {
    id: 'pay-mar-1',
    tenantId: 't-1',
    tenantName: 'Rahul Sharma',
    roomNumber: 101,
    amount: 4500,
    month: 'Mar 2026',
    year: 2026,
    dueDate: '2026-03-05',
    paidDate: '2026-03-04',
    status: 'Paid',
    balance: 0,
    paymentMode: 'UPI'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  // August 2026
  {
    id: 'exp-1',
    title: 'Electricity Bill (BESCOM / State Power)',
    category: 'Electricity',
    amount: 14500,
    date: '2026-08-02',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'Aug 2026',
    notes: 'Paid via GPay online portal'
  },
  {
    id: 'exp-2',
    title: 'Water Tanker Refill (3 loads x 6000L)',
    category: 'Water Tanker',
    amount: 2400,
    date: '2026-08-04',
    paidTo: 'Sri Balaji Water Suppliers',
    paymentMode: 'Cash',
    monthYear: 'Aug 2026',
    notes: 'Overhead tank refilled'
  },
  {
    id: 'exp-3',
    title: 'High-Speed Fiber Wi-Fi Mesh',
    category: 'Internet / Wi-Fi',
    amount: 2800,
    date: '2026-08-01',
    paidTo: 'ACT Fibernet / Airtel',
    paymentMode: 'UPI',
    monthYear: 'Aug 2026',
    notes: '300 Mbps unlimited plan across 3 floors'
  },
  {
    id: 'exp-4',
    title: 'Housekeeping & Floor Cleaner Salary',
    category: 'Housekeeping & Cleaning',
    amount: 7000,
    date: '2026-08-05',
    paidTo: 'Lakshmi Amma (Cleaner)',
    paymentMode: 'Cash',
    monthYear: 'Aug 2026',
    notes: 'Monthly cleaning & trash clearing'
  },

  // July 2026
  {
    id: 'exp-jul-1',
    title: 'Electricity Bill (July)',
    category: 'Electricity',
    amount: 13800,
    date: '2026-07-03',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'Jul 2026'
  },
  {
    id: 'exp-jul-2',
    title: 'Water Tanker (2 loads)',
    category: 'Water Tanker',
    amount: 1600,
    date: '2026-07-05',
    paidTo: 'Sri Balaji Water',
    paymentMode: 'Cash',
    monthYear: 'Jul 2026'
  },
  {
    id: 'exp-jul-3',
    title: 'High-Speed Wi-Fi',
    category: 'Internet / Wi-Fi',
    amount: 2800,
    date: '2026-07-01',
    paidTo: 'ACT Fibernet',
    paymentMode: 'UPI',
    monthYear: 'Jul 2026'
  },
  {
    id: 'exp-jul-4',
    title: 'Cleaner Salary',
    category: 'Housekeeping & Cleaning',
    amount: 7000,
    date: '2026-07-05',
    paidTo: 'Lakshmi Amma',
    paymentMode: 'Cash',
    monthYear: 'Jul 2026'
  },

  // June 2026
  {
    id: 'exp-jun-1',
    title: 'Electricity Bill (June)',
    category: 'Electricity',
    amount: 12900,
    date: '2026-06-03',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'Jun 2026'
  },
  {
    id: 'exp-jun-2',
    title: 'Water Supply Tanker',
    category: 'Water Tanker',
    amount: 1600,
    date: '2026-06-06',
    paidTo: 'Sri Balaji Water',
    paymentMode: 'Cash',
    monthYear: 'Jun 2026'
  },
  {
    id: 'exp-jun-3',
    title: 'Wi-Fi Fiber Router',
    category: 'Internet / Wi-Fi',
    amount: 2800,
    date: '2026-06-01',
    paidTo: 'ACT Fibernet',
    paymentMode: 'UPI',
    monthYear: 'Jun 2026'
  },
  {
    id: 'exp-jun-4',
    title: 'Cleaner Salary',
    category: 'Housekeeping & Cleaning',
    amount: 7000,
    date: '2026-06-05',
    paidTo: 'Lakshmi Amma',
    paymentMode: 'Cash',
    monthYear: 'Jun 2026'
  },

  // May 2026
  {
    id: 'exp-may-1',
    title: 'Electricity Bill (May Summer Peak)',
    category: 'Electricity',
    amount: 15200,
    date: '2026-05-02',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'May 2026'
  },
  {
    id: 'exp-may-2',
    title: 'Water Tanker (4 Loads)',
    category: 'Water Tanker',
    amount: 3200,
    date: '2026-05-04',
    paidTo: 'Sri Balaji Water Suppliers',
    paymentMode: 'Cash',
    monthYear: 'May 2026'
  },
  {
    id: 'exp-may-3',
    title: 'Wi-Fi Fiber Connection',
    category: 'Internet / Wi-Fi',
    amount: 2800,
    date: '2026-05-01',
    paidTo: 'ACT Fibernet',
    paymentMode: 'UPI',
    monthYear: 'May 2026'
  },

  // April 2026
  {
    id: 'exp-apr-1',
    title: 'Electricity Bill (April)',
    category: 'Electricity',
    amount: 14100,
    date: '2026-04-03',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'Apr 2026'
  },
  {
    id: 'exp-apr-2',
    title: 'Water Tanker Refill',
    category: 'Water Tanker',
    amount: 2400,
    date: '2026-04-06',
    paidTo: 'Sri Balaji Water',
    paymentMode: 'Cash',
    monthYear: 'Apr 2026'
  },

  // March 2026
  {
    id: 'exp-mar-1',
    title: 'Electricity Bill (March)',
    category: 'Electricity',
    amount: 11800,
    date: '2026-03-03',
    paidTo: 'Electricity Board',
    paymentMode: 'UPI',
    monthYear: 'Mar 2026'
  },
  {
    id: 'exp-mar-2',
    title: 'Wi-Fi Fiber Mesh Plan',
    category: 'Internet / Wi-Fi',
    amount: 2800,
    date: '2026-03-01',
    paidTo: 'ACT Fibernet',
    paymentMode: 'UPI',
    monthYear: 'Mar 2026'
  }
];

export const INITIAL_INCOMES: Income[] = [
  // August 2026
  {
    id: 'inc-1',
    title: 'Monthly Rent - Rahul Sharma (Room 101)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-08-03',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'Aug 2026'
  },
  {
    id: 'inc-2',
    title: 'Monthly Rent (Partial) - Vikram Singh (Room 202)',
    category: 'Monthly Rent',
    amount: 3000,
    date: '2026-08-02',
    receivedFrom: 'Vikram Singh',
    paymentMode: 'UPI',
    monthYear: 'Aug 2026'
  },
  {
    id: 'inc-3',
    title: 'Monthly Rent - Karthik Raja (Room 102)',
    category: 'Monthly Rent',
    amount: 4800,
    date: '2026-08-01',
    receivedFrom: 'Karthik Raja',
    paymentMode: 'UPI',
    monthYear: 'Aug 2026'
  },
  {
    id: 'inc-4',
    title: 'Monthly Rent - Vivek Murthy (Room 301 Single)',
    category: 'Monthly Rent',
    amount: 8500,
    date: '2026-08-01',
    receivedFrom: 'Vivek Murthy',
    paymentMode: 'Bank Transfer',
    monthYear: 'Aug 2026'
  },
  {
    id: 'inc-5',
    title: 'Advance / Security Deposit - Bikash Thapa (Room 101)',
    category: 'Security Deposit',
    amount: 4500,
    date: '2026-08-01',
    receivedFrom: 'Bikash Thapa',
    paymentMode: 'Cash',
    monthYear: 'Aug 2026',
    notes: 'Advance collected on arrival'
  },

  // July 2026
  {
    id: 'inc-bulk-1',
    title: 'Bulk Rent July - The Royal Grand Hotel (Nepal Group)',
    category: 'Bulk Company Rent',
    amount: 13500,
    date: '2026-07-31',
    receivedFrom: 'The Royal Grand Hotel & Banquets',
    paymentMode: 'Bank Transfer',
    monthYear: 'Jul 2026',
    isBulkIncome: true,
    groupName: 'Nepal Hotel Hospitality Group'
  },
  {
    id: 'inc-jul-1',
    title: 'Monthly Rent - Rahul Sharma (July)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-07-04',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'Jul 2026'
  },
  {
    id: 'inc-jul-2',
    title: 'Monthly Rent - Vikram Singh (July)',
    category: 'Monthly Rent',
    amount: 4800,
    date: '2026-07-05',
    receivedFrom: 'Vikram Singh',
    paymentMode: 'UPI',
    monthYear: 'Jul 2026'
  },
  {
    id: 'inc-jul-3',
    title: 'Monthly Rent - Vivek Murthy (July)',
    category: 'Monthly Rent',
    amount: 8500,
    date: '2026-07-02',
    receivedFrom: 'Vivek Murthy',
    paymentMode: 'Bank Transfer',
    monthYear: 'Jul 2026'
  },

  // June 2026
  {
    id: 'inc-jun-1',
    title: 'Monthly Rent - Rahul Sharma (June)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-06-03',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'Jun 2026'
  },
  {
    id: 'inc-jun-2',
    title: 'Monthly Rent - Vivek Murthy (June)',
    category: 'Monthly Rent',
    amount: 8500,
    date: '2026-06-01',
    receivedFrom: 'Vivek Murthy',
    paymentMode: 'Bank Transfer',
    monthYear: 'Jun 2026'
  },
  {
    id: 'inc-jun-3',
    title: 'Security Deposit - New Joining (Room 201)',
    category: 'Security Deposit',
    amount: 5000,
    date: '2026-06-02',
    receivedFrom: 'Aditya Rao',
    paymentMode: 'UPI',
    monthYear: 'Jun 2026'
  },

  // May 2026
  {
    id: 'inc-may-1',
    title: 'Monthly Rent - Rahul Sharma (May)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-05-04',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'May 2026'
  },
  {
    id: 'inc-may-2',
    title: 'Monthly Rent - Vikram Singh (May)',
    category: 'Monthly Rent',
    amount: 4800,
    date: '2026-05-05',
    receivedFrom: 'Vikram Singh',
    paymentMode: 'UPI',
    monthYear: 'May 2026'
  },

  // April 2026
  {
    id: 'inc-apr-1',
    title: 'Monthly Rent - Rahul Sharma (April)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-04-03',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'Apr 2026'
  },

  // March 2026
  {
    id: 'inc-mar-1',
    title: 'Monthly Rent - Rahul Sharma (March)',
    category: 'Monthly Rent',
    amount: 4500,
    date: '2026-03-04',
    receivedFrom: 'Rahul Sharma',
    paymentMode: 'UPI',
    monthYear: 'Mar 2026'
  }
];

export const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicket[] = [
  {
    id: 'm-1',
    roomNumber: 104,
    title: 'Bathroom Tap Leakage & Whitewash',
    description: 'Master pipe connector leaking in corner washroom. Needs plumber replacement.',
    reportedBy: 'Caretaker Somu',
    reportedDate: '2026-08-08',
    priority: 'high',
    status: 'in-progress',
    cost: 450
  },
  {
    id: 'm-2',
    roomNumber: 202,
    title: 'Ceiling Fan Regulator Stiff',
    description: 'Regulator knob stuck on speed 5. Replace switch board capacitor.',
    reportedBy: 'Vikram Singh',
    reportedDate: '2026-08-09',
    priority: 'medium',
    status: 'pending',
    cost: 150
  },
  {
    id: 'm-3',
    roomNumber: 302,
    title: 'Geyser Heating Element Checked',
    description: 'Hot water heating takes 15 mins. Serviced and coil descaled.',
    reportedBy: 'Sanjay',
    reportedDate: '2026-08-03',
    priority: 'medium',
    status: 'resolved',
    cost: 600
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'n-1',
    title: 'Water Tanker Cleaning on Thursday (2 PM - 4 PM)',
    content: 'Overhead water tank cleaning and chlorine treatment is scheduled. Please store required drinking & utility water.',
    date: '2026-08-10',
    author: 'PG Manager',
    priority: 'important'
  },
  {
    id: 'n-2',
    title: 'Hostel Gate Closing Time: Strictly 10:30 PM',
    content: 'For resident safety, the main gate locks at 10:30 PM. Residents on night shifts must inform caretaker in advance.',
    date: '2026-08-01',
    author: 'Management',
    priority: 'info'
  }
];

export const INITIAL_STAFF_CONTACTS: StaffContact[] = [
  {
    id: 's-1',
    name: 'Lakshmi Amma',
    role: 'Cleaner / Housekeeping',
    phone: '+91 98450 12340',
    notes: 'Daily morning floor & bathroom cleaning (9:00 AM - 1:00 PM)',
    isAvailable: true
  },
  {
    id: 's-2',
    name: 'Somu',
    role: 'Caretaker / Security',
    phone: '+91 97410 54321',
    notes: 'Night security, gate locking & parcel management',
    isAvailable: true
  },
  {
    id: 's-3',
    name: 'Manjunath',
    role: 'Plumber',
    phone: '+91 98441 99880',
    notes: 'Expert on geysers, pipe leakages & tank valves',
    isAvailable: true
  },
  {
    id: 's-4',
    name: 'Suresh Kumar',
    role: 'Electrician',
    phone: '+91 99001 22334',
    notes: 'Switchboards, AC power plugs & MCB trips',
    isAvailable: true
  },
  {
    id: 's-5',
    name: 'Sri Balaji Water Tanker',
    role: 'Water Tanker Supplier',
    phone: '+91 98455 66778',
    notes: '6000L Tanker @ ₹800 per load',
    isAvailable: true
  },
  {
    id: 's-6',
    name: 'ACT Fibernet Technician (Kiran)',
    role: 'Internet / Wi-Fi Technician',
    phone: '+91 97333 44556',
    notes: 'Mesh router issues & fiber link restoration',
    isAvailable: true
  }
];

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
    id: 'tmpl-2',
    title: 'Company / Hotel Monthly Accommodation Invoice',
    topic: 'Company Invoice',
    category: 'group',
    isDefault: true,
    template: `*AGAM MEN'S PG & STAY - CORPORATE ACCOMMODATION INVOICE*\n\nTo: *{company} Management*\nAttention: *{contact_person}*\nGroup: *{group_name}* ({count} Residents)\nBilling Period: *{month_year}*\n\n🏨 *Accommodation Summary:*\n• Number of staying staff: *{count}*\n• Monthly rate per bed: *₹{rate_per_person}*\n• Total Amount Payable: *₹{total_rent}*\n\n🏦 *Payment Details:*\n• UPI VPA: *{upi_id}*\n• Mobile: *{owner_phone}*\n\nKindly process the month-end billing transfer. Detailed resident attendance sheet available upon request.\n\nWarm regards,\n*Agam Men's PG & Stay Management*`
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
  { month: 'Mar', revenue: 88000, expense: 38000, profit: 50000 },
  { month: 'Apr', revenue: 94000, expense: 39500, profit: 54500 },
  { month: 'May', revenue: 99000, expense: 42000, profit: 57000 },
  { month: 'Jun', revenue: 104000, expense: 41200, profit: 62800 },
  { month: 'Jul', revenue: 110000, expense: 43500, profit: 66500 },
  { month: 'Aug', revenue: 118000, expense: 42300, profit: 75700 }
];
