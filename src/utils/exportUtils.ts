import { Tenant, Room, RentPayment, Expense, Income, StaffContact } from '../types';

// Convert array of objects to CSV string
export const convertToCSV = (headers: string[], rows: (string | number)[][]): string => {
  const headerLine = headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const rowLines = rows.map((row) =>
    row
      .map((cell) => {
        const val = cell !== undefined && cell !== null ? String(cell) : '';
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headerLine, ...rowLines].join('\n');
};

// Convert array of objects to TSV string for direct Google Sheets / Excel clipboard pasting
export const convertToTSV = (headers: string[], rows: (string | number)[][]): string => {
  const headerLine = headers.join('\t');
  const rowLines = rows.map((row) =>
    row.map((cell) => (cell !== undefined && cell !== null ? String(cell).replace(/[\t\n]/g, ' ') : '')).join('\t')
  );
  return [headerLine, ...rowLines].join('\n');
};

// Trigger browser file download
export const downloadFile = (content: string, fileName: string, mimeType: string = 'text/csv;charset=utf-8;') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
};

// Exporters for each dataset
export const exportTenantsData = (tenants: Tenant[]) => {
  const headers = [
    'Tenant Name',
    'Phone Number',
    'Room Number',
    'Bed #',
    'Monthly Rent (INR)',
    'Security Deposit (INR)',
    'Payment Status',
    'Balance Due (INR)',
    'Rent Due Date',
    'Check-in Date',
    'Status (Active/Vacated)',
    'Emergency Contact Person',
    'Emergency Phone',
    'ID Proof Type',
    'ID Proof Number',
    'Remarks / Notes',
  ];

  const rows = tenants.map((t) => [
    t.name,
    t.phone,
    t.roomNumber,
    t.bedNumber || '',
    t.rentAmount,
    t.securityDeposit,
    t.status,
    t.balance || 0,
    t.dueDate,
    t.checkInDate,
    t.isActive ? 'Active' : 'Vacated',
    t.emergencyContact,
    t.emergencyPhone,
    t.idProofType,
    t.idProofNumber,
    t.notes || '',
  ]);

  return {
    csv: convertToCSV(headers, rows),
    tsv: convertToTSV(headers, rows),
  };
};

export const exportFinancialLedger = (
  incomes: Income[],
  expenses: Expense[],
  rentPayments: RentPayment[]
) => {
  const headers = ['Entry Type', 'Category', 'Description / Title', 'Amount (INR)', 'Date', 'Party / Person', 'Payment Mode'];

  const rows: (string | number)[][] = [];

  // Incomes
  rentPayments.forEach((p) => {
    if (p.status === 'Paid') {
      rows.push(['Income', 'Monthly Rent', `Room ${p.roomNumber} - ${p.tenantName}`, p.amount, p.paidDate || p.dueDate, p.tenantName, p.paymentMode || 'UPI']);
    }
  });

  incomes.forEach((i) => {
    if (i.category !== 'Monthly Rent') {
      rows.push(['Income', i.category, i.title, i.amount, i.date, i.receivedFrom, i.paymentMode]);
    }
  });

  // Expenses
  expenses.forEach((e) => {
    rows.push(['Expense', e.category, e.title, e.amount, e.date, e.paidTo, e.paymentMode]);
  });

  return {
    csv: convertToCSV(headers, rows),
    tsv: convertToTSV(headers, rows),
  };
};

export const exportExpensesData = (expenses: Expense[]) => {
  const headers = ['Expense Title', 'Category', 'Amount (INR)', 'Date', 'Paid To / Vendor', 'Payment Mode', 'Notes'];
  const rows = expenses.map((e) => [
    e.title,
    e.category,
    e.amount,
    e.date,
    e.paidTo,
    e.paymentMode,
    e.notes || '',
  ]);

  return {
    csv: convertToCSV(headers, rows),
    tsv: convertToTSV(headers, rows),
  };
};

export const exportStaffPhonebook = (staffList: StaffContact[]) => {
  const headers = ['Staff / Vendor Name', 'Service Role', 'Primary Phone', 'Alternate Phone', 'Notes / Timings', 'Status'];
  const rows = staffList.map((s) => [
    s.name,
    s.role,
    s.phone,
    s.alternatePhone || '',
    s.notes || '',
    s.isAvailable ? 'Available' : 'Busy / Off',
  ]);

  return {
    csv: convertToCSV(headers, rows),
    tsv: convertToTSV(headers, rows),
  };
};
