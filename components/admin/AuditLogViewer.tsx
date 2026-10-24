'use client';

import React, { useState } from 'react';
import { useAppState } from '@/lib/store/app-state';
import { ShieldCheck, Clock, Filter } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

export default function AuditLogViewer() {
  const { auditLogs } = useAppState();
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter(
    (log) => filterType === 'ALL' || log.targetType === filterType
  );

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-black text-slate-900">
            System & Administrative Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Immutable log of all verifications, dispatch updates, fare modifications, and safety actions
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 min-h-[38px] font-medium text-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          >
            <option value="ALL">All Event Types</option>
            <option value="DRIVER">Driver Approvals</option>
            <option value="COMMUTER">Commuter Verifications</option>
            <option value="FARE_POLICY">Fare Policy Updates</option>
            <option value="TERMINAL">Terminal Queues</option>
            <option value="INCIDENT">Incident Actions</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <div key={log.id} className="py-3 flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] truncate">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">{formatRelativeTime(log.timestamp)}</span>
              </div>
              <p className="text-slate-700 mt-1 break-words">{log.details}</p>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                Target: {log.targetType} #{log.targetId} • Admin: {log.adminEmail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
