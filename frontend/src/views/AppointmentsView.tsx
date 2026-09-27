import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Appointment } from '../types';
import { CalendarDays, Clock, User, Phone, CheckCircle2, Plus } from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const { appointments } = useData();

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Client Appointments & On-Site Visits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Store visit bookings, CCTV inspections and enterprise maintenance calls
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appointments.map((apt: Appointment) => (
          <div key={apt.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="font-bold text-[#087443] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {apt.date}
                </span>
                <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {apt.time}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">
                {apt.customer_name}
              </h3>
              <p className="text-xs text-slate-600 mb-2 font-mono">
                {apt.customer_phone}
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium">
                {apt.service_type}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Tech: <strong className="text-slate-800">{apt.assigned_technician}</strong></span>
              <span className={`font-bold capitalize ${apt.status === 'completed' ? 'text-emerald-700' : 'text-blue-700'}`}>
                {apt.status}
              </span>
            </div>
          </div>
        ))}

        {appointments.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No appointments scheduled</h3>
            <p className="text-xs text-slate-400 mt-1">Bookings and on-site visits will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
