import React, { useState } from 'react';
import {
  GOOGLE_APPS_SCRIPT_TEMPLATE,
  getSavedAppsScriptUrl,
  setSavedAppsScriptUrl,
  getSavedDriveFolderId,
  setSavedDriveFolderId,
} from '../../lib/driveAppsScript';

interface AppsScriptSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (url: string) => void;
}

export const AppsScriptSetupModal: React.FC<AppsScriptSetupModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [scriptUrl, setScriptUrl] = useState(getSavedAppsScriptUrl());
  const [folderId, setFolderId] = useState(getSavedDriveFolderId());
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    setSavedAppsScriptUrl(scriptUrl);
    setSavedDriveFolderId(folderId);
    if (onSaved) onSaved(scriptUrl);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!scriptUrl.trim()) {
      setTestStatus('Please paste your Google Apps Script Web App URL first.');
      return;
    }
    setIsTesting(true);
    setTestStatus('Pinging Google Apps Script Webhook...');
    try {
      // Test 1px dummy image
      const dummyPixel = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await fetch('/api/drive/upload-appscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptUrl: scriptUrl.trim(),
          base64: dummyPixel,
          filename: `Test_Ping_${Date.now()}.png`,
          folderId: folderId.trim(),
        }),
      });
      const data = await res.json();
      if (data.status === 'success' || data.fileUrl) {
        setTestStatus(` Connected successfully! Test file created in Drive folder: ${data.folderName || 'Agam PG Documents'}`);
      } else {
        setTestStatus(` Script answered but error: ${data.message || 'Check deployment permissions'}`);
      }
    } catch (err: any) {
      setTestStatus(` Connection failed: ${err.message || 'Check Web App URL and execute permissions'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#0a332c] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">add_to_drive</span>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                Connect Your Google Drive (No Login Required)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Store tenant Aadhaar & rental agreement photos directly into your personal Google Drive
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Explanation */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
              <span>100% Free & Unlimited Personal Google Drive Storage</span>
            </div>
            <p className="leading-relaxed text-[11px] text-emerald-800">
              By deploying this simple Google Apps Script in your Google account, photos taken in the app upload directly to your personal Google Drive without any login popups, OAuth blocks, or quota limitations!
            </p>
          </div>

          {/* 4-Step Instructions */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
            <h4 className="font-extrabold text-slate-800 text-[12px] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0a332c]">menu_book</span>
              <span>4 Simple Steps to Deploy (Takes 60 seconds)</span>
            </h4>
            <ol className="space-y-2 text-[11px] text-slate-700 pl-4 list-decimal marker:font-bold marker:text-emerald-700">
              <li>
                Open <a href="https://script.google.com/home/start" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">script.google.com</a> and click <strong>New Project</strong>.
              </li>
              <li>
                Replace all code in the editor with the script code below (click <strong>Copy Code</strong>).
              </li>
              <li>
                Click <strong>Deploy &gt; New deployment</strong> in the top right:
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-600 font-normal">
                  <li>Select type: <strong>Web app</strong> (gear icon)</li>
                  <li>Execute as: <strong>Me</strong> (your Gmail)</li>
                  <li>Who has access: <strong>Anyone</strong> (this allows the PG app to upload documents)</li>
                </ul>
              </li>
              <li>
                Click <strong>Deploy</strong>, grant permission if prompted, copy the <strong>Web App URL</strong> (ends in <code>/exec</code>), and paste it below!
              </li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-800 text-[11px]">
                Google Apps Script Code:
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-700 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[10px] leading-relaxed max-h-36 overflow-y-auto border border-slate-800">
              {GOOGLE_APPS_SCRIPT_TEMPLATE}
            </pre>
          </div>

          {/* Configuration Inputs */}
          <div className="space-y-3 pt-1 border-t border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                Your Deployed Apps Script Web App URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Paste the URL ending in <code>/exec</code> after clicking Deploy as Web App.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                Specific Google Drive Folder ID <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="Leave blank to auto-create 'Agam PG Resident Documents' folder"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                If left empty, a folder named <strong>"Agam PG Resident Documents"</strong> is created automatically in your Google Drive.
              </p>
            </div>

            {testStatus && (
              <div className={`p-2.5 rounded-xl text-[11px] font-medium ${
                testStatus.includes('successfully') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {testStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !scriptUrl.trim()}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">
              {isTesting ? 'sync' : 'network_check'}
            </span>
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-[#0a332c] text-white font-bold text-xs hover:bg-[#134e44] transition-colors shadow-xs flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">save</span>
              <span>Save & Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
