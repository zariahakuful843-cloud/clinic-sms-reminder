"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  scheduledAppointments: number;
  missedAppointments: number;
  totalSMS: number;
  deliveredSMS: number;
  failedSMS: number;
  smsDeliveryRate: number;
}

interface SMSReport {
  statusCounts: { deliveryStatus: string; _count: number }[];
  typeCounts: { reminderType: string; _count: number }[];
}

export default function ReportsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [smsReport, setSmsReport] = useState<SMSReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports?type=dashboard").then((r) => r.json()),
      fetch("/api/reports?type=sms").then((r) => r.json()),
    ])
      .then(([dashData, smsData]) => {
        setStats(dashData);
        setSmsReport(smsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-500 mt-1">System analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Patient Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Patients Registered</span>
              <span className="font-bold text-lg">{stats?.totalPatients || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total Appointments</span>
              <span className="font-bold text-lg">{stats?.totalAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Currently Scheduled</span>
              <span className="font-bold text-lg text-green-600">{stats?.scheduledAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Missed Appointments</span>
              <span className="font-bold text-lg text-red-600">{stats?.missedAppointments || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">SMS Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Total SMS Sent</span>
              <span className="font-bold text-lg">{stats?.totalSMS || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Delivered</span>
              <span className="font-bold text-lg text-green-600">{stats?.deliveredSMS || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-lg text-red-600">{stats?.failedSMS || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Delivery Rate</span>
              <span className="font-bold text-lg">{stats?.smsDeliveryRate || 0}%</span>
            </div>
          </div>
        </div>

        {smsReport && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">SMS by Status</h2>
              <div className="space-y-3">
                {smsReport.statusCounts.map((item) => (
                  <div key={item.deliveryStatus} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-600">{item.deliveryStatus}</span>
                    <span className="font-semibold">{item._count}</span>
                  </div>
                ))}
                {smsReport.statusCounts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No data yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">SMS by Reminder Type</h2>
              <div className="space-y-3">
                {smsReport.typeCounts.map((item) => (
                  <div key={item.reminderType} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-gray-600">{item.reminderType}</span>
                    <span className="font-semibold">{item._count}</span>
                  </div>
                ))}
                {smsReport.typeCounts.length === 0 && (
                  <p className="text-gray-400 text-center py-4">No data yet</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
