import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../App";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ChatIcon from "../components/ai/ChatIcon";

const FloatingChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your AI real estate assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      // Use the API_URL from the environment
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      console.log('Making chat request to:', `${API_URL}/api/chat`);
      
      const res = await axios.post(`${API_URL}/api/chat`, {
        messages: [
          { role: "system", content: "You are a helpful real estate assistant." },
          ...newMessages
        ]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process your request." }]);
    } finally {
      setLoading(false);
    }
  };

  // Function to render message content with clickable links
  const renderMessageContent = (content) => {
    if (typeof content !== 'string') return content;
    
    // Split content by lines to handle line breaks
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      // Check if line contains a property link
      const linkMatch = line.match(/View Property: (\/properties\/single\/[^\s]+)/);
      if (linkMatch) {
        const linkPath = linkMatch[1];
        const beforeLink = line.substring(0, line.indexOf('View Property:'));
        return (
          <div key={lineIndex}>
            {beforeLink}
            <button
              onClick={() => {
                navigate(linkPath, {
                  state: { fromChatbot: true, timestamp: Date.now() },
                  replace: false
                });
              }}
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer ml-1"
            >
              View Property
            </button>
            {/* Divider after each property */}
            <hr className="my-2 border-gray-300" />
          </div>
        );
      }
      return <div key={lineIndex}>{line}</div>;
    });
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-3xl shadow-xl p-4 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transform hover:scale-105 hover:shadow-blue-400/40 hover:shadow-2xl hover:animate-pulse"
          aria-label="Open AI Chatbot"
        >
          <ChatIcon size={40} />
        </button>
      )}
      {/* Floating Chatbot Widget */}
      {open && (
        <div className="fixed bottom-8 right-8 z-50 w-96 max-w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col" style={{ minHeight: 420, maxHeight: 600 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-600 rounded-t-xl">
            <span className="text-white font-bold">BuildBot</span>
            <button onClick={() => setOpen(false)} className="text-white hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-600 text-white max-w-xs" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 max-w-sm"}`}>
                  {msg.role === "assistant" ? (
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {renderMessageContent(msg.content)}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 max-w-sm text-sm animate-pulse">
                BuildBot is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything about properties..."
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot; 