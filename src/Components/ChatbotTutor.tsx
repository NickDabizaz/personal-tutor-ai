"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';

// Message interface definition
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Props for this component
interface ChatbotTutorProps {
  lessonTitle: string;
  lessonContent: string;
}

export default function ChatbotTutor({ lessonTitle, lessonContent }: ChatbotTutorProps) {
  // PERBAIKAN 1: Inisialisasi state dengan array kosong.
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // PERBAIKAN 2: useEffect ini akan berjalan setiap kali lessonTitle berubah,
  // memuat riwayat chat yang benar atau mereset ke pesan sapaan.
  useEffect(() => {
    const storageKey = `chat_history_${lessonTitle}`;
    try {
      if (typeof window !== "undefined") {
        const savedMessages = sessionStorage.getItem(storageKey);
        // Jika ada riwayat tersimpan, gunakan itu.
        if (savedMessages && savedMessages.length > 2) {
          setMessages(JSON.parse(savedMessages));
          return; // Hentikan eksekusi agar tidak menampilkan pesan sapaan
        }
      }
    } catch (error) {
      console.error("Failed to parse chat history from sessionStorage", error);
    }

    // Jika tidak ada riwayat, set pesan sapaan awal untuk pelajaran ini.
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I am your AI tutor. Today we are covering the lesson "${lessonTitle}". Feel free to ask any questions about this topic.`
      }
    ]);
  }, [lessonTitle]); // <-- Dependency ini adalah kuncinya!

  // useEffect untuk menyimpan chat ke sessionStorage
  useEffect(() => {
    // Hanya simpan jika sudah ada percakapan (lebih dari 1 pesan)
    // dan pastikan messages tidak kosong
    if (messages && messages.length > 1) {
      const storageKey = `chat_history_${lessonTitle}`;
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, lessonTitle]);

  // useEffect untuk auto-scroll
  useEffect(() => {
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      // Beri sedikit jeda agar DOM sempat update sebelum scroll
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 0);
    }
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add a placeholder for the AI's response while loading
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    // The lesson-specific system prompt in English
    const systemPrompt = `You are a friendly and helpful AI tutor. Your mission is to explain concepts from the lesson to the user.
    The current lesson is titled: "${lessonTitle}".
    Here is the full content of the lesson to use as your knowledge base:
    ---
    ${lessonContent}
    ---
    Always answer the user's questions within the context of this lesson. If a question is off-topic, politely remind the user to stay focused on the material. Answer clearly and concisely.`;
    
    const fullPrompt = `${systemPrompt}\n\nUser's Question: "${input}"`;

    try {
      const response = await fetch('/api/ollama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });      if (!response.body) throw new Error("Response has no body.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Process the streaming response
      let streamedContent = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;
          // Update the last message (the AI's message) in real-time
        setMessages(currentMessages => {
          const updatedMessages = [...currentMessages];
          const lastMsgIndex = updatedMessages.length - 1;
          if (updatedMessages[lastMsgIndex]?.role === 'assistant') {
              updatedMessages[lastMsgIndex] = { role: 'assistant', content: streamedContent };
          }
          return updatedMessages;
        });
      }
    } catch (error) {
      console.error("Failed to fetch API response:", error);
      setMessages(currentMessages => {
          const updatedMessages = [...currentMessages];
          const lastMsgIndex = updatedMessages.length - 1;
           if (updatedMessages[lastMsgIndex]?.role === 'assistant') {
                updatedMessages[lastMsgIndex] = { role: 'assistant', content: "Sorry, an error occurred. Please try again." };
           }
          return updatedMessages;
        });
    } finally {
      setIsLoading(false);
    }
  };return (
    <div className="flex flex-col bg-gray-900">
      {/* --- PERUBAHAN 3: Pasang ref baru di sini --- */}
      <div ref={scrollContainerRef} className="p-6 overflow-y-auto h-[60vh]">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-gray-700 text-amber-400'}`}>
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div className={`max-w-md p-4 rounded-xl text-sm ${msg.role === 'user' ? 'bg-gray-800 text-gray-200' : 'bg-gray-800 text-gray-300'}`}>
                <div className="prose prose-invert max-w-none prose-p:text-gray-300" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') + (isLoading && index === messages.length - 1 ? '...' : '') }} />
              </div>
            </div>
          ))}
          {/* Ref messagesEndRef sudah tidak diperlukan lagi */}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? "AI is thinking..." : "Ask something about this lesson..."}
            disabled={isLoading}
            className="w-full p-3 pr-12 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()} 
            className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-amber-400 hover:text-amber-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send Message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
