import React, { useState } from 'react';
import { JobListing } from '../types';
import { CISINI_JOBS } from '../data/jobsData';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';
import { 
  Briefcase, 
  Coins, 
  Zap, 
  Clock, 
  MapPin, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Sparkles,
  AlertCircle,
  Soup,
  Package,
  Store,
  Flower2
} from 'lucide-react';

interface JobModalProps {
  coins: number;
  energy: number;
  maxEnergy: number;
  relationships: Record<string, number>;
  onClose: () => void;
  onWorkJob: (job: JobListing) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  coins,
  energy,
  maxEnergy,
  relationships,
  onClose,
  onWorkJob,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobListing>(CISINI_JOBS[0]);
  const [isWorking, setIsWorking] = useState(false);
  const [workProgress, setWorkProgress] = useState(0);

  const getJobIcon = (iconName: string) => {
    switch (iconName) {
      case 'soup':
        return <Soup className="w-6 h-6 text-amber-500" />;
      case 'package':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'store':
        return <Store className="w-6 h-6 text-emerald-500" />;
      case 'flower':
        return <Flower2 className="w-6 h-6 text-rose-500" />;
      default:
        return <Briefcase className="w-6 h-6 text-indigo-500" />;
    }
  };

  const handleStartWork = (job: JobListing) => {
    if (energy < job.energyCost) {
      return;
    }

    setIsWorking(true);
    setWorkProgress(0);
    soundManager.playInteract();

    const interval = setInterval(() => {
      setWorkProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsWorking(false);
          onWorkJob(job);
          soundManager.playQuestComplete();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-600/30 via-slate-800 to-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">Pusat Kerja & Lowongan Cisini</h2>
              <p className="text-xs text-slate-400">Bekerja paruh waktu untuk mengumpulkan koin & membantu warga</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Balance & Energy badges */}
            <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm">
                <Coins className="w-4 h-4" />
                <span>Rp {coins.toLocaleString('id-ID')}</span>
              </div>
              <div className="h-4 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-sm">
                <Zap className="w-4 h-4" />
                <span>{energy} / {maxEnergy}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Working Animation Overlay */}
        {isWorking && (
          <div className="absolute inset-0 z-20 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
            <div className="p-4 bg-amber-500/20 border border-amber-400/40 rounded-2xl mb-4 animate-bounce">
              <Briefcase className="w-12 h-12 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sedang Bekerja...</h3>
            <p className="text-slate-300 max-w-md text-sm mb-6">
              {selectedJob.description}
            </p>
            {/* Progress Bar */}
            <div className="w-72 bg-slate-800 rounded-full h-4 overflow-hidden border border-slate-700 p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${workProgress}%` }}
              />
            </div>
            <span className="text-xs text-amber-300 mt-2 font-medium">{workProgress}% Selesai</span>
          </div>
        )}

        {/* Body Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 flex-1 overflow-hidden">
          {/* Left: Job List */}
          <div className="md:col-span-5 p-4 border-r border-slate-800 overflow-y-auto space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">Lowongan Tersedia</h3>
            {CISINI_JOBS.map((job) => {
              const isSelected = selectedJob.id === job.id;
              const hasEnoughEnergy = energy >= job.energyCost;

              return (
                <button
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/5'
                      : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 mt-0.5">
                    {getJobIcon(job.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm truncate">{job.title}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{job.location}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="text-amber-400 font-bold">Rp {job.wage.toLocaleString('id-ID')}</span>
                      <span className={`flex items-center gap-0.5 ${hasEnoughEnergy ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <Zap className="w-3 h-3" />
                        -{job.energyCost}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Job Detail & Actions */}
          <div className="md:col-span-7 p-6 flex flex-col justify-between overflow-y-auto bg-slate-900/50">
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Pekerjaan Resmi Cisini
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">{selectedJob.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    Pemberi Kerja: <strong className="text-slate-200">{selectedJob.employer}</strong>
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upah Bersih</span>
                  </div>
                  <div className="text-base font-bold text-amber-300">
                    Rp {selectedJob.wage.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Konsumsi Energi</span>
                  </div>
                  <div className="text-base font-bold text-emerald-300">
                    -{selectedJob.energyCost} Stamina
                  </div>
                </div>

                <div className="p-3 bg-slate-800/70 border border-slate-700 rounded-xl">
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Durasi Kerja</span>
                  </div>
                  <div className="text-base font-bold text-blue-300">
                    {selectedJob.durationMinutes} Menit
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-800/40 border border-slate-800 rounded-xl space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deskripsi Tugas</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Bonus / Benefits */}
              {selectedJob.bonusReward && (
                <div className="flex items-start gap-2.5 p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-indigo-300 uppercase">Hadiah Tambahan</h5>
                    <p className="text-xs text-indigo-200 mt-0.5">{selectedJob.bonusReward}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Work Action Button */}
            <div className="pt-6 mt-6 border-t border-slate-800">
              {energy < selectedJob.energyCost ? (
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs mb-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Stamina kamu kurang! Tidur di Kasur Kosan atau makan soto hangat di warung untuk memulihkan stamina.</span>
                </div>
              ) : null}

              <button
                onClick={() => handleStartWork(selectedJob)}
                disabled={energy < selectedJob.energyCost}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                  energy >= selectedJob.energyCost
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span>Mulai Kerja Shift ({selectedJob.title})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
