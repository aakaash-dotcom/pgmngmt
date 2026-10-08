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
import {
  roomToDbRow,
  roomFromDbRow,
  tenantToDbRow,
  tenantFromDbRow,
  paymentToDbRow,
  paymentFromDbRow,
  expenseToDbRow,
  expenseFromDbRow,
  incomeToDbRow,
  incomeFromDbRow,
  staffToDbRow,
  staffFromDbRow,
  ticketToDbRow,
  ticketFromDbRow,
} from './mappers.ts';
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

    // Return data mapped back into the app's entity shapes.
    return {
      rooms: userRooms.map(roomFromDbRow),
      tenants: userTenants.map(tenantFromDbRow),
      rentPayments: userPayments.map(paymentFromDbRow),
      expenses: userExpenses.map(expenseFromDbRow),
      incomes: userIncomes.map(incomeFromDbRow),
      staffContacts: userStaff.map(staffFromDbRow),
      maintenanceTickets: userTickets.map(ticketFromDbRow),
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
    // Map every entity to its DB row BEFORE touching the database so a
    // mapping error can never leave the user's cloud data half-wiped.
    const roomRows = data.rooms ? data.rooms.map((r: any) => roomToDbRow(r, userId)) : null;
    const tenantRows = data.tenants ? data.tenants.map((t: any) => tenantToDbRow(t, userId)) : null;
    const paymentRows = data.rentPayments ? data.rentPayments.map((p: any) => paymentToDbRow(p, userId)) : null;
    const expenseRows = data.expenses ? data.expenses.map((e: any) => expenseToDbRow(e, userId)) : null;
    const incomeRows = data.incomes ? data.incomes.map((i: any) => incomeToDbRow(i, userId)) : null;
    const staffRows = data.staffContacts ? data.staffContacts.map((s: any) => staffToDbRow(s, userId)) : null;
    const ticketRows = data.maintenanceTickets ? data.maintenanceTickets.map((m: any) => ticketToDbRow(m, userId)) : null;

    // Snapshot sync inside a single transaction: either the whole snapshot
    // replaces the old one, or nothing changes at all.
    await db.transaction(async (tx) => {
      if (roomRows) {
        await tx.delete(rooms).where(eq(rooms.userId, userId));
        if (roomRows.length > 0) {
          await tx.insert(rooms).values(roomRows);
        }
      }

      if (tenantRows) {
        await tx.delete(tenants).where(eq(tenants.userId, userId));
        if (tenantRows.length > 0) {
          await tx.insert(tenants).values(tenantRows);
        }
      }

      if (paymentRows) {
        await tx.delete(rentPayments).where(eq(rentPayments.userId, userId));
        if (paymentRows.length > 0) {
          await tx.insert(rentPayments).values(paymentRows);
        }
      }

      if (expenseRows) {
        await tx.delete(expenses).where(eq(expenses.userId, userId));
        if (expenseRows.length > 0) {
          await tx.insert(expenses).values(expenseRows);
        }
      }

      if (incomeRows) {
        await tx.delete(incomes).where(eq(incomes.userId, userId));
        if (incomeRows.length > 0) {
          await tx.insert(incomes).values(incomeRows);
        }
      }

      if (staffRows) {
        await tx.delete(staffContacts).where(eq(staffContacts.userId, userId));
        if (staffRows.length > 0) {
          await tx.insert(staffContacts).values(staffRows);
        }
      }

      if (ticketRows) {
        await tx.delete(maintenanceTickets).where(eq(maintenanceTickets.userId, userId));
        if (ticketRows.length > 0) {
          await tx.insert(maintenanceTickets).values(ticketRows);
        }
      }
    });

    return { success: true };
  } catch (error) {
    console.error('saveUserPgData error:', error);
    throw new Error('Database save failed: saveUserPgData', { cause: error });
  }
}
