import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Wifi, WifiOff, Loader2, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const TripChat = ({ tripId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'connected' | 'disconnected'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessageHistory();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessageHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/trips/${tripId}/messages/`);
      setMessages(response.data);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setError("Failed to load message history.");
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    setStatus('connecting');
    const token = localStorage.getItem('access');
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname === 'localhost' ? '127.0.0.1:8000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/chat/${tripId}/?token=${token || ''}`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected to trip chat");
        setStatus('connected');
      };

      socket.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setMessages(prev => {
            // Avoid duplicate message if already exists
            if (data.id && prev.some(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
        } catch (err) {
          console.error("Failed to parse WS message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setStatus('disconnected');
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        setStatus('disconnected');
      };
    } catch (err) {
      console.error("Error creating WebSocket connection:", err);
      setStatus('disconnected');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    setInputText('');

    // If WebSocket is connected, send through WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    } else {
      // Fallback: send via REST API
      try {
        const response = await api.post(`/trips/${tripId}/messages/`, { message: text });
        setMessages(prev => [...prev, response.data]);
      } catch (err) {
        console.error("Failed to send message via REST fallback:", err);
        alert("Failed to send message. Please check your connection.");
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-md flex flex-col h-[580px] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600/30 text-purple-300 rounded-xl border border-purple-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Live Group Chat</h3>
            <p className="text-xs text-slate-400">Real-time team communication</p>
          </div>
        </div>

        {/* Live WebSocket Status Badge */}
        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Wifi className="w-3.5 h-3.5" /> Live
            </span>
          )}
          {status === 'connecting' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Connecting...
            </span>
          )}
          {status === 'disconnected' && (
            <button 
              onClick={connectWebSocket}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold cursor-pointer transition-colors"
            >
              <WifiOff className="w-3.5 h-3.5" /> Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 space-y-4">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
            <p className="text-sm font-medium">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-10">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-700 text-base mb-1">No messages yet</h4>
            <p className="text-sm max-w-xs text-slate-400">
              Start the conversation! Say hi to your fellow trip members.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_username === currentUser?.username || msg.sender_id === currentUser?.id;
            const senderInitial = msg.sender_username ? msg.sender_username.charAt(0).toUpperCase() : '?';

            return (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${
                  isMe 
                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white' 
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {senderInitial}
                </div>

                {/* Message Content */}
                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-600">{isMe ? 'You' : msg.sender_username}</span>
                    <span className="text-[10px] text-slate-400">{formatTime(msg.timestamp)}</span>
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message to your group..."
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!inputText.trim()}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold p-3 rounded-2xl shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </form>
    </div>
  );
};

export default TripChat;
