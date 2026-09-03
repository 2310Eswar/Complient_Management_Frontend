import React from 'react';
import { X, Download, FileText } from 'lucide-react';

const LightboxModal = ({ attachment, onClose }) => {
  if (!attachment) return null;

  const isImage = attachment.fileType && attachment.fileType.startsWith('image/');
  const fullUrl = `http://localhost:8082${attachment.fileUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl overflow-hidden flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-slate-800">
            <FileText className="w-5 h-5 text-brand-600" />
            <span className="font-semibold text-sm truncate max-w-md">{attachment.originalName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={fullUrl}
              download={attachment.originalName}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary py-1.5 px-3"
              title="Download File"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-semibold">Download</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="my-4 flex items-center justify-center w-full max-h-[75vh] overflow-auto">
          {isImage ? (
            <img
              src={fullUrl}
              alt={attachment.originalName}
              className="max-h-[70vh] object-contain rounded-lg border border-slate-200 shadow-sm"
            />
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 max-w-md w-full">
              <FileText className="w-14 h-14 text-brand-600 mx-auto mb-3" />
              <p className="text-slate-800 font-semibold text-sm">{attachment.originalName}</p>
              <p className="text-xs text-slate-500 mt-1">Non-image attachment ({attachment.fileType})</p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-4 inline-flex"
              >
                Open / Download Document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightboxModal;
