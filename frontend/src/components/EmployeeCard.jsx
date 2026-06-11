import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const STATUS_BADGE = {
  todo: 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/25',
  inProgress: 'bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/25',
  done: 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25',
};

const EmployeeCard = ({ employee, onClick, compact = false }) => {
  const { profile, stats, taskBadges } = employee || {};
  const { name = 'Unknown', email = '', photoUrl } = profile || {};
  const { completedHours = 0, targetHours = 208, remainingHours = 0, overtimeHours = 0, leavesUsed = 0, leavesRemaining = 4 } = stats || {};
  const badges = taskBadges || { todo: 0, inProgress: 0, done: 0 };

  const progress = targetHours > 0 ? Math.min((completedHours / targetHours) * 100, 100) : 0;
  const progressColor = progress >= 100 ? '#10B981' : progress >= 70 ? '#F97316' : '#EF4444';

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="rounded-[12px] bg-[#12121A] border border-white/10 p-3 hover:border-[#00D4FF]/25 cursor-pointer transition-colors"
      >
        <div className="flex items-center gap-2 mb-2">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-[#00D4FF]/15 flex items-center justify-center text-[#00D4FF] text-xs font-bold">
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{name}</p>
            <p className="text-[#C0C0C8]/55 text-[10px] truncate">{email}</p>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {badges.todo > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE.todo}`}>{badges.todo} To Do</span>}
          {badges.inProgress > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE.inProgress}`}>{badges.inProgress} In Progress</span>}
          {badges.done > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE.done}`}>{badges.done} Done</span>}
          {badges.todo === 0 && badges.inProgress === 0 && badges.done === 0 && (
            <span className="text-[10px] text-[#C0C0C8]/45 px-1.5 py-0.5">No tasks assigned</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="rounded-[16px] bg-[#12121A] border border-white/10 p-5 hover:border-[#00D4FF]/20 cursor-pointer transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#F97316] flex items-center justify-center text-white font-bold text-base shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-bold text-base truncate">{name}</h3>
          <p className="text-[#C0C0C8]/55 text-xs truncate">{email}</p>
        </div>
      </div>

      {/* 208-Hour Counter */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[#C0C0C8]/65 text-xs">Monthly Hours</span>
          <span className="text-white text-xs font-bold">{completedHours} / {targetHours} hrs</span>
        </div>
        <div className="h-2 bg-[#0A0A0F] rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progressColor }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[#C0C0C8]/45 text-[10px]">Remaining</span>
          <span className="text-xs font-bold" style={{ color: progressColor }}>{remainingHours} hrs</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-[#0A0A0F] rounded-[10px] p-2.5 text-center">
          <p className="text-[#C0C0C8]/55 text-[10px]">Leaves</p>
          <p className="text-white text-sm font-bold">{leavesUsed} / 4</p>
        </div>
        {overtimeHours > 0 && (
          <div className="bg-[#F97316]/10 rounded-[10px] p-2.5 text-center border border-dashed border-[#F97316]/30">
            <p className="text-[#F97316]/75 text-[10px]">Overtime</p>
            <p className="text-[#F97316] text-sm font-bold">+{overtimeHours}h</p>
          </div>
        )}
      </div>

      {/* Task Status Badges */}
      <div className="border-t border-white/10 pt-3">
        <p className="text-[#C0C0C8]/45 text-[10px] uppercase tracking-widest mb-2">Task Status</p>
        <div className="flex gap-1.5 flex-wrap">
          {badges.todo > 0 && <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${STATUS_BADGE.todo}`}>{badges.todo} To Do</span>}
          {badges.inProgress > 0 && <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${STATUS_BADGE.inProgress}`}>{badges.inProgress} In Progress</span>}
          {badges.done > 0 && <span className={`text-[11px] font-bold px-2 py-1 rounded-lg ${STATUS_BADGE.done}`}>{badges.done} Done</span>}
          {badges.todo === 0 && badges.inProgress === 0 && badges.done === 0 && (
            <span className="text-[#C0C0C8]/45 text-xs px-2 py-1">No tasks assigned</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeCard;