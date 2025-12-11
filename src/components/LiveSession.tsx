
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useStore, getColorClass } from '../context/StoreContext';
import { Mic, MicOff, PhoneOff, Waveform } from 'lucide-react';

interface Props {
    onClose: () => void;
}

const LiveSession: React.FC<Props> = ({ onClose }) => {
    const { themeColor, user } = useStore();
    const [isConnected, setIsConnected] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [status, setStatus] = useState("Connecting...");
    
    // Refs for audio handling
    const videoRef = useRef<HTMLVideoElement>(null); // For future video support
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null); // To store the session promise/object
    
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    useEffect(() => {
        startSession();
        return () => stopSession();
    }, []);

    const startSession = async () => {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            setStatus("API Key Missing");
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey });
            
            // Audio Context Setup
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = audioCtx;
            const outputNode = audioCtx.createGain();
            outputNode.connect(audioCtx.destination);

            // Input Stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            // Input Processing
            const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                // Send data if session is active
                if (sessionRef.current) {
                    sessionRef.current.then((session: any) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Establish Connection
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnected(true);
                        setStatus("Live");
                        console.log("Live Session Connected");
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Audio Output
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            setIsTalking(true);
                            nextStartTime = Math.max(nextStartTime, audioCtx.currentTime);
                            const audioBuffer = await decodeAudioData(
                                decode(base64Audio),
                                audioCtx,
                                24000,
                                1
                            );
                            const source = audioCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                sources.delete(source);
                                if (sources.size === 0) setIsTalking(false);
                            });
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        
                        // Handle Interruption
                        if (message.serverContent?.interrupted) {
                            sources.forEach(s => { s.stop(); });
                            sources.clear();
                            nextStartTime = 0;
                            setIsTalking(false);
                        }
                    },
                    onclose: () => {
                        setIsConnected(false);
                        setStatus("Disconnected");
                    },
                    onerror: (e) => {
                        console.error("Live API Error", e);
                        setStatus("Error");
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: `You are an encouraging study companion for ${user.name}. Keep responses concise and helpful.`,
                },
            });
            
            sessionRef.current = sessionPromise;

        } catch (e) {
            console.error("Setup Error", e);
            setStatus("Connection Failed");
        }
    };

    const stopSession = () => {
        if (sessionRef.current) {
            sessionRef.current.then((s: any) => s.close());
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };

    // --- Helpers ---
    function createBlob(data: Float32Array) {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        const binary = encode(new Uint8Array(int16.buffer));
        return {
            data: binary,
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    function encode(bytes: Uint8Array) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function decode(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 text-center relative overflow-hidden shadow-2xl border border-white/10">
                {/* Visualizer BG */}
                {isConnected && (
                    <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                        <div className={`w-64 h-64 rounded-full ${getColorClass(themeColor, 'bg')} ${isTalking ? 'animate-ping' : ''}`}></div>
                    </div>
                )}

                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Live Session</h3>
                    <p className={`text-sm font-medium uppercase tracking-widest mb-8 ${isConnected ? 'text-green-500' : 'text-slate-500'}`}>
                        {status}
                    </p>

                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isTalking ? 'scale-110 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'scale-100'} bg-slate-100 dark:bg-slate-800`}>
                        {isTalking ? <Waveform size={48} className="text-indigo-500 animate-pulse" /> : <Mic size={40} className="text-slate-400" />}
                    </div>

                    <div className="flex justify-center gap-6">
                        <button className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <MicOff size={24} />
                        </button>
                        <button onClick={onClose} className="p-4 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors shadow-lg">
                            <PhoneOff size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSession;
