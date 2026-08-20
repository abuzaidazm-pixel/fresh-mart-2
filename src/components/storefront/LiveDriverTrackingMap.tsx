'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  Zap,
  Truck,
  CheckCircle2,
  X,
  Send,
  Star,
  Sparkles,
} from 'lucide-react';

interface LiveDriverTrackingMapProps {
  orderNumber: string;
  customerName: string;
  destinationAddress: string;
  orderStatus: string;
}

export default function LiveDriverTrackingMap({
  orderNumber,
  customerName,
  destinationAddress,
  orderStatus,
}: LiveDriverTrackingMapProps) {
  // Driver animation state (0% to 100% along the path)
  const [driverProgress, setDriverProgress] = useState(35); // starts at 35% on route
  const [speed, setSpeed] = useState(28);
  const [remainingDist, setRemainingDist] = useState(1.4); // km
  const [etaMinutes, setEtaMinutes] = useState(12);

  // Call & Chat Modal State
  const [isCallingModalOpen, setIsCallingModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Namaste! I have picked up your fresh groceries from FreshMart hub and am on the way.' },
    { sender: 'driver', text: 'All chilled items are secured in insulated thermal bags.' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Animate driver moving smoothly along the road
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverProgress(prev => {
        if (prev >= 88) return 88; // stay near destination
        return prev + 1.2;
      });

      setRemainingDist(prev => Math.max(0.2, Number((prev - 0.04).toFixed(2))));
      setEtaMinutes(prev => Math.max(2, Math.round(prev - 0.15)));
      setSpeed(Math.floor(24 + Math.random() * 8));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    // Simulate auto-reply from driver
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'driver',
          text: 'Got it! I am arriving near your building in 5-8 minutes. Will call when at the gate.',
        },
      ]);
    }, 1500);
  };

  // Calculate driver coordinate on SVG bezier curve (approximate)
  const driverX = 18 + (driverProgress / 100) * 65; // percentage
  const driverY = 35 + Math.sin((driverProgress / 100) * Math.PI * 2) * 18; // percentage

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-5 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="font-black text-lg text-slate-900">
              Live Delivery GPS & Driver Location
            </h3>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              LIVE RADAR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS coordinates of your delivery partner on Google Maps grid
          </p>
        </div>

        {/* ETA Widget */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl self-start sm:self-auto">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
            <Clock className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
              Estimated Arrival
            </div>
            <div className="text-sm font-black text-emerald-950">
              {etaMinutes} - {etaMinutes + 3} Minutes ({remainingDist} km away)
            </div>
          </div>
        </div>
      </div>

      {/* Live Map Canvas */}
      <div
        className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xl"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 80%),
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px',
        }}
      >
        {/* Animated Polyline Route */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Road background glow */}
          <path
            d="M 120 180 Q 280 80 440 220 T 780 180"
            stroke="#1e293b"
            strokeWidth="20"
            fill="none"
            strokeLinecap="round"
          />

          {/* Primary Route Path */}
          <path
            d="M 120 180 Q 280 80 440 220 T 780 180"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Animated dashes indicating traffic direction */}
          <path
            d="M 120 180 Q 280 80 440 220 T 780 180"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="10 15"
            fill="none"
            className="animate-pulse"
          />
        </svg>

        {/* 1. STORE HUB PIN */}
        <div className="absolute left-[15%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-slate-800/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-slate-700 whitespace-nowrap mb-1">
            🏬 FreshMart Hub
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shadow-2xl">
            <span className="text-xs">🏬</span>
          </div>
        </div>

        {/* 2. LIVE MOVING DRIVER SCOOTER PIN */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-1000 ease-linear z-20"
          style={{ left: `${driverX}%`, top: `${driverY}%` }}
        >
          {/* Radar Ripple Effect */}
          <div className="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping pointer-events-none"></div>

          {/* Driver Tag */}
          <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-xl shadow-2xl whitespace-nowrap mb-1 flex items-center gap-1.5 border border-blue-400 animate-bounce">
            <span>🛵</span>
            <span>Ramesh (Driver) • {speed} km/h</span>
          </div>

          {/* Scooter Icon Circle */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center border-2 border-white shadow-2xl">
            <Navigation className="w-5 h-5 transform rotate-45" />
          </div>
        </div>

        {/* 3. CUSTOMER DESTINATION PIN */}
        <div className="absolute left-[84%] top-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
          <div className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-xl shadow-2xl whitespace-nowrap mb-1 border border-emerald-400">
            📍 Your Home
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-2xl">
            <MapPin className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Live Telemetry Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 text-white text-xs space-y-1 shadow-2xl max-w-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
            <Zap className="w-3.5 h-3.5" />
            <span>GPS Tracking Active (Refresh: 2s)</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Delivering to: <span className="font-bold text-white">{destinationAddress}</span>
          </div>
        </div>
      </div>

      {/* Driver Partner Contact Card */}
      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-md relative overflow-hidden border-2 border-emerald-400">
            RK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Ramesh Kumar</h4>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                Verified Express Partner
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="flex items-center text-amber-500 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                4.9 (1,480+ deliveries)
              </span>
              <span>•</span>
              <span className="font-mono text-slate-700 font-bold">Hero EV (MH-02-EE-4521)</span>
            </div>
          </div>
        </div>

        {/* Call & Chat Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCallingModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Call Driver (Ramesh)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsChatModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Chat Live</span>
          </button>
        </div>
      </div>

      {/* POPUP 1: Driver Call Simulator Modal */}
      {isCallingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-slate-800 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-emerald-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-2xl border-4 border-emerald-400/40 animate-pulse">
              RK
            </div>

            <div>
              <h3 className="text-xl font-black">Ramesh Kumar</h3>
              <p className="text-xs text-emerald-400 font-bold mt-0.5">Calling Express Partner...</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">+91 98201 45678 (Masked)</p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-2xl text-xs text-slate-300">
              &ldquo;Connecting your call securely with zero number sharing.&rdquo;
            </div>

            <button
              type="button"
              onClick={() => setIsCallingModalOpen(false)}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-xs shadow-lg transition-all"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* POPUP 2: Live Driver Chat Modal */}
      {isChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl border border-slate-100 flex flex-col h-[480px] animate-slide-up">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  RK
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">Ramesh Kumar</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Online • En route with your order</div>
                </div>
              </div>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type instruction (e.g. Leave with guard)..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
