"use client";

import { useEffect, useState } from "react";

interface SMSLog {
  id: number;
  message: string;
  phoneNumber: string;
  reminderType: string;
  deliveryStatus: string;
  sentAt: string;
  patient: { fullName: string; phoneNumber: string };
}

async function loadLogs(filterStatus: string) {
  const params = new URLSearchParams();
  if (filterStatus) params.set("status", filterStatus);
  const res = await fetch(`/api/sms/logs?${params}`);
  const data = await res.json();
  return data.logs || [];
}

export default function SMSLogsPage() {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadLogs(filterStatus).then((data) => {
      if (!cancelled) {
        setLogs(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "SENT": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "FAILED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">SMS Logs</h1>
        <p className="text-gray-500 mt-1">Track all SMS messages sent</p>
      </div>

      <div className="mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">All Statuses</option>
          <option value="DELIVERED">Delivered</option>
          <option value="SENT">Sent</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No SMS logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.patient.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{log.phoneNumber}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{log.message}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{log.reminderType}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.deliveryStatus)}`}>
                        {log.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {new Date(log.sentAt).toLocaleString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
