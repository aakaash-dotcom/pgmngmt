import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onCancel}
      />

      <div className="relative bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 flex flex-col items-center text-center gap-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
              danger
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}
          >
            <span className="material-symbols-outlined text-[32px]">
              {danger ? 'warning' : 'help'}
            </span>
          </div>

          <div>
            <h3 className="text-[17px] font-extrabold text-slate-900 leading-tight">{title}</h3>
            <p className="text-[13px] text-slate-500 font-medium mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex gap-2.5 p-4 pt-1 bg-slate-50/60 border-t border-slate-100">
          <button
            onClick={onCancel}
            className="flex-1 h-[42px] bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-[13px] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-[42px] text-white font-extrabold rounded-xl text-[13px] shadow-sm transition-colors ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-[#0a332c] hover:bg-[#0f4239]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
