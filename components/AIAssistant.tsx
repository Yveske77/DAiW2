import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, Image as ImageIcon, Sparkles, Loader2, Music } from 'lucide-react';
import { ChatMessage, ImageSize, NodeBlock } from '../types';
import * as geminiService from '../services/geminiService';

interface AIAssistantProps {
  onClose: () => void;
  isOpen: boolean;
  nodes: NodeBlock[];
  selectedNodeId: string | null;
  projectMeta: { name: string; bpm: number; key: string };
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, isOpen, nodes, selectedNodeId, projectMeta }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'I\'m your DAiW Creative Assistant. I can help generate prompts, analyze your arrangement, or create cover art.', timestamp: Date.now() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // Simple routing logic based on keywords
    let responseText = '';
    const lowerInput = userMsg.text.toLowerCase();

    // Construct refined context for System Instruction
    const projectStructure = nodes.map(n => {
        const isSelected = n.id === selectedNodeId;
        const selectedMarker = isSelected ? " <<< CURRENTLY FOCUSED >>>" : "";
        
        let details = "";
        // Intelligent summarization of node data
        if (n.type === 'lyrics' && n.data.lyrics) {
             details = `Topic: ${n.data.topic || 'N/A'}, Mood: ${n.data.mood || 'N/A'}\n  Lyrics Preview: "${n.data.lyrics.substring(0, 100).replace(/\n/g, ' ')}..."`;
        } else if (n.type === 'context' && n.data.prompt) {
             details = `Prompt: "${n.data.prompt}"`;
        } else if (n.type === 'genre' && n.data.genres) {
             details = `Genres: ${n.data.genres.join(', ')}`;
        } else if (n.type === 'instrument' && n.data.instruments) {
             details = `Instruments: ${n.data.instruments.join(', ')}`;
        } else if (n.type === 'effect' && n.data.effects) {
             details = `Effects: ${n.data.effects.join(', ')}`;
        } else {
             details = JSON.stringify(n.data);
        }
        
        return `- [${n.type.toUpperCase()}] ${n.name}${selectedMarker}\n  ${details}`;
    }).join('\n');

    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    let focusNote = "";
    if (selectedNode) {
        focusNote = `User is currently selecting the node: "${selectedNode.name}" of type '${selectedNode.type}'. Focus on helping with this specific component if the user asks.`;
    }

    const systemInstruction = `
You are the Creative Assistant for DAiW (Digital AI Workstation).
Your goal is to assist the user in creating music, writing prompts, and structuring songs.

PROJECT METADATA:
Name: ${projectMeta.name}
BPM: ${projectMeta.bpm}
Key: ${projectMeta.key}

CURRENT PROJECT STRUCTURE (Nodes):
${projectStructure}

${focusNote}

Provide concise, creative, and musically relevant responses. If generating prompts, adhere to the project's genre and mood.
`;

    if (lowerInput.includes('cover art') || lowerInput.includes('generate image')) {
       const imageUrl = await geminiService.generateCoverArt(userMsg.text, imageSize);
       if (imageUrl) {
         const modelMsg: ChatMessage = { 
             id: (Date.now() + 1).toString(), 
             role: 'model', 
             text: `Here is a ${imageSize} cover art concept based on your request.`,
             attachments: [{ type: 'image', url: imageUrl }],
             timestamp: Date.now() 
         };
         setMessages(prev => [...prev, modelMsg]);
         setIsProcessing(false);
         return;
       } else {
           responseText = "I couldn't generate the image at this time.";
       }
    } else if (lowerInput.includes('lyric') || lowerInput.includes('write a song')) {
       // Extract context from nodes
       const genreNode = nodes.find(n => n.type === 'genre');
       const detectedGenre = genreNode?.data?.genres?.[0] || 'Pop';
       
       const selectedNode = nodes.find(n => n.id === selectedNodeId);
       const lyricNode = (selectedNode?.type === 'lyrics' ? selectedNode : nodes.find(n => n.type === 'lyrics'));
       
       // If input is short (generic command), try to use node data, otherwise use input as topic
       const topic = (lowerInput.length < 30 && lyricNode?.data?.topic) 
           ? lyricNode.data.topic 
           : userMsg.text;
       
       const mood = lyricNode?.data?.mood || 'Creative';

       responseText = await geminiService.generateLyrics(topic, detectedGenre, mood);

    } else if (lowerInput.includes('analyze') || lowerInput.includes('review')) {
       responseText = await geminiService.generateAnalysis(userMsg.text, systemInstruction);
    } else {
       responseText = await geminiService.generateCreativeSuggestion(userMsg.text, systemInstruction);
    }

    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsProcessing(false);
  };

  const handleMicClick = async () => {
    if (isListening) return; // Simple toggle prevention
    setIsListening(true);
    
    // In a real app, we would use MediaRecorder API here
    // Simulating recording and transcription for demo
    try {
        // Request mic access just to trigger browser permission prompt as per requirement
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Simulate a delay then "transcribe"
        setTimeout(async () => {
             // Stop tracks
             stream.getTracks().forEach(track => track.stop());
             
             setIsListening(false);
             const simulatedTranscription = "Add a cinematic swell leading into the drop with a cyberpunk atmosphere.";
             setInput(simulatedTranscription);
        }, 2000);
    } catch (e) {
        console.error("Mic error", e);
        setIsListening(false);
        alert("Microphone access denied or not available.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-6 right-6 w-96 bg-surface border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
      {/* Header */}
      <div className="p-3 border-b border-border bg-surface-light flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-white">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-background/95 backdrop-blur-sm">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`
              max-w-[85%] rounded-lg p-3 text-xs leading-relaxed
              ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface-light text-text-muted border border-border'}
            `}>
              {msg.text}
            </div>
            {msg.attachments && msg.attachments.map((att, i) => (
                <div key={i} className="mt-2 rounded-lg overflow-hidden border border-border">
                    <img src={att.url} alt="Generated" className="w-full h-auto object-cover" />
                </div>
            ))}
          </div>
        ))}
        {isProcessing && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
                <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
            </div>
        )}
        {isListening && (
            <div className="flex items-center gap-2 text-red-400 text-xs animate-pulse">
                <Mic className="w-3 h-3" /> Listening...
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Options */}
      {showImageOptions && (
          <div className="px-4 py-2 bg-surface-light border-t border-border flex gap-2">
              {(['1K', '2K', '4K'] as ImageSize[]).map(size => (
                  <button 
                    key={size}
                    onClick={() => setImageSize(size)}
                    className={`text-[10px] px-2 py-1 rounded border ${imageSize === size ? 'bg-primary border-primary text-white' : 'bg-surface border-border text-text-muted'}`}
                  >
                      {size}
                  </button>
              ))}
          </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-surface-light">
        <div className="flex items-center gap-2 relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for ideas, visuals, or analysis..."
            className="flex-1 bg-surface border border-border rounded-lg pl-3 pr-10 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/50"
          />
          <div className="flex gap-1">
             <button 
                onClick={() => setShowImageOptions(!showImageOptions)}
                className={`p-1.5 rounded hover:bg-surface-light ${showImageOptions ? 'text-primary' : 'text-text-muted'}`}
                title="Image Generation Settings"
             >
                <ImageIcon size={14} />
             </button>
             <button 
                onClick={handleMicClick}
                className={`p-1.5 rounded hover:bg-surface-light ${isListening ? 'text-red-400' : 'text-text-muted'}`}
                title="Voice Input (Gemini Flash)"
             >
                <Mic size={14} />
             </button>
             <button 
                onClick={handleSend}
                disabled={isProcessing}
                className="p-1.5 rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-50"
             >
                <Send size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};