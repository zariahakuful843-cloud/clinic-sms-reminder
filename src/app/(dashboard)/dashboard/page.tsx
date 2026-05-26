"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiMessageSquare, FiAlertCircle } from "react-icons/fi";

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports?type=dashboard")
      .then((res) => res.json())
      .then(setStats)
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

  const cards = [
    {
      title: "Total Patients",
      value: stats?.totalPatients || 0,
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      title: "Scheduled Appointments",
      value: stats?.scheduledAppointments || 0,
      icon: FiCalendar,
      color: "bg-green-500",
    },
    {
      title: "SMS Sent",
      value: stats?.totalSMS || 0,
      icon: FiMessageSquare,
      color: "bg-purple-500",
    },
    {
      title: "Missed Appointments",
      value: stats?.missedAppointments || 0,
      icon: FiAlertCircle,
      color: "bg-red-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your clinic&apos;s activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            SMS Delivery Rate
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${stats?.smsDeliveryRate || 0}%` }}
              />
            </div>
            <span className="text-lg font-semibold text-gray-700">
              {stats?.smsDeliveryRate || 0}%
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Delivered: </span>
              <span className="font-medium">{stats?.deliveredSMS || 0}</span>
            </div>
            <div>
              <span className="text-gray-500">Failed: </span>
              <span className="font-medium">{stats?.failedSMS || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Appointment Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Appointments</span>
              <span className="font-semibold">{stats?.totalAppointments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Scheduled</span>
              <span className="font-semibold text-green-600">
                {stats?.scheduledAppointments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Missed</span>
              <span className="font-semibold text-red-600">
                {stats?.missedAppointments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
