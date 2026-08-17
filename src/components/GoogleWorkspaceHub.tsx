import React, { useState, useEffect } from 'react';
import { Tenant, Room, RentPayment, Expense, Income, StaffContact, MaintenanceTicket, BulkGroup } from '../types';
import { 
  auth, 
  googleSignIn, 
  logout, 
  getAccessToken, 
  initAuth,
  WorkspaceUser,
} from '../lib/firebase';
import {
  createPgGoogleSpreadsheet,
  createGroupSpecificGoogleSpreadsheet,
  uploadBackupToGoogleDrive,
  listDriveBackups,
  downloadDriveFile,
  listDriveDocuments,
} from '../lib/googleWorkspace';
import { DocumentCameraCapture } from './DocumentCameraCapture';

interface GoogleWorkspaceHubProps {
  tenants?: Tenant[];
  rooms?: Room[];
  rentPayments?: RentPayment[];
  expenses?: Expense[];
  incomes?: Income[];
  staffContacts?: StaffContact[];
  maintenanceTickets?: MaintenanceTicket[];
  bulkGroups?: BulkGroup[];
  onRestoreBackup?: (backupData: any) => void;
  onSyncCloudSql?: () => Promise<void>;
  isSyncingCloudSql?: boolean;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  tenants = [],
  rooms = [],
  rentPayments = [],
  expenses = [],
  incomes = [],
  staffContacts = [],
  maintenanceTickets = [],
  bulkGroups = [],
  onRestoreBackup,
  onSyncCloudSql,
  isSyncingCloudSql = false,
}) => {
  const [currentUser, setCurrentUser] = useState<WorkspaceUser | null>(auth.currentUser);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera-drive' | 'sheets' | 'backup'>('camera-drive');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sheets state
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);
  const [createdGroupSheetUrl, setCreatedGroupSheetUrl] = useState<string | null>(null);
  
  // Distinct group list
  const availableGroups = React.useMemo(() => {
    const names = new Set<string>();
    bulkGroups.forEach((g) => names.add(g.name));
    tenants.forEach((t) => {
      if (t.isBulkContract && t.groupName) names.add(t.groupName);
    });
    if (names.size === 0) {
      names.add('Nepal Hotel Hospitality Group');
      names.add('Apex IT Trainees Batch');
    }
    return Array.from(names);
  }, [bulkGroups, tenants]);

  const [selectedExportGroup, setSelectedExportGroup] = useState<string>(availableGroups[0] || 'Nepal Hotel Hospitality Group');

  // Drive state
  const [driveBackups, setDriveBackups] = useState<Array<{ id: string; name: string; createdTime: string; webViewLink?: string }>>([]);
  const [driveDocuments, setDriveDocuments] = useState<Array<{ id: string; name: string; createdTime: string; webViewLink?: string }>>([]);
  const [isLoadingDriveFiles, setIsLoadingDriveFiles] = useState(false);

  // Camera selection state
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [docCategory, setDocCategory] = useState<'Aadhaar / ID Proof' | 'Passport' | 'Signed Rental Agreement' | 'Rent Receipt'>('Aadhaar / ID Proof');
  const [showCameraModal, setShowCameraModal] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setCurrentUser(user);
      if (token) {
        setAccessToken(token);
        loadDriveFiles(token);
      }
    }, () => {
      setCurrentUser(null);
      setAccessToken(null);
    });

    return () => unsubscribe();
  }, []);

  const loadDriveFiles = async (token: string) => {
    try {
      setIsLoadingDriveFiles(true);
      const [backups, docs] = await Promise.all([
        listDriveBackups(token).catch(() => []),
        listDriveDocuments(token).catch(() => []),
      ]);
      setDriveBackups(backups);
      setDriveDocuments(docs);
    } catch (e) {
      console.warn('Failed to load drive files:', e);
    } finally {
      setIsLoadingDriveFiles(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        showToast(`Connected as ${res.user.displayName || res.user.email}!`, 'success');
        loadDriveFiles(res.accessToken);
        
        if (onSyncCloudSql) {
          await onSyncCloudSql();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Sign in failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setAccessToken(null);
      setDriveBackups([]);
      setDriveDocuments([]);
      showToast('Signed out from Google Workspace', 'info');
    } catch (err: any) {
      showToast(`Sign out failed: ${err.message}`, 'error');
    }
  };

  const getValidToken = async (): Promise<string> => {
    let token = accessToken;
    if (!token) {
      token = await getAccessToken();
    }
    if (!token) {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        return res.accessToken;
      }
      throw new Error('Google Sign-In required to access Workspace services.');
    }
    return token;
  };

  // Google Sheets Export
  const handleExportSheets = async () => {
    try {
      setIsLoading(true);
      const token = await getValidToken();

      const tabs = [
        {
          title: 'Residents',
          headers: ['ID', 'Name', 'Phone', 'Room', 'Bed', 'Monthly Rent (₹)', 'Advance (₹)', 'Due Date', 'Status', 'Balance (₹)', 'ID Proof Type', 'ID Number', 'Documents Collected'],
          rows: tenants.map((t) => [
            t.id,
            t.name,
            t.phone,
            t.roomNumber,
            t.bedNumber || '',
            t.rentAmount,
            t.securityDeposit,
            t.dueDate,
            t.status,
            t.balance,
            t.idProofType,
            t.idProofNumber,
            t.documentsCollected !== false ? 'Yes' : 'No',
          ]),
        },
        {
          title: 'Rooms',
          headers: ['Room Number', 'Type', 'Floor', 'Capacity', 'Occupied', 'Rent / Bed (₹)', 'Status'],
          rows: rooms.map((r) => [
            r.number,
            r.type,
            r.floor,
            r.capacity,
            r.occupied,
            r.perBedRent,
            r.status,
          ]),
        },
        {
          title: 'Rent Payments',
          headers: ['Payment ID', 'Resident', 'Room', 'Amount (₹)', 'Month', 'Paid Date', 'Mode', 'Status'],
          rows: rentPayments.map((p) => [
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
        {
          title: 'Operating Expenses',
          headers: ['ID', 'Title', 'Category', 'Amount (₹)', 'Date', 'Paid To', 'Mode', 'Month'],
          rows: expenses.map((e) => [
            e.id,
            e.title,
            e.category,
            e.amount,
            e.date,
            e.paidTo,
            e.paymentMode,
            e.monthYear,
          ]),
        },
        {
          title: 'Other Incomes',
          headers: ['ID', 'Title', 'Category', 'Amount (₹)', 'Date', 'Received From', 'Mode'],
          rows: incomes.map((i) => [
            i.id,
            i.title,
            i.category,
            i.amount,
            i.date,
            i.receivedFrom,
            i.paymentMode,
          ]),
        },
      ];

      const timeTag = new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric', day: '2-digit' });
      const spreadsheetTitle = `Agam PG Management • Live Master Ledger (${timeTag})`;

      const result = await createPgGoogleSpreadsheet(token, spreadsheetTitle, tabs);
      setCreatedSheetUrl(result.spreadsheetUrl);
      showToast('Google Spreadsheet generated with all PG records!', 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Sheets export failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export Specific Bulk / Corporate Group to Google Sheets
  const handleExportGroupSheet = async () => {
    try {
      setIsLoading(true);
      const token = await getValidToken();

      const groupMembers = tenants.filter(
        (t) => t.isBulkContract && t.groupName === selectedExportGroup
      );

      const foundGroupObj = bulkGroups.find((g) => g.name === selectedExportGroup);
      const groupInfo = {
        companyName: foundGroupObj?.companyName || groupMembers[0]?.companyName || 'Associated Hotel / Company',
        contactPerson: foundGroupObj?.contactPerson || 'Supervisor / HR',
        contactPhone: foundGroupObj?.contactPhone || groupMembers[0]?.companyContactPhone || '',
        rentPerPerson: foundGroupObj?.rentPerPerson || groupMembers[0]?.rentAmount || 4500,
        advancePerPerson: foundGroupObj?.advancePerPerson || groupMembers[0]?.securityDeposit || 4500,
        billingModel: foundGroupObj?.billingModel || groupMembers[0]?.billingModel || 'company_end_of_month',
        notes: foundGroupObj?.notes || '',
      };

      const groupMemberNames = new Set(groupMembers.map((m) => m.name.toLowerCase()));
      const groupPayments = rentPayments.filter(
        (p) => groupMemberNames.has(p.tenantName.toLowerCase())
      );

      const result = await createGroupSpecificGoogleSpreadsheet(
        token,
        selectedExportGroup,
        groupInfo,
        groupMembers,
        groupPayments
      );

      setCreatedGroupSheetUrl(result.spreadsheetUrl);
      showToast(`Google Sheet for "${selectedExportGroup}" generated!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Group export failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Drive Cloud Backup
  const handleBackupToDrive = async () => {
    try {
      setIsLoading(true);
      const token = await getValidToken();

      const backupPayload = {
        app: 'Agam Gents PG',
        timestamp: new Date().toISOString(),
        version: '2.0',
        data: {
          tenants,
          rooms,
          rentPayments,
          expenses,
          incomes,
          staffContacts,
          maintenanceTickets,
        },
      };

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 5).replace(':', '-');
      const fileName = `Agam_PG_Full_Cloud_Backup_${dateStr}_${timeStr}.json`;

      const uploadResult = await uploadBackupToGoogleDrive(
        token,
        fileName,
        JSON.stringify(backupPayload, null, 2)
      );

      showToast('Full PG backup snapshot saved to Google Drive!', 'success');
      loadDriveFiles(token);
    } catch (err: any) {
      console.error(err);
      showToast(`Drive backup failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreFile = async (fileId: string) => {
    if (!confirm('Restore full PG database from this Google Drive backup snapshot? Current records will be replaced.')) {
      return;
    }
    try {
      setIsLoading(true);
      const token = await getValidToken();
      const fileJson = await downloadDriveFile(token, fileId);
      const parsed = JSON.parse(fileJson);

      if (parsed && parsed.data && onRestoreBackup) {
        onRestoreBackup(parsed.data);
        showToast('PG Database successfully restored from Google Drive!', 'success');
      } else {
        showToast('Invalid backup file format.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(`Restore failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTenantObj = tenants.find((t) => t.id === selectedTenantId) || tenants[0];

  return (
    <div className="flex flex-col gap-4 pb-20 max-w-5xl mx-auto px-3 sm:px-4 pt-1.5">
      {/* Google Account Status Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0a332c] border border-emerald-200 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-black text-slate-900 leading-tight">
                Google Workspace & Cloud Storage
              </h3>
              {currentUser && (
                <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Connected
                </span>
              )}
            </div>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
              {currentUser
                ? `Signed in as ${currentUser.displayName || currentUser.email}`
                : 'Connect Google account to take document photos and save directly to Google Drive'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!currentUser ? (
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[12px] shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              <span>Connect Google Account</span>
            </button>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[12px] transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-[13px] font-bold flex items-center gap-2 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {statusMessage.type === 'success' ? 'check_circle' : 'info'}
          </span>
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[12px] font-bold">
        <button
          onClick={() => setActiveTab('camera-drive')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'camera-drive'
              ? 'bg-white text-[#0a332c] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          <span>Camera & Google Drive Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'sheets'
              ? 'bg-white text-[#0a332c] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">table_chart</span>
          <span>Google Sheets Export</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'backup'
              ? 'bg-white text-[#0a332c] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
          <span>Drive Backup & Restore</span>
        </button>
      </div>

      {/* TAB 1: CAMERA & GOOGLE DRIVE DOCUMENTS */}
      {activeTab === 'camera-drive' && (
        <div className="flex flex-col gap-4">
          {/* Action Card: Open Camera */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h4 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-emerald-700">photo_camera</span>
                  Scan & Store Document to Google Drive
                </h4>
                <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                  Take a photo of resident's Aadhaar, Passport, or Agreement using your camera and upload straight to Google Drive.
                </p>
              </div>

              <button
                onClick={() => setShowCameraModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl text-[13px] shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>Open Document Camera</span>
              </button>
            </div>

            {/* Quick Capture Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Select Resident
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold text-[12px] focus:outline-none"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (Room {t.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Document Type
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold text-[12px] focus:outline-none"
                >
                  <option value="Aadhaar / ID Proof">Aadhaar / ID Proof</option>
                  <option value="Passport">Passport</option>
                  <option value="Signed Rental Agreement">Signed Rental Agreement</option>
                  <option value="Rent Receipt">Rent Receipt</option>
                </select>
              </div>
            </div>

            {/* Camera Component when triggered */}
            {showCameraModal && (
              <div className="mt-2">
                <DocumentCameraCapture
                  tenantName={selectedTenantObj?.name || 'Resident'}
                  roomNumber={selectedTenantObj?.roomNumber}
                  docType={docCategory}
                  onUploaded={(url) => {
                    showToast('Document saved directly to Google Drive!', 'success');
                    if (accessToken) loadDriveFiles(accessToken);
                  }}
                  onClose={() => setShowCameraModal(false)}
                />
              </div>
            )}
          </div>

          {/* Stored Google Drive Documents List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="text-[14px] font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">folder</span>
                Google Drive Stored Documents ({driveDocuments.length})
              </h4>
              {currentUser && (
                <button
                  onClick={() => accessToken && loadDriveFiles(accessToken)}
                  disabled={isLoadingDriveFiles}
                  className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Refresh</span>
                </button>
              )}
            </div>

            {!currentUser ? (
              <p className="text-[12px] text-slate-500 italic py-4 text-center">
                Connect your Google account above to view stored Drive documents.
              </p>
            ) : isLoadingDriveFiles ? (
              <p className="text-[12px] text-slate-500 italic py-4 text-center">
                Checking Google Drive files...
              </p>
            ) : driveDocuments.length === 0 ? (
              <p className="text-[12px] text-slate-500 italic py-4 text-center">
                No document photos found in Google Drive yet. Use the camera above to capture your first document!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {driveDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-[20px] text-blue-600 shrink-0">image</span>
                      <div className="truncate">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(doc.createdTime).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {doc.webViewLink && (
                      <a
                        href={doc.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-[11px] font-bold hover:bg-blue-50 transition-colors shrink-0 flex items-center gap-1"
                      >
                        <span>View</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SHEETS EXPORT */}
      {activeTab === 'sheets' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div>
            <h4 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-emerald-700">table_chart</span>
              1-Click Google Sheets Sync & Export
            </h4>
            <p className="text-[12px] text-slate-500 font-medium mt-0.5">
              Exports all {tenants.length} residents, {rooms.length} rooms, rent payment records, and expenses into a formatted Google Spreadsheet.
            </p>
          </div>

          {/* Master Full PG Ledger Export */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 block">
                Master Full PG Ledger Spreadsheet
              </span>
              <p className="text-[12px] text-emerald-800 font-semibold mt-0.5">
                5 Tabs: Residents • Rooms • Rent Collections • Expenses • Other Incomes
              </p>
            </div>

            <button
              onClick={handleExportSheets}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#0a332c] hover:bg-[#0f4239] disabled:opacity-50 text-white font-extrabold rounded-xl text-[12px] shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">file_open</span>
              <span>{isLoading ? 'Generating Sheet...' : 'Export Master Google Sheet'}</span>
            </button>
          </div>

          {createdSheetUrl && (
            <div className="p-4 bg-white border-2 border-emerald-500 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[24px] text-emerald-600">check_circle</span>
                <div>
                  <h5 className="font-extrabold text-[13px] text-slate-900">Master Spreadsheet Created Successfully!</h5>
                  <p className="text-[11px] text-slate-500">Accessible from your Google Drive anytime</p>
                </div>
              </div>

              <a
                href={createdSheetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-[12px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Open Google Sheet</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
          )}

          {/* Dedicated Group-Only Google Sheet Export */}
          <div className="mt-2 p-4 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">corporate_fare</span>
                  Export Specific Group Alone to Google Sheets
                </span>
                <p className="text-[12px] text-slate-600 font-medium mt-0.5">
                  Generate a dedicated sheet for only one corporate/bulk group with summary & resident roster.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1">
                <select
                  value={selectedExportGroup}
                  onChange={(e) => setSelectedExportGroup(e.target.value)}
                  className="w-full h-[38px] px-3 border border-amber-300 rounded-lg bg-white font-bold text-slate-900 text-[12px] focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  {availableGroups.map((grp) => {
                    const count = tenants.filter(
                      (t) => t.isBulkContract && t.groupName === grp
                    ).length;
                    return (
                      <option key={grp} value={grp}>
                        {grp} ({count} members)
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleExportGroupSheet}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-extrabold rounded-xl text-[12px] shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">table_view</span>
                <span>{isLoading ? 'Exporting...' : `Export "${selectedExportGroup}" Sheet`}</span>
              </button>
            </div>

            {createdGroupSheetUrl && (
              <div className="p-3 bg-white border-2 border-amber-500 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-amber-700">check_circle</span>
                  <div>
                    <h5 className="font-extrabold text-[12px] text-slate-900">
                      Group Spreadsheet Created: {selectedExportGroup}
                    </h5>
                    <p className="text-[10px] text-slate-500">Saved in your Google Drive root</p>
                  </div>
                </div>

                <a
                  href={createdGroupSheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors shrink-0"
                >
                  <span>Open Group Sheet</span>
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DRIVE BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-[16px] font-black text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#0a332c]">cloud_upload</span>
                Google Drive System Snapshots
              </h4>
              <p className="text-[12px] text-slate-500 font-medium mt-0.5">
                Create full encrypted JSON backups of your PG data to Google Drive or restore anytime.
              </p>
            </div>

            <button
              onClick={handleBackupToDrive}
              disabled={isLoading}
              className="w-full sm:w-auto px-4 py-2 bg-[#0a332c] hover:bg-[#0f4239] disabled:opacity-50 text-white font-extrabold rounded-xl text-[12px] shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">backup</span>
              <span>{isLoading ? 'Saving...' : 'Backup Snapshot to Drive'}</span>
            </button>
          </div>

          {/* Backup Files List */}
          <div className="flex flex-col gap-2.5">
            <h5 className="text-[13px] font-extrabold text-slate-800">
              Cloud Backup Files on Google Drive ({driveBackups.length})
            </h5>

            {!currentUser ? (
              <p className="text-[12px] text-slate-500 italic py-4 text-center">
                Connect your Google account above to access Drive backup snapshots.
              </p>
            ) : driveBackups.length === 0 ? (
              <p className="text-[12px] text-slate-500 italic py-4 text-center">
                No backup files saved to Google Drive yet. Click "Backup Snapshot to Drive" to create one.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {driveBackups.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-[20px] text-emerald-700">inventory_2</span>
                      <div className="truncate">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{b.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(b.createdTime).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreFile(b.id)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-white border border-slate-300 hover:border-emerald-600 text-slate-800 hover:text-[#0a332c] rounded-lg text-[11px] font-bold transition-all"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
