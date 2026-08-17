// Google Workspace API Client for Agam PG Management

export interface GoogleUser {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  uid: string;
}

// ---------------- Google Sheets API ----------------
export interface SheetTabDefinition {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export async function createPgGoogleSpreadsheet(
  accessToken: string,
  title: string,
  tabs: SheetTabDefinition[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  // 1. Create spreadsheet with specified sheets
  const createPayload = {
    properties: {
      title,
    },
    sheets: tabs.map(tab => ({
      properties: {
        title: tab.title,
        gridProperties: {
          rowCount: Math.max(tab.rows.length + 10, 50),
          columnCount: Math.max(tab.headers.length + 2, 10),
          frozenRowCount: 1,
        },
      },
    })),
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Google Sheets creation failed: ${errText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Populate data for each tab using batchUpdate values
  const dataPayload = tabs.map(tab => ({
    range: `'${tab.title}'!A1`,
    values: [tab.headers, ...tab.rows],
  }));

  const valueRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: dataPayload,
      }),
    }
  );

  if (!valueRes.ok) {
    console.warn('Could not populate initial data into sheet:', await valueRes.text());
  }

  return { spreadsheetId, spreadsheetUrl };
}

// ---------------- Image Compression Utility ----------------
export async function compressImageBlob(
  imageSource: Blob | File | string,
  maxWidth: number = 1600,
  maxHeight: number = 1600,
  quality: number = 0.75
): Promise<{ compressedBlob: Blob; dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Image compression failed'));
            return;
          }
          resolve({
            compressedBlob: blob,
            dataUrl,
            sizeKb: Math.round(blob.size / 1024),
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

// ---------------- Group Specific Google Sheet Export ----------------
export async function createGroupSpecificGoogleSpreadsheet(
  accessToken: string,
  groupName: string,
  groupInfo: {
    companyName: string;
    contactPerson: string;
    contactPhone: string;
    rentPerPerson: number;
    advancePerPerson: number;
    billingModel: string;
    notes?: string;
  },
  members: Array<{
    id: string;
    name: string;
    phone: string;
    roomNumber: number;
    bedNumber?: string;
    rentAmount: number;
    securityDeposit: number;
    status: string;
    balance: number;
    idProofType: string;
    idProofNumber: string;
    checkInDate: string;
    documentsCollected?: boolean;
    documentPhotoUrl?: string;
    termsDocumentUrl?: string;
  }>,
  payments: Array<{
    id: string;
    tenantName: string;
    roomNumber: number;
    amount: number;
    month: string;
    paidDate?: string;
    paymentMode: string;
    status: string;
  }>
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const totalRent = members.reduce((sum, m) => sum + (m.rentAmount || 0), 0);
  const totalAdvance = members.reduce((sum, m) => sum + (m.securityDeposit || 0), 0);
  const totalBalance = members.reduce((sum, m) => sum + (m.balance || 0), 0);
  const timeTag = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const tabs: SheetTabDefinition[] = [
    {
      title: 'Group Summary',
      headers: ['Field', 'Details'],
      rows: [
        ['Group / Batch Name', groupName],
        ['Associated Company', groupInfo.companyName || 'N/A'],
        ['Contact Person', groupInfo.contactPerson || 'N/A'],
        ['Contact Phone', groupInfo.contactPhone || 'N/A'],
        ['Billing Model', groupInfo.billingModel === 'company_end_of_month' ? 'Company End-of-Month Invoice' : 'Individual Monthly Rent'],
        ['Total Allocated Members', members.length],
        ['Agreed Rent / Person (₹)', groupInfo.rentPerPerson || 0],
        ['Total Monthly Billing (₹)', totalRent],
        ['Total Advance Deposit (₹)', totalAdvance],
        ['Current Outstanding Dues (₹)', totalBalance],
        ['Export Date', timeTag],
        ['Contract Notes', groupInfo.notes || ''],
      ],
    },
    {
      title: 'Group Members Roster',
      headers: [
        'Resident ID',
        'Member Name',
        'Phone Number',
        'Room No',
        'Bed No',
        'Monthly Rent (₹)',
        'Advance (₹)',
        'Due Balance (₹)',
        'Payment Status',
        'ID Proof Type',
        'ID Number',
        'Check-in Date',
        'Docs Collected',
        'ID Drive Link',
        'T&C Drive Link',
      ],
      rows: members.map((m) => [
        m.id,
        m.name,
        m.phone,
        m.roomNumber,
        m.bedNumber || '',
        m.rentAmount,
        m.securityDeposit,
        m.balance,
        m.status,
        m.idProofType,
        m.idProofNumber,
        m.checkInDate,
        m.documentsCollected !== false ? 'Yes' : 'No',
        m.documentPhotoUrl || 'Not Attached',
        m.termsDocumentUrl || 'Not Attached',
      ]),
    },
    {
      title: 'Group Payment Ledger',
      headers: ['Payment ID', 'Resident Name', 'Room No', 'Amount (₹)', 'Month', 'Paid Date', 'Payment Mode', 'Status'],
      rows: payments.map((p) => [
        p.id,
        p.tenantName,
        p.roomNumber,
        p.amount,
        p.month,
        p.paidDate || '',
        p.paymentMode,
        p.status,
      ]),
    },
  ];

  const title = `Agam PG • Group Report - ${groupName} (${timeTag})`;
  return createPgGoogleSpreadsheet(accessToken, title, tabs);
}

// ---------------- Google Drive Folder Management ----------------
export async function getOrCreateFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  const safeName = folderName.replace(/'/g, "\\'");
  let query = `mimeType = 'application/vnd.google-apps.folder' and name = '${safeName}' and trashed = false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }
  const q = encodeURIComponent(query);

  const listRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (listRes.ok) {
    const data = await listRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // Create folder
  const body: any = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    body.parents = [parentFolderId];
  }

  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create Google Drive folder "${folderName}": ${err}`);
  }

  const folderData = await createRes.json();
  return folderData.id;
}

