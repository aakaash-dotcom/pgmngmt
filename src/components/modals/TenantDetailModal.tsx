import React, { useState } from 'react';
import { Tenant, WhatsAppTemplate } from '../../types';
import { OWNER_PHONE, OWNER_UPI_ID, PG_NAME } from '../../data/initialData';
import { DocumentCameraCapture } from '../DocumentCameraCapture';

interface TenantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  templates?: WhatsAppTemplate[];
  onCollectRent: (tenant: Tenant) => void;
  onToggleActiveStatus: (tenantId: string) => void;
  onUpdateTenantNotes: (tenantId: string, notes: string) => void;
  onSendWhatsApp?: (phone: string, text: string) => void;
}

export const TenantDetailModal: React.FC<TenantDetailModalProps> = ({
  isOpen,
  onClose,
  tenant,
  templates = [],
  onCollectRent,
  onToggleActiveStatus,
  onUpdateTenantNotes,
  onSendWhatsApp,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(tenant?.notes || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default');
  const [activeScanner, setActiveScanner] = useState<'id' | 'terms' | null>(null);

  if (!isOpen || !tenant) return null;

  const handleSaveNotes = () => {
    onUpdateTenantNotes(tenant.id, notesText);
    setIsEditingNotes(false);
  };

  const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  // Build dynamic personalized WhatsApp message
  const getPersonalizedMessage = () => {
    const dueAmount = tenant.balance > 0 ? tenant.balance : tenant.rentAmount;
    const bedTag = tenant.bedNumber || 'B1';

    if (selectedTemplateId === 'default' || !templates.length) {
      return `*AGAM MEN'S PG & STAY - RENT REMINDER*\n\nDear *${tenant.name}* (Room ${tenant.roomNumber}, ${bedTag}),\n\nThis is a friendly reminder that your monthly accommodation fee of *₹${dueAmount.toLocaleString(
        'en-IN'
      )}* is due on *${tenant.dueDate}*.\n\n💳 *UPI ID:* ${OWNER_UPI_ID}\n📱 *GPay / PhonePe / Paytm:* ${OWNER_PHONE}\n🏨 *PG:* ${PG_NAME}\n\nKindly complete the payment and share the screenshot.\n- Management, ${PG_NAME}`;
    }

    const tmplObj = templates.find((t) => t.id === selectedTemplateId);
    if (!tmplObj) return '';

    return tmplObj.template
      .replace(/{name}/g, tenant.name)
      .replace(/{room}/g, tenant.roomNumber.toString())
      .replace(/{bed}/g, bedTag)
      .replace(/{rent}/g, dueAmount.toLocaleString('en-IN'))
      .replace(/{due_date}/g, tenant.dueDate)
      .replace(/{deposit}/g, tenant.securityDeposit.toLocaleString('en-IN'))
      .replace(/{check_in_date}/g, tenant.checkInDate)
      .replace(/{company}/g, tenant.companyName || 'Company')
      .replace(/{group_name}/g, tenant.groupName || 'Group')
      .replace(/{upi_id}/g, OWNER_UPI_ID)
      .replace(/{owner_phone}/g, OWNER_PHONE)
      .replace(/{pg_name}/g, PG_NAME);
  };

  const handleTriggerWhatsApp = () => {
    const text = getPersonalizedMessage();
    if (onSendWhatsApp) {
      onSendWhatsApp(formattedPhone, text);
    } else {
      const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a332c] text-white p-4 px-5 flex justify-between items-start shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 text-white border border-white/20 flex items-center justify-center font-black text-[20px]">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-black leading-tight text-white">{tenant.name}</h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    tenant.status === 'Paid'
                      ? 'bg-emerald-400 text-slate-950'
                      : tenant.status === 'Overdue'
                      ? 'bg-rose-400 text-slate-950'
                      : 'bg-amber-300 text-slate-950'
                  }`}
                >
                  {tenant.isActive ? tenant.status : 'Checked Out'}
                </span>
              </div>
              <p className="text-[12px] text-emerald-100/80 font-medium mt-0.5">
                Room {tenant.roomNumber} • <span className="font-bold text-amber-300">{tenant.bedNumber || 'B1'}</span> • Checked in {tenant.checkInDate}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Quick Action Contact Bar */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`tel:${tenant.phone}`}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[12px] rounded-xl border border-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-[#0a332c]">call</span>
              <span>Call ({tenant.phone})</span>
            </a>
            <button
              onClick={handleTriggerWhatsApp}
              className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12px] rounded-xl shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              <span>Send WhatsApp</span>
            </button>
          </div>

          {/* Corporate / Bulk Contract Information */}
          {tenant.isBulkContract && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-700">corporate_fare</span>
                  Corporate / Hotel Contract
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  End of Month Billed
                </span>
              </div>

              <div className="flex flex-col gap-1 text-[12px]">
                <p className="text-slate-800 font-semibold">
                  <strong>Batch Group:</strong> {tenant.groupName || 'Bulk Group'}
                </p>
                <p className="text-slate-800 font-semibold">
                  <strong>Company:</strong> {tenant.companyName || 'Hotel / Enterprise'}
                </p>
                {tenant.companyContactPhone && (
                  <p className="text-slate-700">
                    <strong>Supervisor / HR:</strong> {tenant.companyContactPhone}
                  </p>
                )}
                <p className="text-[11px] text-amber-900 bg-amber-100/70 p-2 rounded-lg mt-1">
                  💡 <em>Policy: Advance collected at check-in. Monthly rent is billed collectively to company at month end.</em>
                </p>
              </div>
            </div>
          )}

          {/* Financial summary card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Monthly Rent
              </span>
              <span className="text-[18px] font-black text-[#0a332c]">
                ₹{tenant.rentAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-center">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Due Balance
              </span>
              <span className={`text-[16px] font-black ${tenant.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {tenant.balance > 0 ? `₹${tenant.balance.toLocaleString('en-IN')}` : 'Nil (Clear)'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider block">
                Advance Deposit
              </span>
              <span className="text-[16px] font-bold text-slate-800">
                ₹{tenant.securityDeposit.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* WhatsApp Template Chooser */}
          <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-emerald-700">chat_bubble</span>
              Quick WhatsApp Template:
            </span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full h-[36px] px-3 border border-emerald-300 rounded-lg bg-white font-bold text-slate-900 text-[12px] focus:outline-none"
            >
              <option value="default">Standard Rent Due Reminder</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.topic}] {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Detail fields */}
          <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2 text-[12px]">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Monthly Due Date</span>
              <span className="font-bold text-slate-900">{tenant.dueDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Check-In Date</span>
              <span className="font-bold text-slate-900">{tenant.checkInDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Emergency Contact</span>
              <span className="font-bold text-slate-900">
                {tenant.emergencyContact} ({tenant.emergencyPhone})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">ID Proof</span>
              <span className="font-bold text-slate-900">
                {tenant.idProofType}: {tenant.idProofNumber}
              </span>
            </div>
          </div>

          {/* Document & Agreement Photos / Links */}
          <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5 bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#0a332c]">verified</span>
                Documents & Google Drive
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">
                Auto-organized folder
              </span>
            </div>

            {/* Active Scanner Drawer */}
            {activeScanner && (
              <div className="mt-1">
                <DocumentCameraCapture
                  tenantName={tenant.name}
                  roomNumber={tenant.roomNumber}
                  bedNumber={tenant.bedNumber}
                  isBulkContract={tenant.isBulkContract}
                  groupName={tenant.groupName}
                  docType={activeScanner === 'id' ? `ID Proof (${tenant.idProofType || 'Aadhaar'})` : 'Terms & Conditions Agreement'}
                  compact={true}
                  onUploaded={(url) => {
                    if (activeScanner === 'id') {
                      tenant.documentPhotoUrl = url;
                      tenant.documentsCollected = true;
                    } else {
                      tenant.termsDocumentUrl = url;
                      tenant.agreementCollected = true;
                    }
                    setActiveScanner(null);
                  }}
                  onClose={() => setActiveScanner(null)}
                />
              </div>
            )}

            {/* ID Proof Row */}
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">badge</span>
                <div className="truncate">
                  <span className="font-bold text-[12px] text-slate-800 block leading-tight">
                    {tenant.idProofType || 'Aadhaar'} Document
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {tenant.idProofNumber ? `#${tenant.idProofNumber}` : 'Number not registered'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {tenant.documentPhotoUrl ? (
                  <>
                    <a
                      href={tenant.documentPhotoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>View in Drive</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveScanner(activeScanner === 'id' ? null : 'id')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Re-scan / Re-upload"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveScanner(activeScanner === 'id' ? null : 'id')}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                    <span>Upload to Drive</span>
                  </button>
                )}
              </div>
            </div>

            {/* Terms & Conditions Agreement Row */}
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-[18px] text-indigo-700">description</span>
                <div className="truncate">
                  <span className="font-bold text-[12px] text-slate-800 block leading-tight">
                    Terms & Conditions Agreement
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block">
                    {tenant.agreementCollected ? 'Signed copy collected' : 'Pending signature'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {tenant.termsDocumentUrl ? (
                  <>
                    <a
                      href={tenant.termsDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <span>View in Drive</span>
                      <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveScanner(activeScanner === 'terms' ? null : 'terms')}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      title="Re-scan / Re-upload"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveScanner(activeScanner === 'terms' ? null : 'terms')}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold rounded-md text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                    <span>Upload Agreement</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Hostel Notes & Workplace
              </span>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[11px] font-bold text-[#0a332c] hover:underline"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-[11px] font-extrabold text-emerald-700 hover:underline"
                >
                  Save
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                rows={2}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-[12px] focus:outline-none"
              />
            ) : (
              <p className="text-[12px] text-slate-700">
                {tenant.notes || <span className="text-slate-400 italic">No internal notes added.</span>}
              </p>
            )}
          </div>

          {/* Actions Bottom Bar */}
          <div className="flex gap-2.5 pt-2 border-t border-slate-200">
            {tenant.isActive && (
              <button
                onClick={() => {
                  onClose();
                  onCollectRent(tenant);
                }}
                className="flex-1 h-[44px] bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 text-[13px]"
              >
                <span className="material-symbols-outlined text-[18px]">payments</span>
                <span>Collect Rent</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm(`Change status for ${tenant.name}?`)) {
                  onToggleActiveStatus(tenant.id);
                  onClose();
                }
              }}
              className={`h-[44px] px-4 font-bold rounded-xl text-[12px] transition-colors ${
                tenant.isActive
                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {tenant.isActive ? 'Mark Checked Out' : 'Re-Admit Resident'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
