import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  roomNumber: text('room_number').notNull(),
  floor: integer('floor').notNull(),
  sharingType: text('sharing_type').notNull(),
  rentPerBed: integer('rent_per_bed').notNull(),
  totalBeds: integer('total_beds').notNull(),
  amenities: text('amenities'),
  ac: boolean('ac').default(false),
  attachedBathroom: boolean('attached_bathroom').default(true),
  geyser: boolean('geyser').default(true),
  ventilation: boolean('ventilation').default(true),
  balcony: boolean('balcony').default(false),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  roomNumber: text('room_number').notNull(),
  bedNumber: integer('bed_number').notNull(),
  checkInDate: text('check_in_date').notNull(),
  rentAmount: integer('rent_amount').notNull(),
  depositAmount: integer('deposit_amount').notNull(),
  idProofType: text('id_proof_type').notNull(),
  idProofNumber: text('id_proof_number').notNull(),
  fatherName: text('father_name'),
  emergencyContact: text('emergency_contact'),
  collegeOrCompany: text('college_or_company'),
  nativePlace: text('native_place'),
  status: text('status').notNull().default('active'),
  foodPreference: text('food_preference'),
  bikeNumber: text('bike_number'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const rentPayments = pgTable('rent_payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tenantId: text('tenant_id').notNull(),
  tenantName: text('tenant_name').notNull(),
  roomNumber: text('room_number').notNull(),
  monthYear: text('month_year').notNull(),
  amount: integer('amount').notNull(),
  paymentDate: text('payment_date').notNull(),
  paymentMode: text('payment_mode').notNull(),
  transactionRef: text('transaction_ref'),
  status: text('status').notNull().default('paid'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  paidTo: text('paid_to'),
  paymentMode: text('payment_mode').notNull(),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incomes = pgTable('incomes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  amount: integer('amount').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  receivedFrom: text('received_from'),
  paymentMode: text('payment_mode').notNull(),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const staffContacts = pgTable('staff_contacts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  phone: text('phone').notNull(),
  dutyTimings: text('duty_timings'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const maintenanceTickets = pgTable('maintenance_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  roomNumber: text('room_number').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  reportedDate: text('reported_date').notNull(),
  resolvedDate: text('resolved_date'),
  status: text('status').notNull().default('open'),
  assignedTo: text('assigned_to'),
  cost: integer('cost').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});
