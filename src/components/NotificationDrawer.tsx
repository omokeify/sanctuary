import React from 'react';
import { X, Mail, MessageSquare, CheckCircle, Clock, Trash2, Send } from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: NotificationLog[];
  onClearLogs: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fade-in text-on-background">
      <div 
        id="notification-drawer-panel"
        className="w-full max-w-md bg-surface-container-low h-full shadow-2xl flex flex-col border-l border-outline-variant/30"
      >
        {/* Drawer Header */}
        <div className="p-5 bg-primary text-on-primary flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-pulse" />
              <h2 className="text-lg font-serif font-bold">Notification Dispatch Log</h2>
            </div>
            <p className="text-xs text-on-primary/75 mt-0.5">
              Live Resend (Email) & Twilio (SMS) simulator stubs
            </p>
          </div>
          <button
            id="btn-close-drawer"
            onClick={onClose}
            className="p-2 rounded-full text-on-primary/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Subheader / Actions */}
        <div className="px-5 py-3 bg-surface-container-high border-b border-outline-variant/20 flex items-center justify-between text-xs text-primary font-medium">
          <span>{logs.length} Total Messages Logged</span>
          {logs.length > 0 && (
            <button
              id="btn-clear-notification-logs"
              onClick={onClearLogs}
              className="flex items-center gap-1.5 text-error hover:text-error/80 font-semibold cursor-pointer px-3 py-1 rounded-full hover:bg-error-container/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Log
            </button>
          )}
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {logs.length === 0 ? (
            <div className="text-center py-12 px-4 text-secondary">
              <Mail className="w-10 h-10 mx-auto mb-3 opacity-40 text-primary" />
              <p className="font-semibold text-sm text-primary">No notifications dispatched yet</p>
              <p className="text-xs mt-1 leading-relaxed">
                Book a massage treatment or trigger reminders to see live Resend emails & Twilio SMS logs here!
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                id={`log-item-${log.id}`}
                className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-xs hover:border-primary/40 transition"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {log.type === 'email' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                        <Mail className="w-3 h-3" />
                        Resend Email
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-fixed text-on-primary-fixed">
                        <MessageSquare className="w-3 h-3" />
                        Twilio SMS
                      </span>
                    )}
                    <span className="text-[10px] text-secondary flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-secondary" />
                      Delivered
                    </span>
                  </div>
                  <span className="text-[10px] text-secondary">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Recipient & Subject */}
                <div className="text-xs mb-2">
                  <div className="text-secondary font-medium">To: <span className="text-primary font-semibold">{log.recipient}</span></div>
                  {log.type === 'email' && (
                    <div className="text-primary font-semibold mt-0.5 truncate">{log.subject}</div>
                  )}
                </div>

                {/* Body Preview */}
                <div className="bg-surface-container-low rounded-xl p-3 text-xs text-on-background font-mono whitespace-pre-wrap leading-relaxed border border-outline-variant/20">
                  {log.body}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-surface-container-high/60 border-t border-outline-variant/20 text-[11px] text-secondary text-center">
          In production, these dispatch to the live Resend & Twilio API endpoints.
        </div>
      </div>
    </div>
  );
};

