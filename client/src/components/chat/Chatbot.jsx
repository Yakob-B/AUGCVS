import React, { useState, useRef, useEffect } from 'react';
import { MdChat, MdSend, MdClose, MdSmartToy, MdMinimize } from 'react-icons/md';
import { chatWithAI } from '../../services/ai.service';
import ReactMarkdown from 'react-markdown';

import { useAuth } from '../../contexts/AuthContext';

const Chatbot = () => {
    const { user } = useAuth(); // Get authenticated user
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

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            // Prepare context
            const userContext = {
                name: user?.firstName || 'Guest',
                role: user?.role || 'guest'
            };

            // Prepare history (excluding the very latest user message which is sent separately)
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
            {/* Chat Window */}
            <div
                className={`pointer-events-auto bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl w-full max-w-[380px] sm:w-[350px] overflow-hidden transition-all duration-300 origin-bottom-right mb-4 flex flex-col ${isOpen
                    ? 'opacity-100 scale-100 translate-y-0 h-[500px]'
                    : 'opacity-0 scale-90 translate-y-10 h-0 w-0'
                    }`}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex items-center justify-between border-b border-gray-700">
                    <div className="flex items-center space-x-2 text-white">
                        <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
                            <MdSmartToy className="text-xl text-purple-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AUGCVS Assistant</h3>
                            <p className="text-xs text-purple-200 flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
                    >
                        <MdMinimize size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 custom-scrollbar">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        components={{
                                            p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-none px-4 py-3">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-gray-900 border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type your question..."
                            className="flex-1 bg-gray-800 text-white border-transparent focus:border-purple-500 focus:ring-0 rounded-xl px-4 py-2.5 text-sm placeholder-gray-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-purple-900/20"
                        >
                            <MdSend size={18} />
                        </button>
                    </form>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-gray-500">
                            AI can make mistakes. Check important info.
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="pointer-events-auto bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg shadow-purple-600/30 transition-all duration-300 transform hover:scale-110 active:scale-95 group relative"
                >
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    <MdChat size={28} />

                    {/* Tooltip */}
                    <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Need help? Chat with us!
                    </span>
                </button>
            )}
        </div>
    );
};

export default Chatbot;
