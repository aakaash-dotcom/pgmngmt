import { db } from './index.ts';
import { 
  users, 
  rooms, 
  tenants, 
  rentPayments, 
  expenses, 
  incomes, 
  staffContacts, 
  maintenanceTickets 
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, displayName?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName: displayName || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('getOrCreateUser error:', error);
    throw new Error('Database operation failed: getOrCreateUser', { cause: error });
  }
}

export async function getUserPgData(userId: string) {
  try {
    const [
      userRooms,
      userTenants,
      userPayments,
      userExpenses,
      userIncomes,
      userStaff,
      userTickets
    ] = await Promise.all([
      db.select().from(rooms).where(eq(rooms.userId, userId)),
      db.select().from(tenants).where(eq(tenants.userId, userId)),
      db.select().from(rentPayments).where(eq(rentPayments.userId, userId)),
      db.select().from(expenses).where(eq(expenses.userId, userId)),
      db.select().from(incomes).where(eq(incomes.userId, userId)),
      db.select().from(staffContacts).where(eq(staffContacts.userId, userId)),
      db.select().from(maintenanceTickets).where(eq(maintenanceTickets.userId, userId)),
    ]);

    return {
      rooms: userRooms.map(r => ({
        id: r.id,
        roomNumber: r.roomNumber,
        floor: r.floor,
        sharingType: r.sharingType as any,
        rentPerBed: r.rentPerBed,
        totalBeds: r.totalBeds,
        amenities: r.amenities ? JSON.parse(r.amenities) : [],
        ac: r.ac ?? false,
        attachedBathroom: r.attachedBathroom ?? true,
        geyser: r.geyser ?? true,
        ventilation: r.ventilation ?? true,
        balcony: r.balcony ?? false,
        notes: r.notes || '',
      })),
      tenants: userTenants.map(t => ({
        id: t.id,
        name: t.name,
        phone: t.phone,
        email: t.email || '',
        roomNumber: t.roomNumber,
        bedNumber: t.bedNumber,
        checkInDate: t.checkInDate,
        rentAmount: t.rentAmount,
        depositAmount: t.depositAmount,
        idProofType: t.idProofType as any,
        idProofNumber: t.idProofNumber,
        fatherName: t.fatherName || '',
        emergencyContact: t.emergencyContact || '',
        collegeOrCompany: t.collegeOrCompany || '',
        nativePlace: t.nativePlace || '',
        status: t.status as any,
        foodPreference: t.foodPreference as any,
        bikeNumber: t.bikeNumber || '',
      })),
      rentPayments: userPayments.map(p => ({
        id: p.id,
        tenantId: p.tenantId,
        tenantName: p.tenantName,
        roomNumber: p.roomNumber,
        monthYear: p.monthYear,
        amount: p.amount,
        paymentDate: p.paymentDate,
        paymentMode: p.paymentMode as any,
        transactionRef: p.transactionRef || '',
        status: p.status as any,
        notes: p.notes || '',
      })),
      expenses: userExpenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        category: e.category as any,
        date: e.date,
        paidTo: e.paidTo || '',
        paymentMode: e.paymentMode as any,
        receiptUrl: e.receiptUrl || '',
        notes: e.notes || '',
      })),
      incomes: userIncomes.map(i => ({
        id: i.id,
        title: i.title,
        amount: i.amount,
        category: i.category as any,
        date: i.date,
        receivedFrom: i.receivedFrom || '',
        paymentMode: i.paymentMode as any,
        receiptUrl: i.receiptUrl || '',
        notes: i.notes || '',
      })),
      staffContacts: userStaff.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role as any,
        phone: s.phone,
        dutyTimings: s.dutyTimings || '',
        notes: s.notes || '',
      })),
      maintenanceTickets: userTickets.map(m => ({
        id: m.id,
        roomNumber: m.roomNumber,
        category: m.category as any,
        description: m.description,
        reportedDate: m.reportedDate,
        resolvedDate: m.resolvedDate || undefined,
        status: m.status as any,
        assignedTo: m.assignedTo || '',
        cost: m.cost || 0,
        notes: m.notes || '',
      }))
    };
  } catch (error) {
    console.error('getUserPgData error:', error);
    throw new Error('Database query failed: getUserPgData', { cause: error });
  }
}