export async function getResidentDriveFolderId(
  accessToken: string,
  tenant: {
    name: string;
    roomNumber?: number;
    bedNumber?: string;
    isBulkContract?: boolean;
    groupName?: string;
  }
): Promise<{ folderId: string; folderPath: string }> {
  // 1. Master Root folder: "Agam PG Documents"
  const rootId = await getOrCreateFolder(accessToken, 'Agam PG Documents');

  let parentId = rootId;
  let path = 'Agam PG Documents';

  // 2. Individual vs Group Category
  if (tenant.isBulkContract && tenant.groupName) {
    const groupsId = await getOrCreateFolder(accessToken, 'Group Bookings', parentId);
    const specificGroupId = await getOrCreateFolder(accessToken, tenant.groupName.trim(), groupsId);
    parentId = specificGroupId;
    path += ` > Group Bookings > ${tenant.groupName.trim()}`;
  } else {
    const indId = await getOrCreateFolder(accessToken, 'Individual Residents', parentId);
    parentId = indId;
    path += ` > Individual Residents`;
  }

  // 3. Person's folder: "Name - Room 101 (Bed B1)"
  const roomText = tenant.roomNumber ? `Room ${tenant.roomNumber}` : 'Room Unassigned';
  const bedText = tenant.bedNumber ? `(Bed ${tenant.bedNumber})` : '';
  const personFolderName = `${tenant.name.trim()} - ${roomText} ${bedText}`.trim();

  const personFolderId = await getOrCreateFolder(accessToken, personFolderName, parentId);
  path += ` > ${personFolderName}`;

  return { folderId: personFolderId, folderPath: path };
}

