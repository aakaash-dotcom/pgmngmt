import React, { useState } from 'react';
import { WhatsAppTemplate } from '../../types';
import { OWNER_PHONE, OWNER_UPI_ID, PG_NAME } from '../../data/initialData';

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: WhatsAppTemplate[];
  onSaveTemplate: (template: WhatsAppTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const WhatsAppTemplateModal: React.FC<WhatsAppTemplateModalProps> = ({
  isOpen,
  onClose,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'new');
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('Rent Reminder');
  const [category, setCategory] = useState<'individual' | 'group' | 'general'>('individual');
  const [templateText, setTemplateText] = useState('');

  if (!isOpen) return null;

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    if (id === 'new') {
      setTitle('');
      setTopic('Rent Reminder');
      setCategory('individual');
      setTemplateText(
        `*AGAM MEN'S PG & STAY - NOTICE*\n\nDear *{name}* (Room {room}, {bed}),\n\n[Write your message here]\n\n- Management, {pg_name}`
      );
      setIsEditing(true);
    } else {
      const found = templates.find((t) => t.id === id);
      if (found) {
        setTitle(found.title);
        setTopic(found.topic);
        setCategory(found.category);
        setTemplateText(found.template);
        setIsEditing(false);
      }
    }
  };

  const handleInsertTag = (tag: string) => {
    setTemplateText((prev) => `${prev}${tag}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !templateText.trim()) return;

    const toSave: WhatsAppTemplate = {
      id: selectedTemplateId === 'new' ? `tmpl-${Date.now()}` : selectedTemplateId,
      title: title.trim(),
      topic: topic.trim(),
      category,
      template: templateText.trim(),
      isDefault: false,
    };

    onSaveTemplate(toSave);
    setIsEditing(false);
    setSelectedTemplateId(toSave.id);
  };

  const placeholderTags = [
    { tag: '{name}', label: 'Resident Name' },
    { tag: '{room}', label: 'Room #' },
    { tag: '{bed}', label: 'Bed Tag' },
    { tag: '{rent}', label: 'Rent Amount' },
    { tag: '{due_date}', label: 'Due Date' },
    { tag: '{company}', label: 'Company Name' },
    { tag: '{group_name}', label: 'Group Title' },
    { tag: '{total_rent}', label: 'Total Payable' },
    { tag: '{count}', label: 'Member Count' },
    { tag: '{upi_id}', label: 'UPI ID' },
    { tag: '{owner_phone}', label: 'Owner Phone' },
    { tag: '{pg_name}', label: 'PG Name' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="relative bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0a332c] text-white p-4 px-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">chat</span>
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold leading-tight">WhatsApp Template Manager</h3>
              <p className="text-[11px] text-emerald-100/80 font-medium">
                Create & customize templates for individuals, groups & notices
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex flex-col gap-4 text-[13px]">
          {/* Template Selector & Add Button */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Select Template
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 focus:outline-none"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.topic}] {t.title} ({t.category})
                  </option>
                ))}
                <option value="new">+ Create New Template...</option>
              </select>
            </div>

            <div className="flex gap-2 items-end">
              {selectedTemplateId !== 'new' && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="h-[38px] px-3 bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 rounded-lg flex items-center gap-1 text-[12px]"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit</span>
                </button>
              )}
              {selectedTemplateId !== 'new' && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this template?')) {
                      onDeleteTemplate(selectedTemplateId);
                      setSelectedTemplateId(templates[0]?.id || 'new');
                    }
                  }}
                  className="h-[38px] px-3 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold rounded-lg flex items-center gap-1 text-[12px]"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSelectTemplate('new')}
                className="h-[38px] px-3.5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-bold rounded-lg flex items-center gap-1 text-[12px] shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>New</span>
              </button>
            </div>
          </div>

          {/* Form when editing or viewing */}
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Template Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing && selectedTemplateId !== 'new'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Month-End Company Accomodation Invoice"
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-[11px] mb-1">
                  Topic / Category
                </label>
                <input
                  type="text"
                  required
                  disabled={!isEditing && selectedTemplateId !== 'new'}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Rent Reminder"
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-white text-slate-900 font-semibold focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Smart Tags to click & insert */}
            {isEditing && (
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Click to Insert Smart Placeholders:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {placeholderTags.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => handleInsertTag(p.tag)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-mono font-bold text-slate-800 transition-colors shadow-2xs"
                    >
                      {p.tag} <span className="text-[10px] text-slate-500 font-sans font-normal">({p.label})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 text-[11px] mb-1">
                WhatsApp Message Body *
              </label>
              <textarea
                rows={9}
                required
                disabled={!isEditing && selectedTemplateId !== 'new'}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                placeholder="Write your WhatsApp announcement text here..."
                className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-900 font-mono text-[12px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
              />
            </div>

            {isEditing && (
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-[40px] px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[40px] px-5 bg-[#0a332c] hover:bg-[#0f4239] text-white font-extrabold rounded-xl shadow-xs text-[12px] flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Template</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