export async function saveUserPgData(userId: string, data: {
  rooms?: any[];
  tenants?: any[];
  rentPayments?: any[];
  expenses?: any[];
  incomes?: any[];
  staffContacts?: any[];
  maintenanceTickets?: any[];
}) {
  try {
    // Delete existing records for this user and insert new ones (snapshot sync)
    if (data.rooms) {
      await db.delete(rooms).where(eq(rooms.userId, userId));
      if (data.rooms.length > 0) {
        await db.insert(rooms).values(
          data.rooms.map(r => ({
            id: r.id,
            userId,
            roomNumber: r.roomNumber,
            floor: r.floor,
            sharingType: r.sharingType,
            rentPerBed: r.rentPerBed,
            totalBeds: r.totalBeds,
            amenities: JSON.stringify(r.amenities || []),
            ac: r.ac ?? false,
            attachedBathroom: r.attachedBathroom ?? true,
            geyser: r.geyser ?? true,
            ventilation: r.ventilation ?? true,
            balcony: r.balcony ?? false,
            notes: r.notes || '',
          }))
        );
      }
    }

    if (data.tenants) {
      await db.delete(tenants).where(eq(tenants.userId, userId));
      if (data.tenants.length > 0) {
        await db.insert(tenants).values(
          data.tenants.map(t => ({
            id: t.id,
            userId,
            name: t.name,
            phone: t.phone,
            email: t.email || null,
            roomNumber: t.roomNumber,
            bedNumber: t.bedNumber,
            checkInDate: t.checkInDate,
            rentAmount: t.rentAmount,
            depositAmount: t.depositAmount,
            idProofType: t.idProofType,
            idProofNumber: t.idProofNumber,
            fatherName: t.fatherName || null,
            emergencyContact: t.emergencyContact || null,
            collegeOrCompany: t.collegeOrCompany || null,
            nativePlace: t.nativePlace || null,
            status: t.status || 'active',
            foodPreference: t.foodPreference || null,
            bikeNumber: t.bikeNumber || null,
          }))
        );
      }
    }

    if (data.rentPayments) {
      await db.delete(rentPayments).where(eq(rentPayments.userId, userId));
      if (data.rentPayments.length > 0) {
        await db.insert(rentPayments).values(
          data.rentPayments.map(p => ({
            id: p.id,
            userId,
            tenantId: p.tenantId,
            tenantName: p.tenantName,
            roomNumber: p.roomNumber,
            monthYear: p.monthYear,
            amount: p.amount,
            paymentDate: p.paymentDate,
            paymentMode: p.paymentMode,
            transactionRef: p.transactionRef || null,
            status: p.status || 'paid',
            notes: p.notes || null,
          }))
        );
      }
    }

    if (data.expenses) {
      await db.delete(expenses).where(eq(expenses.userId, userId));
      if (data.expenses.length > 0) {
        await db.insert(expenses).values(
          data.expenses.map(e => ({
            id: e.id,
            userId,
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: e.date,
            paidTo: e.paidTo || null,
            paymentMode: e.paymentMode,
            receiptUrl: e.receiptUrl || null,
            notes: e.notes || null,
          }))
        );
      }
    }

    if (data.incomes) {
      await db.delete(incomes).where(eq(incomes.userId, userId));
      if (data.incomes.length > 0) {
        await db.insert(incomes).values(
          data.incomes.map(i => ({
            id: i.id,
            userId,
            title: i.title,
            amount: i.amount,
            category: i.category,
            date: i.date,
            receivedFrom: i.receivedFrom || null,
            paymentMode: i.paymentMode,
            receiptUrl: i.receiptUrl || null,
            notes: i.notes || null,
          }))
        );
      }
    }

    if (data.staffContacts) {
      await db.delete(staffContacts).where(eq(staffContacts.userId, userId));
      if (data.staffContacts.length > 0) {
        await db.insert(staffContacts).values(
          data.staffContacts.map(s => ({
            id: s.id,
            userId,
            name: s.name,
            role: s.role,
            phone: s.phone,
            dutyTimings: s.dutyTimings || null,
            notes: s.notes || null,
          }))
        );
      }
    }

    if (data.maintenanceTickets) {
      await db.delete(maintenanceTickets).where(eq(maintenanceTickets.userId, userId));
      if (data.maintenanceTickets.length > 0) {
        await db.insert(maintenanceTickets).values(
          data.maintenanceTickets.map(m => ({
            id: m.id,
            userId,
            roomNumber: m.roomNumber,
            category: m.category,
            description: m.description,
            reportedDate: m.reportedDate,
            resolvedDate: m.resolvedDate || null,
            status: m.status || 'open',
            assignedTo: m.assignedTo || null,
            cost: m.cost || 0,
            notes: m.notes || null,
          }))
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error('saveUserPgData error:', error);
    throw new Error('Database save failed: saveUserPgData', { cause: error });
  }
}