// ---------------- Google Drive Backup Upload ----------------
export async function uploadBackupToGoogleDrive(
  accessToken: string,
  fileName: string,
  fileContent: string,
  mimeType: string = 'application/json'
): Promise<{ fileId: string; webViewLink?: string }> {
  const rootId = await getOrCreateFolder(accessToken, 'Agam PG Documents');
  const backupFolderId = await getOrCreateFolder(accessToken, 'Database Backups', rootId);

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: 'Agam Gents PG Cloud Backup Snapshot',
    parents: [backupFolderId],
  };

  const boundary = '-------314159265358979323846';
  const multipartBlob = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
    JSON.stringify(metadata),
    `\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    fileContent,
    `\r\n--${boundary}--`
  ], { type: `multipart/related; boundary=${boundary}` });

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartBlob,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive upload failed: ${err}`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink,
  };
}

// ---------------- Google Drive Document Image Upload ----------------
export async function uploadImageFileToGoogleDrive(
  accessToken: string,
  fileName: string,
  imageBlob: Blob,
  targetFolderId?: string
): Promise<{ fileId: string; webViewLink?: string }> {
  let parentId = targetFolderId;
  if (!parentId) {
    parentId = await getOrCreateFolder(accessToken, 'Agam PG Documents');
  }

  const metadata = {
    name: fileName,
    mimeType: imageBlob.type || 'image/jpeg',
    parents: [parentId],
  };

  const boundary = '-------314159265358979323846';
  const multipartBlob = new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
    JSON.stringify(metadata),
    `\r\n--${boundary}\r\nContent-Type: ${imageBlob.type || 'image/jpeg'}\r\n\r\n`,
    imageBlob,
    `\r\n--${boundary}--`
  ], { type: `multipart/related; boundary=${boundary}` });

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartBlob,
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Drive document photo upload failed: ${err}`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink,
  };
}

export async function listDriveDocuments(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  webViewLink?: string;
}>> {
  const query = encodeURIComponent("mimeType contains 'image/' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,webViewLink)&orderBy=createdTime desc&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
}

export async function listDriveBackups(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  webViewLink?: string;
}>> {
  const query = encodeURIComponent("name contains 'Agam_PG' or name contains 'AgamPG' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,webViewLink)&orderBy=createdTime desc&pageSize=20`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to list Google Drive files');
  }

  const data = await res.json();
  return data.files || [];
}

export async function downloadDriveFile(accessToken: string, fileId: string): Promise<string> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to download file from Google Drive');
  }

  return await res.text();
}

// ---------------- Google Tasks API ----------------
export interface GoogleTaskItem {
  id?: string;
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp
  status?: 'needsAction' | 'completed';
}

export async function getOrCreateAgamTaskList(
  accessToken: string,
  listTitle: string = 'Agam PG Action Items'
): Promise<string> {
  // Check if exists
  const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Google Task lists');
  }

  const data = await res.json();
  const existing = (data.items || []).find((item: any) => item.title === listTitle);
  if (existing) {
    return existing.id;
  }

  // Create new
  const createRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: listTitle }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create Agam PG Task List');
  }

  const created = await createRes.json();
  return created.id;
}

export async function createGoogleTask(
  accessToken: string,
  taskListId: string,
  task: GoogleTaskItem
): Promise<any> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google Task: ${err}`);
  }

  return await res.json();
}

export async function listGoogleTasks(
  accessToken: string,
  taskListId: string
): Promise<GoogleTaskItem[]> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to list tasks');
  }

  const data = await res.json();
  return (data.items || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    notes: t.notes,
    due: t.due,
    status: t.status,
  }));
}

export async function updateGoogleTaskStatus(
  accessToken: string,
  taskListId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction',
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to update task status');
  }
}

// ---------------- Google Calendar API ----------------
export interface CalendarEventPayload {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
}

export async function createGoogleCalendarEvent(
  accessToken: string,
  event: CalendarEventPayload
): Promise<{ id: string; htmlLink: string }> {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Calendar event creation failed: ${err}`);
  }

  const data = await res.json();
  return {
    id: data.id,
    htmlLink: data.htmlLink,
  };
}

