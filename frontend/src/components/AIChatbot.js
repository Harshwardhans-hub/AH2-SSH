import React, { useState, useRef, useEffect } from "react";
import api from "../api";
import "./AIChatbot.css";

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "student";
    const userName = user.name || "User";

    // Initialize with welcome message based on role
    useEffect(() => {
        const welcomeMsg = userRole === "college"
            ? `Hello ${userName}! 👋 I'm your **College Dashboard Assistant**. I can help you with:\n\n• 📊 View student directory & stats\n• 💼 Post or manage job listings\n• 📅 Browse upcoming events & hackathons\n• 📄 Manage documents\n• ℹ️ System information\n\nHow can I assist you today?`
            : `Hello ${userName}! 👋 I'm your **Career Assistant**. I can help you with:\n\n• 💼 Find jobs & internships\n• 📄 Analyze your resume (ATS score)\n• 🗺️ Career roadmaps & guidance\n• 📅 Upcoming hackathons & events\n• 📥 Download sample resumes\n• ℹ️ System information\n\nWhat would you like to explore?`;

        setMessages([{ role: "bot", content: welcomeMsg, time: new Date() }]);
    }, [userRole, userName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const addBotMessage = (content) => {
        setMessages(prev => [...prev, { role: "bot", content, time: new Date() }]);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMessage, time: new Date() }]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await api.post("/chatbot/ask", {
                message: userMessage,
                role: userRole,
                userId: user.id
            });

            setTimeout(() => {
                setIsTyping(false);
                addBotMessage(response.data.reply);
            }, 500 + Math.random() * 800);
        } catch (err) {
            setIsTyping(false);
            addBotMessage("Sorry, I encountered an error. Please try again. 🔄");
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
            const fakeEvent = { key: "Enter", shiftKey: false, preventDefault: () => { } };
            handleKeyDown(fakeEvent);
        }, 100);
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
            addBotMessage(`✅ Your **${template}** resume template has been downloaded!`);
        } catch (err) {
            addBotMessage("❌ Failed to download the resume template. Please try again.");
        }
    };

    const formatMessage = (text) => {
        // Simple markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br/>")
            .replace(/• /g, "&#8226; ");
    };

    const quickActions = userRole === "college"
        ? [
            { label: "📊 Student Stats", action: "Show me student statistics" },
            { label: "💼 Job Listings", action: "Show current job listings" },
            { label: "📅 Events", action: "What events are coming up?" },
            { label: "ℹ️ System Help", action: "How does this system work?" }
        ]
        : [
            { label: "💼 Find Jobs", action: "Show me the latest job openings" },
            { label: "📅 Events", action: "What hackathons are coming up?" },
            { label: "📥 Resume Templates", action: "I want to download a resume template" },
            { label: "🗺️ Career Roadmap", action: "Suggest a career roadmap for me" },
            { label: "📄 Resume Tips", action: "Give me resume tips for ATS" }
        ];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className={`chatbot-fab ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Assistant"
            >
                {isOpen ? "✕" : "🤖"}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <span className="chatbot-avatar">🤖</span>
                            <div>
                                <h4>Hack-2-Hire AI Assistant</h4>
                                <p className="chatbot-status">
                                    {userRole === "college" ? "College Dashboard" : "Student Dashboard"} • Online
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
                            <div key={i} className={`chat-message ${msg.role}`}>
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
                                    <span className="msg-time">
                                        {msg.time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                                {msg.role === "user" && <span className="msg-avatar user-avatar">👤</span>}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-message bot">
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
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your question..."
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
