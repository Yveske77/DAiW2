import React from 'react';
import { NodeBlock } from '../types';
import { Plus, Copy, Send, Trash2, Sliders, Music, Activity, Type, Zap, Mic2 } from 'lucide-react';

interface NodeBuilderProps {
  nodes: NodeBlock[];
  onAddNode: () => void;
  onRemoveNode: (id: string) => void;
  onSelectNode: (node: NodeBlock) => void;
  selectedNodeId: string | null;
}

const NodeIcon = ({ type }: { type: NodeBlock['type'] }) => {
  switch (type) {
    case 'context': return <Type className="w-4 h-4 text-white" />;
    case 'genre': return <Activity className="w-4 h-4 text-sky-400" />;
    case 'instrument': return <Music className="w-4 h-4 text-green-400" />;
    case 'effect': return <Zap className="w-4 h-4 text-teal-400" />;
    case 'output': return <Send className="w-4 h-4 text-primary" />;
    case 'lyrics': return <Mic2 className="w-4 h-4 text-pink-400" />;
    default: return <Type className="w-4 h-4 text-white" />;
  }
};

export const NodeBuilder: React.FC<NodeBuilderProps> = ({ nodes, onAddNode, onRemoveNode, onSelectNode, selectedNodeId }) => {
  return (
    <div className="flex-1 overflow-y-auto relative bg-[#1a1022] bg-[radial-gradient(#493b54_1px,transparent_1px)] [background-size:24px_24px] p-8 flex flex-col items-center gap-4">
      
      {nodes.map((node, index) => {
        const isSelected = selectedNodeId === node.id;
        const isLast = index === nodes.length - 1;

        return (
          <React.Fragment key={node.id}>
            {/* Node Card */}
            <div 
              onClick={() => onSelectNode(node)}
              className={`
                relative w-80 rounded-xl transition-all duration-200 cursor-pointer border
                ${isSelected 
                  ? 'border-primary shadow-[0_0_0_2px_rgba(146,19,236,0.4),0_8px_24px_rgba(146,19,236,0.3)] z-20 transform -translate-y-1' 
                  : 'border-border bg-surface-light hover:border-primary/50 hover:shadow-lg z-10'
                }
              `}
            >
              {/* Header */}
              <div className={`
                flex items-center justify-between px-4 py-3 border-b rounded-t-xl
                ${isSelected ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/5'}
              `}>
                <div className="flex items-center gap-2">
                  <NodeIcon type={node.type} />
                  <span className="text-sm font-bold text-white">{node.name}</span>
                </div>
                <div className="px-2 py-0.5 rounded bg-surface border border-border text-[10px] text-text-muted">
                  Step {node.step}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-surface-light rounded-b-xl">
                {node.type === 'context' && (
                  <div className="bg-surface p-2 rounded border border-border/50 text-xs text-text-muted italic">
                    "{node.data.prompt || 'No prompt set'}"
                  </div>
                )}
                
                {node.type === 'genre' && (
                  <div className="space-y-2">
                     <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] text-text-muted">
                          <span>Synthwave</span>
                          <span>80%</span>
                        </div>
                        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 w-[80%]"></div>
                        </div>
                     </div>
                  </div>
                )}

                {node.type === 'instrument' && (
                  <div className="flex flex-wrap gap-2">
                    {(node.data.instruments || ['Bass', 'Pad']).map((inst: string) => (
                      <span key={inst} className="px-2 py-1 text-[10px] rounded bg-surface border border-border text-green-200">
                        {inst}
                      </span>
                    ))}
                  </div>
                )}

                {node.type === 'effect' && (
                   <div className="space-y-1">
                      <div className="flex justify-between items-center p-1.5 bg-surface/50 rounded border border-transparent">
                        <span className="text-[10px] text-teal-200">Reverb</span>
                        <span className="text-[10px] text-text-muted">Hall</span>
                      </div>
                   </div>
                )}

                {node.type === 'lyrics' && (
                    <div className="space-y-2">
                        <div className="bg-surface p-2 rounded border border-border text-[10px] text-pink-200 h-16 overflow-hidden relative">
                             {node.data.lyrics ? (
                                 <span className="whitespace-pre-wrap font-sans leading-relaxed">{node.data.lyrics}</span>
                             ) : (
                                 <span className="text-text-muted italic">No lyrics generated...</span>
                             )}
                             <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-surface to-transparent"></div>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] text-text-muted">{node.data.mood || 'Mood N/A'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] text-text-muted">{node.data.topic || 'Topic N/A'}</span>
                        </div>
                    </div>
                )}

                {node.type === 'output' && (
                  <div className="space-y-2">
                    <div className="bg-surface p-2 rounded border border-border text-[10px] font-mono text-text-muted">
                      [Genre: Synthwave] [BPM: 128]
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <button className="flex items-center justify-center gap-1 py-1.5 bg-primary rounded text-[10px] font-bold hover:bg-primary-hover">
                          <Copy size={10} /> COPY
                       </button>
                       <button className="flex items-center justify-center gap-1 py-1.5 bg-surface border border-border rounded text-[10px] font-bold hover:bg-surface/80">
                          <Send size={10} /> EXPORT
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {!isLast && (
              <div className="h-8 w-0.5 bg-gradient-to-b from-border to-primary relative group">
                <button 
                  onClick={onAddNode}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 border-2 border-background z-30 shadow-lg"
                >
                  <Plus size={14} className="text-white" />
                </button>
              </div>
            )}
          </React.Fragment>
        );
      })}

      {/* End Cap */}
       <div className="mt-4 flex flex-col items-center gap-2 opacity-40">
        <div className="h-8 w-[1px] bg-gradient-to-b from-primary to-transparent"></div>
        <div className="w-3 h-3 border-2 border-white rounded-full"></div>
      </div>

    </div>
  );
};