export async function listUpcomingCalendarEvents(
  accessToken: string,
  maxResults: number = 10
): Promise<Array<{
  id: string;
  summary: string;
  description?: string;
  start: string;
  htmlLink: string;
}>> {
  const timeMin = new Date().toISOString();
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch calendar events');
  }

  const data = await res.json();
  return (data.items || []).map((ev: any) => ({
    id: ev.id,
    summary: ev.summary,
    description: ev.description,
    start: ev.start?.dateTime || ev.start?.date || '',
    htmlLink: ev.htmlLink,
  }));
}

// ---------------- Google Contacts (People API) ----------------
export interface ContactPayload {
  givenName: string;
  familyName?: string;
  phoneNumber: string;
  email?: string;
  userDefinedNotes?: string;
}

export async function createGoogleContact(
  accessToken: string,
  contact: ContactPayload
): Promise<any> {
  const body: any = {
    names: [
      {
        givenName: contact.givenName,
        familyName: contact.familyName || '',
      },
    ],
    phoneNumbers: [
      {
        value: contact.phoneNumber,
        type: 'mobile',
      },
    ],
  };

  if (contact.email) {
    body.emailAddresses = [{ value: contact.email, type: 'home' }];
  }

  if (contact.userDefinedNotes) {
    body.userDefined = [
      {
        key: 'PG Note',
        value: contact.userDefinedNotes,
      },
    ];
    body.biographies = [
      {
        value: contact.userDefinedNotes,
        contentType: 'TEXT_PLAIN',
      },
    ];
  }

  const res = await fetch(
    'https://people.googleapis.com/v1/people:createContact',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Google Contact: ${err}`);
  }

  return await res.json();
}

export async function fetchGoogleContacts(
  accessToken: string,
  pageSize: number = 30
): Promise<Array<{
  resourceName: string;
  name: string;
  phone: string;
  email?: string;
}>> {
  const res = await fetch(
    `https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses&pageSize=${pageSize}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to load Google Contacts');
  }

  const data = await res.json();
  return (data.connections || []).map((person: any) => ({
    resourceName: person.resourceName,
    name: person.names?.[0]?.displayName || 'Unknown',
    phone: person.phoneNumbers?.[0]?.value || 'No phone',
    email: person.emailAddresses?.[0]?.value || undefined,
  }));
}

// ---------------- Google Picker API Loader ----------------
export function openGoogleFilePicker(
  accessToken: string,
  onPicked: (doc: any) => void
): void {
  // Load Google Picker script dynamically if not present
  const scriptId = 'google-picker-sdk';
  
  const launchPicker = () => {
    if (!(window as any).google?.picker) {
      alert('Google Picker is loading, please try again in a moment.');
      return;
    }

    const pickerOrigin =
      window.location.ancestorOrigins && window.location.ancestorOrigins.length > 0
        ? window.location.ancestorOrigins[window.location.ancestorOrigins.length - 1]
        : window.location.origin;

    const gPicker = (window as any).google.picker;
    const picker = new gPicker.PickerBuilder()
      .addView(gPicker.ViewId.DOCS)
      .addView(gPicker.ViewId.SPREADSHEETS)
      .setOAuthToken(accessToken)
      .setOrigin(pickerOrigin)
      .setCallback((data: any) => {
        if (data.action === gPicker.Action.PICKED) {
          const doc = data.docs[0];
          onPicked(doc);
        }
      })
      .build();

    picker.setVisible(true);
  };

  if (!(window as any).gapi) {
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      (window as any).gapi.load('picker', { callback: launchPicker });
    };
    document.body.appendChild(gapiScript);
  } else if (!(window as any).google?.picker) {
    (window as any).gapi.load('picker', { callback: launchPicker });
  } else {
    launchPicker();
  }
}
