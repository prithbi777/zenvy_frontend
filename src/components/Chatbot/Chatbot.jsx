import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Minus, Bot, User, Sparkles } from 'lucide-react';
import apiService from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Chatbot.css';

const Chatbot = () => {
    const { isAuthenticated, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([
        {
            role: 'assistant',
            content: `Hello! I'm your AI assistant for Zenvy. How can I help you today?`,
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading || !isAuthenticated) return;

        const userMessage = message.trim();
        setMessage('');
        setHistory((prev) => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await apiService.sendMessage(userMessage, history.slice(1));
            setHistory((prev) => [
                ...prev,
                { role: 'assistant', content: response.response },
            ]);
        } catch (error) {
            console.error('Chat error:', error);
            setHistory((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        setHistory([
            {
                role: 'assistant',
                content: `Hello ${user?.name || ''}! I'm your AI assistant for Zenvy. How can I help you today?`,
            },
        ]);
    };

    if (!isAuthenticated) return null;

    return (
        <div className="chatbot-container">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="chatbot-toggle-btn group"
                    aria-label="Open support chat"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300">
                        <MessageCircle className="w-7 h-7" />
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window shadow-2xl overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="chatbot-header bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Assistant</h3>
                                <p className="text-[10px] opacity-80 uppercase tracking-wider">Zenvy Support</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearHistory}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                title="Clear history"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0c10] custom-scrollbar">
                        {history.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                                            : 'bg-[#1a1c23] text-gray-200 border border-white/5 rounded-tl-none'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1a1c23] p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-[#0f1117] border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full bg-[#1a1c23] text-white text-[13px] border border-transparent focus:border-indigo-500/50 rounded-xl px-4 py-3 pr-12 focus:outline-none transition-all placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:bg-gray-700 transition-all shadow-lg shadow-indigo-600/20"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
