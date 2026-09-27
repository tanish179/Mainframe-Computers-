import React from 'react';
import { useData } from '../context/DataContext';
import { StaffMember } from '../types';
import { UserCog, Phone, Mail, Award, CheckCircle, Clock } from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff } = useData();

  return (
    <div className="space-y-6 max-w-[1520px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Staff & Technician Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Store personnel, bench technicians, workload allocation and repair completion metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {staff.map((member: StaffMember) => (
          <div key={member.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#087443] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {member.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {member.name}
                  </h3>
                  <div className="text-[11px] text-[#087443] font-semibold">
                    {member.role}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{member.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Active Jobs</span>
                  <span className="text-base font-bold text-[#087443] font-mono">{member.active_jobs}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold block">Completed</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{member.completed_jobs}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Joined: {member.joined_date}</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
        ))}

        {staff.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
            <UserCog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No staff members registered</h3>
            <p className="text-xs text-slate-400 mt-1">Bench technicians and front desk staff will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
