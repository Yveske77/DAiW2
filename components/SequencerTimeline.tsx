import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Curve } from '../types';
import { Play, SkipBack, SkipForward, Scissors, Edit3 } from 'lucide-react';

interface SequencerTimelineProps {
  curves: Curve[];
}

export const SequencerTimeline: React.FC<SequencerTimelineProps> = ({ curves }) => {
  // Mock data generation for visualization if curves are sparse
  const data = Array.from({ length: 20 }, (_, i) => {
    return {
      time: i * 5,
      intensity: 20 + Math.random() * 30 + (i > 10 ? 40 : 0),
      complexity: 30 + Math.sin(i * 0.5) * 20,
      emotion: 50 + (i * 2),
    };
  });

  return (
    <div className="flex-1 bg-background flex flex-col overflow-hidden">
      {/* Timeline Toolbar */}
      <div className="h-14 border-b border-border bg-surface-light px-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex bg-surface rounded p-1 border border-border">
               <button className="p-1.5 hover:text-primary"><SkipBack size={16} /></button>
               <button className="p-1.5 hover:text-primary"><Play size={16} /></button>
               <button className="p-1.5 hover:text-primary"><SkipForward size={16} /></button>
            </div>
            <div className="text-3xl font-mono text-primary font-bold tracking-widest">
              01:14:02
            </div>
         </div>
         <div className="flex gap-2">
            <button className="p-2 rounded hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-white">
               <Scissors size={18} />
            </button>
            <button className="p-2 rounded bg-primary text-white font-bold text-xs shadow-[0_0_15px_rgba(146,19,236,0.4)]">
               GENERATE SCENE
            </button>
         </div>
      </div>

      {/* Chapter Markers */}
      <div className="h-24 border-b border-border bg-surface-light/50 flex divide-x divide-border">
         <div className="flex-1 p-3 bg-indigo-900/20 relative group hover:bg-indigo-900/30 transition-colors cursor-pointer border-l-4 border-indigo-500">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide block mb-1">Chapter 1: Arrival</span>
            <p className="text-xs text-indigo-100 line-clamp-2">A mysterious vessel approaches a desolate planet.</p>
            <div className="absolute bottom-2 left-3 flex gap-1">
               <span className="px-1.5 py-0.5 rounded bg-indigo-900/50 border border-indigo-500/30 text-[9px] text-indigo-300">Ominous</span>
            </div>
         </div>
         <div className="flex-1 p-3 bg-teal-900/20 relative group hover:bg-teal-900/30 transition-colors cursor-pointer border-l-4 border-teal-500">
             <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wide block mb-1">Chapter 2: Discovery</span>
             <p className="text-xs text-teal-100 line-clamp-2">Explorers find ancient ruins.</p>
         </div>
         <div className="flex-1 p-3 bg-background relative border-l-4 border-border">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide block mb-1">Add Chapter...</span>
         </div>
      </div>

      {/* Main Graph Area */}
      <div className="flex-1 relative p-4 bg-[#151118]">
         {/* Background Grid Lines */}
         <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9213ec" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#9213ec" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorComplexity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1a1022', borderColor: '#493b54', borderRadius: '8px' }}
                 itemStyle={{ fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#9213ec" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorIntensity)" 
              />
              <Area 
                type="monotone" 
                dataKey="complexity" 
                stroke="#00d2ff" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fillOpacity={1} 
                fill="url(#colorComplexity)" 
              />
               <Area 
                type="monotone" 
                dataKey="emotion" 
                stroke="#fbbf24" 
                strokeWidth={2}
                fill="none" 
              />
            </AreaChart>
         </ResponsiveContainer>

         {/* Legend / Overlay Controls */}
         <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-surface/80 p-1.5 rounded border border-border backdrop-blur-sm">
               <div className="w-3 h-3 rounded-full bg-primary"></div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-white">Intensity</span>
            </div>
            <div className="flex items-center gap-2 bg-surface/80 p-1.5 rounded border border-border backdrop-blur-sm">
               <div className="w-3 h-3 rounded-full bg-accent"></div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-white">Complexity</span>
            </div>
            <div className="flex items-center gap-2 bg-surface/80 p-1.5 rounded border border-border backdrop-blur-sm">
               <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
               <span className="text-[10px] font-bold uppercase tracking-wider text-white">Emotional Tone</span>
            </div>
         </div>
      </div>
    </div>
  );
};
