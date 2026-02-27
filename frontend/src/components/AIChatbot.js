import React, { useState, useRef, useEffect, useCallback } from "react";
import api from "../api";
import "./AIChatbot.css";

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingText, setTypingText] = useState("typing");
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const typingIntervalRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "student";
    const userName = user.name || "User";

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    // Animated typing dots
    useEffect(() => {
        if (isTyping) {
            let dotCount = 0;
            typingIntervalRef.current = setInterval(() => {
                dotCount = (dotCount + 1) % 4;
                setTypingText("typing" + ".".repeat(dotCount));
            }, 400);
        } else {
            clearInterval(typingIntervalRef.current);
            setTypingText("typing");
        }
        return () => clearInterval(typingIntervalRef.current);
    }, [isTyping]);

    // Initialize welcome message
    useEffect(() => {
        const greeting = getGreeting();
        const welcomeMsg = userRole === "college"
            ? `${greeting}, ${userName}! 👋\n\nI'm your **College Dashboard Assistant**. I can help with:\n\n• 📊 Student directory & statistics\n• 💼 Job listings & placement data\n• 📝 CAF form management\n• 🤖 Resume analysis for students\n\nHow can I assist you today?`
            : `${greeting}, ${userName}! 👋\n\nI'm your **Career Assistant**. I'm here to help with:\n\n• 💼 Finding jobs & internships\n• 📄 Resume analysis (ATS scoring)\n• 🗺️ Career roadmaps & guidance\n• 📅 Hackathons & events\n• 📥 Resume templates\n\nWhat would you like to explore?`;

        setMessages([{ role: "bot", content: welcomeMsg, time: new Date(), status: "delivered" }]);
    }, [userRole, userName]);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // Track unread when closed
    useEffect(() => {
        if (isOpen) {
            setUnreadCount(0);
            setHasNewMessage(false);
        }
    }, [isOpen]);

    const addBotMessage = (content) => {
        setMessages(prev => [...prev, { role: "bot", content, time: new Date(), status: "delivered" }]);
        if (!isOpen) {
            setUnreadCount(prev => prev + 1);
            setHasNewMessage(true);
        }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage, time: new Date(), status: "sent" }]);
        setInput("");

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        // Mark user message as "delivered" after a short delay
        setTimeout(() => {
            setMessages(prev => prev.map((msg, i) =>
                i === prev.length - 1 && msg.role === "user" ? { ...msg, status: "delivered" } : msg
            ));
        }, 300);

        // Show "seen" after a bit
        setTimeout(() => {
            setMessages(prev => prev.map((msg, i) =>
                i === prev.length - 1 && msg.role === "user" ? { ...msg, status: "seen" } : msg
            ));
        }, 800);

        // Start typing indicator with realistic delay
        setTimeout(() => {
            setIsTyping(true);
        }, 1000);

        try {
            const response = await api.post("/chatbot/ask", {
                message: userMessage,
                role: userRole,
                userId: user.id
            });

            // Variable typing delay based on response length for realism
            const replyLength = response.data.reply.length;
            const typingDelay = Math.min(1200 + (replyLength * 8), 3500);

            setTimeout(() => {
                setIsTyping(false);
                addBotMessage(response.data.reply);
            }, typingDelay);
        } catch (err) {
            setTimeout(() => {
                setIsTyping(false);
                addBotMessage("I'm having trouble connecting right now. Please try again in a moment. 🔄");
            }, 1500);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = (action) => {
        setInput(action);
        setTimeout(() => {
            handleSend();
        }, 100);
    };

    // Auto-resize textarea
    const handleInputChange = (e) => {
        setInput(e.target.value);
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + "px";
    };

    const handleDownloadResume = async (template) => {
        try {
            const response = await api.get(`/chatbot/download-resume?template=${template}`, {
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${template}_resume_template.html`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            addBotMessage(`✅ Your **${template}** resume template has been downloaded! Open it in a browser and use **Ctrl+P** to save as PDF.`);
        } catch (err) {
            addBotMessage("❌ Failed to download the resume template. Please try again.");
        }
    };

    const formatMessage = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>")
            .replace(/• /g, "&#8226; ");
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "sent": return "✓";
            case "delivered": return "✓✓";
            case "seen": return "✓✓";
            default: return "";
        }
    };

    const quickActions = userRole === "college"
        ? [
            { label: "📊 Stats", action: "Show me student statistics" },
            { label: "💼 Jobs", action: "Show current job listings" },
            { label: "📝 CAF", action: "Tell me about CAF forms" },
            { label: "ℹ️ Help", action: "How does this system work?" }
        ]
        : [
            { label: "💼 Jobs", action: "Show me the latest job openings" },
            { label: "📅 Events", action: "What hackathons are coming up?" },
            { label: "📥 Resume", action: "I want to download a resume template" },
            { label: "🗺️ Career", action: "Suggest a career roadmap for me" },
            { label: "💡 Tips", action: "Give me resume tips for ATS" }
        ];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className={`chatbot-fab ${isOpen ? "open" : ""} ${hasNewMessage && !isOpen ? "pulse" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Assistant"
            >
                {isOpen ? "✕" : "💬"}
                {unreadCount > 0 && !isOpen && (
                    <span className="unread-badge">{unreadCount}</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar-wrapper">
                                <span className="chatbot-avatar">🤖</span>
                                <span className="online-indicator"></span>
                            </div>
                            <div>
                                <h4>Hack-2-Hire AI</h4>
                                <p className="chatbot-status">
                                    {isTyping ? (
                                        <span className="typing-status">{typingText}</span>
                                    ) : (
                                        <span><span className="status-dot"></span> Online</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    {/* Quick Actions */}
                    <div className="chatbot-quick-actions">
                        {quickActions.map((qa, i) => (
                            <button key={i} className="quick-action-btn" onClick={() => handleQuickAction(qa.action)}>
                                {qa.label}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-message ${msg.role} msg-animate`}>
                                {msg.role === "bot" && <span className="msg-avatar">🤖</span>}
                                <div className="msg-bubble">
                                    <div
                                        className="msg-text"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                    />
                                    {/* Resume Download Buttons */}
                                    {msg.content.includes("download") && msg.content.includes("resume") && msg.role === "bot" && msg.content.includes("template") && (
                                        <div className="resume-download-btns">
                                            <button onClick={() => handleDownloadResume("professional")}>📄 Professional</button>
                                            <button onClick={() => handleDownloadResume("modern")}>🎨 Modern</button>
                                            <button onClick={() => handleDownloadResume("minimal")}>✨ Minimal</button>
                                        </div>
                                    )}
                                    <div className="msg-footer">
                                        <span className="msg-time">
                                            {msg.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                        {msg.role === "user" && (
                                            <span className={`msg-status ${msg.status}`}>
                                                {getStatusIcon(msg.status)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {msg.role === "user" && <span className="msg-avatar user-avatar">👤</span>}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-message bot msg-animate">
                                <span className="msg-avatar">🤖</span>
                                <div className="msg-bubble typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={!input.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;
