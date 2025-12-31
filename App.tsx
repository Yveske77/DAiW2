import React, { useState } from 'react';
import { NodeBuilder } from './components/NodeBuilder';
import { SequencerTimeline } from './components/SequencerTimeline';
import { AIAssistant } from './components/AIAssistant';
import * as geminiService from './services/geminiService';
import { ViewMode, NodeBlock, Project } from './types';
import { 
  Layout, 
  Activity, 
  Save, 
  Settings, 
  User, 
  Search, 
  Plus, 
  Music, 
  Sliders, 
  Grid,
  Mic2,
  Sparkles,
  Loader2,
  Trash2
} from 'lucide-react';

const INITIAL_NODES: NodeBlock[] = [
  { id: '1', type: 'context', name: 'Base Context', step: 1, data: { prompt: '80s chase scene, neon lights' } },
  { id: '2', type: 'genre', name: 'Genre Mixer', step: 2, data: { genres: ['Synthwave', 'Cyberpunk'] } },
  { id: '3', type: 'instrument', name: 'Instruments', step: 3, data: { instruments: ['Analog Bass', 'Arp Synths'] } },
  { id: '4', type: 'effect', name: 'FX Chain', step: 4, data: { effects: ['Reverb', 'Distortion'] } },
  { id: '5', type: 'output', name: 'Final Prompt', step: 5, data: {} },
];

