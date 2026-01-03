import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdSend, MdClose, MdSmartToy, MdMinimize } from 'react-icons/md';
import { chatWithAI } from '../../services/ai.service';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../contexts/AuthContext';

const Chatbot = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I am the AUGCVS System Assistant. I can help you with questions about verification procedures, required documents, and checking your status. How can I assist you today?'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue('');

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const userContext = {
                name: user?.firstName || 'Guest',
                role: user?.role || 'guest'
            };

            const history = messages.map(msg => ({
                sender: msg.role,
                text: msg.content
            }));

            const response = await chatWithAI(userMessage, history, userContext);
            const aiMessage = response.data.response;

            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I apologize, but I am having trouble connecting right now. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="pointer-events-auto standard-chat-surface rounded-2xl w-full max-w-[380px] sm:w-[350px] overflow-hidden mb-4 flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3 text-white">
                                <div className="bg-white/20 p-2 rounded-full relative">
                                    <MdSmartToy className="text-xl text-white" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-indigo-600"></span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">AUGCVS Support</h3>
                                    <p className="text-[10px] text-white/70">Typical response time: <span className="font-bold text-white">1m</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all"
                            >
                                <MdMinimize size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-gray-50 dark:bg-gray-900/50">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user'
                                            ? 'message-bubble-standard-user'
                                            : 'message-bubble-standard-bot'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                                    a: ({ node, ...props }) => <a className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-1 space-y-0.5" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-1 space-y-0.5" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}
                                        <div className={`text-[9px] mt-1.5 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="message-bubble-standard-bot px-4 py-3 rounded-2xl">
                                        <div className="flex space-x-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-full px-5 py-2.5 text-sm outline-none transition-all placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all active:scale-90"
                                >
                                    <MdSend size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto bg-indigo-600 text-white p-4 rounded-full shadow-xl relative group"
                >
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    <MdChat size={28} />
                    <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-[11px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Chat with us
                    </span>
                </motion.button>
            )}

        </div>
    );
};

export default Chatbot;
