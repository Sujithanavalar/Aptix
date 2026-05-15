import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Anchor } from 'lucide-react';
import './BoatsChatbot.css';

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

type MessageType = 'bot' | 'user';

interface Message {
  id: string;
  type: MessageType;
  content: React.ReactNode; 
}

interface Option {
  label: string;
  nextStep: string;
  variant?: 'default' | 'back'; 
}

interface LogicNode {
  text: React.ReactNode;
  options: Option[];
}

interface ChatLogic {
  [key: string]: LogicNode;
}

// ==========================================
// 2. THE CHATBOT BRAIN (BOATS & STREAMS)
// Sources:
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Boats & Streams Assistant</b>.
        <br /><br />
        I can help you calculate speed in still water, stream velocity, and effective speeds.
        <br /><br />
        Where shall we start?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (20km)", nextStep: "example_intro" },
      { label: "🤔 Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts of Flowing Water:</b>
        <br /><br />
        1. <b>Downstream:</b> Moving <i>with</i> the flow. The water pushes the boat, increasing speed.
        <br />
        <span className="math-highlight">Speed = Boat + Stream</span>
        <br /><br />
        2. <b>Upstream:</b> Moving <i>against</i> the flow. The water resists, decreasing speed.
        <br />
        <span className="math-highlight">Speed = Boat - Stream</span>
      </>
    ),
    options: [
      { label: "Show Calculation Formulas", nextStep: "formulas" },
      { label: "See an Example", nextStep: "example_intro" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential Formulas:</b>
        <br />
        (Let <b>b</b> = Boat Speed, <b>s</b> = Stream Speed)
        <br /><br />
        <b>1. Effective Speeds:</b>
        <ul className="bot-list">
          <li>Downstream (D) = b + s</li>
          <li>Upstream (U) = b - s</li>
        </ul>
        <b>2. Finding Individual Speeds:</b>
        <ul className="bot-list">
          <li>Boat Speed (b) = (D + U) / 2</li>
          <li>Stream Speed (s) = (D - U) / 2</li>
        </ul>
      </>
    ),
    options: [
      { label: "Apply to Example", nextStep: "example_intro" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the problem from your notes:
        <div className="problem-box">
          A boat travels <b>20 km downstream in 2 hours</b> and <b>upstream in 4 hours</b>. Find the speed of the boat and the stream.
        </div>
        Shall we solve this step-by-step?
      </>
    ),
    options: [
      { label: "Step 1: Find Rates", nextStep: "step1" },
      { label: "Just show answer", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Calculate Up & Down Speeds</b>
        <br />
        Speed = Distance / Time
        <br /><br />
        • <b>Downstream Speed (D):</b>
        <br />
        20 km / 2 hrs = <b>10 km/h</b>
        <br /><br />
        • <b>Upstream Speed (U):</b>
        <br />
        20 km / 4 hrs = <b>5 km/h</b>
      </>
    ),
    options: [
      { label: "Step 2: Find Boat Speed", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Calculate Boat Speed</b>
        <br />
        Using Formula: <i>b = (D + U) / 2</i>
        <br /><br />
        b = (10 + 5) / 2
        <br />
        b = 15 / 2
        <br />
        <b>Boat Speed = 7.5 km/h</b>
      </>
    ),
    options: [
      { label: "Step 3: Find Stream Speed", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Calculate Stream Speed</b>
        <br />
        Using Formula: <i>s = (D - U) / 2</i>
        <br /><br />
        s = (10 - 5) / 2
        <br />
        s = 5 / 2
        <br />
        <b>Stream Speed = 2.5 km/h</b>
      </>
    ),
    options: [
      { label: "Solve another doubt", nextStep: "doubts" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  answer: {
    text: (
      <>
        <b>Solution:</b>
        <br />
        Downstream = 20/2 = 10 km/h
        <br />
        Upstream = 20/4 = 5 km/h
        <br /><br />
        Boat = (10+5)/2 = <b>7.5 km/h</b>
        <br />
        Stream = (10-5)/2 = <b>2.5 km/h</b>
      </>
    ),
    options: [
      { label: "Explain steps", nextStep: "step1" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- DOUBTS BRANCH (Specific Arising Questions) ---
  doubts: {
    text: "Select a common confusion point:",
    options: [
      { label: "Why do we add/subtract speed?", nextStep: "doubt_effective" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  doubt_effective: {
    text: (
      <>
        <b>Why add or subtract?</b>
        <br /><br />
        Think of walking on a moving walkway.
        <br />
        • Walking <b>with</b> it makes you faster (Add speeds).
        <br />
        • Walking <b>against</b> it slows you down (Subtract speeds).
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const BoatsChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, currentOptions, isOpen]);

  // Close chat if clicked outside
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (isOpen && 
              chatContainerRef.current && 
              !chatContainerRef.current.contains(event.target as Node) &&
              !(event.target as Element).closest('.chat-launcher')) {
              setIsOpen(false);
          }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      processStep('start');
    }
  }, [isOpen]);

  const processStep = (stepKey: string) => {
    const stepData = CHAT_FLOW[stepKey];
    if (!stepData) return;

    // Clear options
    setCurrentOptions([]);
    
    // Show typing
    setIsTyping(true);

    // Simulate delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Add Bot Message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content: stepData.text,
        },
      ]);

      // Set new options
      if (stepData.options) {
          setCurrentOptions(stepData.options);
      }
    }, 600);
  };

  const handleOptionClick = (option: Option) => {
    // Add User Message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'user',
        content: option.label,
      },
    ]);
    
    processStep(option.nextStep);
  };

  const handleRefresh = () => {
    setMessages([]);
    setCurrentOptions([]);
    processStep('start');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
        {/* --- LAUNCHER --- */}
        <button 
            className="chat-launcher" 
            onClick={toggleChat}
            aria-label="Open Boats Assistant"
        >
            {isOpen ? (
                <X size={28} />
            ) : (
                <Anchor size={28} />
            )}
        </button>

        {/* --- CHAT WINDOW --- */}
        <div className={`chat-container ${isOpen ? '' : 'hidden'}`} ref={chatContainerRef}>
            <div className="chat-header">
                <div className="header-title">
                    <Anchor size={18} /> Boats Assistant
                </div>
                <div className="header-controls">
                    <button onClick={handleRefresh} title="Reset Conversation">
                        <RefreshCw size={16} />
                    </button>
                    <button onClick={toggleChat} title="Minimize">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div id="chat-body" className="chat-body" ref={chatBodyRef}>
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`msg ${msg.type}`}
                    >
                        {msg.content}
                    </div>
                ))}

                {isTyping && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            <div id="options-area" className="options-area">
                {currentOptions.map((opt, index) => (
                    <button
                        key={index}
                        className={`opt-btn ${opt.variant === 'back' ? 'nav-btn' : ''}`}
                        onClick={() => handleOptionClick(opt)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

        </div>
    </>
  );
}

export default BoatsChatbot;