const App = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.BUILDER);
  const [nodes, setNodes] = useState<NodeBlock[]>(INITIAL_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  
  // Project Metadata State
  const [projectMeta, setProjectMeta] = useState({
    name: 'Neon Horizons',
    bpm: 128,
    key: 'C Minor',
    genre: 'Electronic'
  });

  const addNode = (type: NodeBlock['type'] = 'instrument') => {
    const newNode: NodeBlock = {
      id: Date.now().toString(),
      type: type,
      name: type === 'lyrics' ? 'Lyrics & Vocal' : 'New Layer',
      step: nodes.length,
      data: type === 'lyrics' ? { topic: '', mood: '', lyrics: '' } : {}
    };
    // Insert before output
    const newNodes = [...nodes];
    const insertIndex = newNodes.length - 1;
    newNodes.splice(insertIndex, 0, newNode);
    // Renumber steps
    newNodes.forEach((n, i) => n.step = i + 1);
    setNodes(newNodes);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const updateNodeData = (id: string, data: any) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n));
  };

  const handleGenerateLyrics = async () => {
    if (!selectedNodeId) return;
    const node = nodes.find(n => n.id === selectedNodeId);
    if (!node) return;

    setIsGeneratingLyrics(true);
    
    // Attempt to find genre from other nodes if not specified, otherwise use project meta
    const genreNode = nodes.find(n => n.type === 'genre');
    const detectedGenre = genreNode?.data?.genres?.[0] || projectMeta.genre || 'Pop';
    
    const topic = node.data.topic || 'Love and Loss';
    const mood = node.data.mood || 'Melancholic';
    
    try {
        const lyrics = await geminiService.generateLyrics(topic, detectedGenre, mood);
        updateNodeData(selectedNodeId, { lyrics });
    } catch (e) {
        console.error("Failed to generate lyrics", e);
    } finally {
        setIsGeneratingLyrics(false);
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-text overflow-hidden selection:bg-primary selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary to-purple-800 rounded-lg text-white shadow-inner">
            <Layout size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">DAiW Workstation</h1>
            <p className="text-text-muted text-xs">Tune-Forge-1 • Project: {projectMeta.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-surface-light rounded-lg p-0.5 border border-border">
            <button 
              onClick={() => setViewMode(ViewMode.BUILDER)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === ViewMode.BUILDER ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}
            >
              Builder
            </button>
            <button 
              onClick={() => setViewMode(ViewMode.TIMELINE)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${viewMode === ViewMode.TIMELINE ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'}`}
            >
              Timeline
            </button>
          </div>
          
          <button 
             onClick={() => setIsAiOpen(!isAiOpen)}
             className={`flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-bold transition-all shadow-lg ${isAiOpen ? 'bg-primary-hover text-white ring-2 ring-primary/30' : 'bg-primary text-white'}`}
          >
             <Activity size={16} /> AI Assistant
          </button>

          <div className="h-6 w-[1px] bg-border mx-1" />

          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-light hover:bg-border transition-colors">
            <Save size={18} className="text-text-muted" />
          </button>
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-light hover:bg-border transition-colors">
            <Settings size={18} className="text-text-muted" />
          </button>
           <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-light hover:bg-border transition-colors">
            <User size={18} className="text-text-muted" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar (Components) */}
        <aside className="w-64 flex flex-col border-r border-border bg-surface z-10">
          <div className="p-4 space-y-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
               <input 
                 className="w-full bg-surface-light border border-border rounded-lg py-1.5 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary placeholder:text-text-muted/50" 
                 placeholder="Search components..." 
               />
             </div>

             <div className="space-y-2">
                <details className="group open:bg-surface-light/30 rounded-lg border border-transparent open:border-border transition-all" open>
                   <summary className="flex items-center justify-between p-2 cursor-pointer text-sm font-medium text-text-muted group-hover:text-white select-none">
                      <div className="flex items-center gap-2">
                        <Grid size={16} className="text-sky-400" /> Components
                      </div>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                   </summary>
                   <div className="p-2 pt-0 grid grid-cols-2 gap-2">
                      <div onClick={() => addNode('instrument')} className="p-2 rounded bg-surface border border-border hover:border-primary cursor-pointer hover:bg-surface-light text-center transition-colors">
                         <Music size={20} className="mx-auto mb-1 text-green-400" />
                         <span className="text-[10px] text-text-muted block">Instrument</span>
                      </div>
                      <div onClick={() => addNode('lyrics')} className="p-2 rounded bg-surface border border-border hover:border-pink-500 cursor-pointer hover:bg-surface-light text-center transition-colors">
                         <Mic2 size={20} className="mx-auto mb-1 text-pink-400" />
                         <span className="text-[10px] text-text-muted block">Lyrics</span>
                      </div>
                      <div onClick={() => addNode('effect')} className="p-2 rounded bg-surface border border-border hover:border-teal-500 cursor-pointer hover:bg-surface-light text-center transition-colors">
                         <Sliders size={20} className="mx-auto mb-1 text-teal-400" />
                         <span className="text-[10px] text-text-muted block">Effect</span>
                      </div>
                   </div>
                </details>

                 <details className="group open:bg-surface-light/30 rounded-lg border border-transparent open:border-border transition-all">
                   <summary className="flex items-center justify-between p-2 cursor-pointer text-sm font-medium text-text-muted group-hover:text-white select-none">
                      <div className="flex items-center gap-2">
                        <Sliders size={16} className="text-teal-400" /> Modifiers
                      </div>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                   </summary>
                   <div className="p-2 pt-0">
                      {/* Placeholder content */}
                   </div>
                </details>
             </div>
          </div>
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 flex flex-col relative">
           {viewMode === ViewMode.BUILDER ? (
              <NodeBuilder 
                nodes={nodes} 
                onAddNode={() => addNode('instrument')} 
                onRemoveNode={removeNode}
                onSelectNode={(node) => setSelectedNodeId(node.id)}
                selectedNodeId={selectedNodeId}
              />
           ) : (
              <SequencerTimeline curves={[]} />
           )}
           
           <AIAssistant 
             isOpen={isAiOpen} 
             onClose={() => setIsAiOpen(false)} 
             nodes={nodes}
             selectedNodeId={selectedNodeId}
             projectMeta={projectMeta}
           />
        </main>

        {/* Right Sidebar (Inspector) */}
        {viewMode === ViewMode.BUILDER && (
          <aside className="w-80 border-l border-border bg-surface z-20 flex flex-col overflow-hidden">
             <div className="p-4 border-b border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center justify-between">
                   Inspector
                   {selectedNodeId && <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-[10px]">Active</span>}
                </h3>
             </div>
             
             {selectedNode ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                   {/* Common Header */}
                   <div className="space-y-2">
                      <label className="text-[10px] text-text-muted uppercase font-bold">Node Name</label>
                      <input 
                        className="w-full bg-background border border-border rounded px-3 py-2 text-xs text-white focus:border-primary focus:outline-none" 
                        value={selectedNode.name}
                        onChange={(e) => setNodes(nodes.map(n => n.id === selectedNode.id ? { ...n, name: e.target.value } : n))}
                      />
                   </div>

                   {/* Content based on Node Type */}
                   {selectedNode.type === 'lyrics' ? (
                       <div className="space-y-4">
                           <div className="p-3 bg-surface-light rounded-lg border border-border space-y-3">
                               <div className="flex items-center gap-2 mb-2 text-pink-400">
                                   <Sparkles size={14} />
                                   <span className="text-xs font-bold uppercase">AI Lyric Generator</span>
                               </div>
                               
                               <div className="space-y-1">
                                   <label className="text-[10px] text-text-muted">Topic / Theme</label>
                                   <input 
                                     className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none" 
                                     placeholder="e.g. Lost in space, Heartbreak"
                                     value={selectedNode.data.topic || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { topic: e.target.value })}
                                   />
                               </div>
                               
                               <div className="space-y-1">
                                   <label className="text-[10px] text-text-muted">Mood</label>
                                   <input 
                                     className="w-full bg-surface border border-border rounded px-2 py-1.5 text-xs text-white focus:border-primary focus:outline-none" 
                                     placeholder="e.g. Melancholic, Energetic"
                                     value={selectedNode.data.mood || ''}
                                     onChange={(e) => updateNodeData(selectedNode.id, { mood: e.target.value })}
                                   />
                               </div>

                               <button 
                                 onClick={handleGenerateLyrics}
                                 disabled={isGeneratingLyrics}
                                 className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded text-xs font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                               >
                                 {isGeneratingLyrics ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                 GENERATE LYRICS
                               </button>
                           </div>

                           <div className="space-y-2">
                               <label className="text-[10px] text-text-muted uppercase font-bold">Lyrics Editor</label>
                               <textarea 
                                 className="w-full h-64 bg-background border border-border rounded-lg p-3 text-xs text-white focus:border-primary focus:outline-none resize-none font-mono leading-relaxed"
                                 placeholder="Lyrics will appear here..."
                                 value={selectedNode.data.lyrics || ''}
                                 onChange={(e) => updateNodeData(selectedNode.id, { lyrics: e.target.value })}
                               />
                           </div>
                       </div>
                   ) : (
                       /* Generic Controls for other nodes */
                       <div className="space-y-4 p-3 bg-surface-light rounded-lg border border-border">
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-white">Density</span>
                             <span className="text-[10px] text-primary">High</span>
                          </div>
                          <input type="range" className="w-full h-1 bg-background rounded-lg appearance-none cursor-pointer accent-primary" />
                          
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-white">Complexity</span>
                             <span className="text-[10px] text-primary">Med</span>
                          </div>
                          <input type="range" className="w-full h-1 bg-background rounded-lg appearance-none cursor-pointer accent-primary" />
                       </div>
                   )}
                   
                   <div className="mt-auto pt-4 border-t border-border">
                      <button 
                        onClick={() => removeNode(selectedNode.id)}
                        className="w-full py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded text-xs font-bold hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                      >
                         <Trash2 size={12} /> DELETE NODE
                      </button>
                   </div>
                </div>
             ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted text-xs p-8 text-center opacity-50">
                   Select a node to view properties
                </div>
             )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;