import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Check, CheckCheck } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { User } from '../types';
import * as api from '../services/api';

interface ChatModalProps {
  groupId: string;
  groupName: string;
  currentUser: User;
  onClose: () => void;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  edited?: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({ groupId, groupName, currentUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number>();

  // Scroll a último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar mensajes históricos
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await api.request(`/messages/group/${groupId}`, { method: 'GET' });
        setMessages(response || []);
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [groupId]);

  // Conectar a Socket.IO
  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
    const socket = io(socketUrl, {
      path: '/socket.io'
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('register-user', currentUser.id);
      socket.emit('join-group', groupId);
    });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user-typing', (data: { userId: string; userName: string }) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => new Set(prev).add(data.userName));
      }
    });

    socket.on('user-stopped-typing', (data: { userId: string; userName: string }) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userName);
          return next;
        });
      }
    });

    socket.on('message-error', (data: { error: string }) => {
      console.error('Message error:', data.error);
    });

    return () => {
      socket.emit('leave-group', groupId);
      socket.disconnect();
    };
  }, [groupId, currentUser.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !socketRef.current) return;

    setIsSending(true);
    const messageText = inputValue.trim();
    setInputValue('');

    try {
      socketRef.current.emit('send-message', {
        groupId,
        content: messageText,
        userName: currentUser.name,
        userAvatar: currentUser.avatar
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setInputValue(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { groupId, userName: currentUser.name });

      // Limpiar timeout anterior
      clearTimeout(typingTimeoutRef.current);

      // Establecer nuevo timeout
      typingTimeoutRef.current = window.setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit('stop-typing', { groupId, userName: currentUser.name });
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[600px] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col border border-slate-100 dark:border-slate-800">

        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-900">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">💬 {groupName}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Chat del grupo</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] dark:bg-slate-950 relative">
          {/* Fondo estilo WhatsApp (Sutil) */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none grayscale invert dark:invert-0" style={{ backgroundImage: 'url("https://w7.pngwing.com/pngs/415/703/png-transparent-whatsapp-social-media-message-computer-icons-design-text-black-whatsapp-pattern-thumbnail.png")', backgroundSize: '400px' }}></div>

          <div className="relative z-10 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">No hay mensajes aún</p>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-1 italic">¡Di hola al grupo!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isMe = message.userId === currentUser.id;
                  return (
                    <div
                      key={message.id || Math.random()}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div className={`flex items-start max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isMe && (
                          <div className="flex-shrink-0 mr-2 mt-1">
                            <img
                              src={message.userAvatar || `https://ui-avatars.com/api/?name=${message.userName}&background=random`}
                              alt={message.userName}
                              className="w-8 h-8 rounded-full border border-white dark:border-slate-800 shadow-sm object-cover"
                            />
                          </div>
                        )}

                        {/* Burbuja */}
                        <div
                          className={`relative px-3 py-1.5 rounded-xl shadow-sm ${isMe
                              ? 'bg-[#dcf8c6] dark:bg-emerald-900 text-slate-800 dark:text-slate-100 rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                            }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mb-0.5">
                              {message.userName}
                            </p>
                          )}

                          <div className="flex items-end justify-between gap-4">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap pb-1">
                              {message.content}
                            </p>
                            <div className="flex items-center space-x-0.5 mb-[-2px]">
                              <span className={`text-[9px] min-w-fit ${isMe ? 'text-emerald-700/60 dark:text-emerald-300/60' : 'text-slate-400'}`}>
                                {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isMe && (
                                <CheckCheck size={13} className="text-blue-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {typingUsers.size > 0 && (
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-3 py-1 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-bold italic w-fit">
                    <span>{Array.from(typingUsers).join(', ')} está escribiendo...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="flex items-end space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onInput={handleTyping}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputValue.trim()}
              className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
