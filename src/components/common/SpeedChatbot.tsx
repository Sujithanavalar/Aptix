import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RefreshCw, Gauge } from 'lucide-react';
import './SpeedChatbot.css';

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
// 2. THE CHATBOT BRAIN (DATA)
// ==========================================

const CHAT_FLOW: ChatLogic = {
  start: {
    text: (
      <>
        Hello! I am your <b>Speed, Time & Distance</b> Assistant.
        <br /><br />
        I can help you master the fundamental relationship:
        <br />
        <span className="math-highlight">Distance = Speed × Time</span>
        <br /><br />
        What would you like to explore?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (Train)", nextStep: "example_intro" },
      { label: "❓ Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts:</b>
        <br /><br />
        1. <b>The Triangle:</b> Distance is always on top. Speed and Time are at the bottom.
        <br />
        2. <b>Proportionality:</b> If Speed increases, Time decreases (for constant Distance).
        <br />
        3. <b>Units Matter:</b> Always ensure units match (e.g., km with hours, m with seconds).
      </>
    ),
    options: [
      { label: "Show Formulas", nextStep: "formulas" },
      { label: "Try an Example", nextStep: "example_intro" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential Formulas:</b>
        <ul className="bot-list">
          <li>D = S × T</li>
          <li>S = D / T</li>
          <li>T = D / S</li>
        </ul>
        <b>Conversions:</b>
        <ul className="bot-list">
          <li>km/h → m/s: Multiply by <b>5/18</b></li>
          <li>m/s → km/h: Multiply by <b>18/5</b></li>
        </ul>
        <b>Relative Speed:</b>
        <ul className="bot-list">
          <li>Opposite Dir: <b>S1 + S2</b></li>
          <li>Same Dir: <b>|S1 - S2|</b></li>
        </ul>
      </>
    ),
    options: [
      { label: "See Applied Example", nextStep: "example_intro" },
      { label: "Explain Relative Speed", nextStep: "doubt_relative" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the problem from your notes:
        <div className="problem-box">
          A train travels <b>360 km</b> at <b>90 km/h</b>. How long does it take?
        </div>
        Shall we solve this using the <b>Direct Formula Application</b> method?
      </>
    ),
    options: [
      { label: "Yes, Step 1: Identify Given", nextStep: "ex_step1" },
      { label: "Just show answer", nextStep: "ex_answer" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  ex_step1: {
    text: (
      <>
        <b>Step 1: Identify Given Data</b>
        <br />
        Looking at the problem:
        <br />
        • Distance (D) = <b>360 km</b>
        <br />
        • Speed (S) = <b>90 km/h</b>
        <br />
        • Required = <b>Time (T)</b>
      </>
    ),
    options: [
      { label: "Step 2: Choose Formula", nextStep: "ex_step2" },
    ],
  },
  ex_step2: {
    text: (
      <>
        <b>Step 2: Choose Formula Variant</b>
        <br />
        Since we need Time, we rearrange D = S × T.
        <br /><br />
        Formula:
        <br />
        <span className="math-highlight">Time = Distance / Speed</span>
      </>
    ),
    options: [
      { label: "Step 3: Calculate", nextStep: "ex_step3" },
    ],
  },
  ex_step3: {
    text: (
      <>
        <b>Step 3: Substitute and Calculate</b>
        <br />
        T = 360 / 90
        <br /><br />
        <b>Answer:</b>
        <br />
        <span className="success-text">4 Hours</span>
      </>
    ),
    options: [
      { label: "Try another doubt", nextStep: "doubts" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  ex_answer: {
    text: (
      <>
        <b>Solution:</b>
        <br />
        Formula: Time = Dist / Speed
        <br />
        Calculation: 360 / 90 = 4.
        <br /><br />
        <b>Answer: 4 Hours.</b>
      </>
    ),
    options: [
      { label: "Explain the steps", nextStep: "ex_step1" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- DOUBTS BRANCH ---
  doubts: {
    text: "Which concept is confusing you?",
    options: [
      { label: "Relative Speed (Trains)", nextStep: "doubt_relative" },
      { label: "Average Speed", nextStep: "doubt_avg" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  doubt_relative: {
    text: (
      <>
        <b>Relative Speed Rules:</b>
        <br />
        Imagine two trains.
        <br /><br />
        1. <b>Opposite Direction:</b> They pass each other very fast. You <b>ADD</b> speeds (S1 + S2).
        <br />
        2. <b>Same Direction:</b> One slowly overtakes the other. You <b>SUBTRACT</b> speeds (|S1 - S2|).
      </>
    ),
    options: [
      { label: "Got it, thanks", nextStep: "start" },
    ],
  },
  doubt_avg: {
    text: (
      <>
        <b>Average Speed Warning:</b>
        <br />
        Average Speed is <b>NOT</b> (S1 + S2) / 2.
        <br /><br />
        Correct Formula:
        <br />
        <span className="math-highlight">Total Distance / Total Time</span>
      </>
    ),
    options: [
      { label: "Got it, thanks", nextStep: "start" },
    ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

export default function SpeedChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

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
              !(event.target as Element).closest('#chat-launcher')) {
              setIsOpen(false);
          }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
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

  const toggleChat = () => {
      const newState = !isOpen;
      setIsOpen(newState);
      
      if (newState && !hasStartedRef.current) {
          hasStartedRef.current = true;
          if (messages.length === 0) {
              processStep('start');
          }
      }
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

    // Process Next Step
    processStep(option.nextStep);
  };

  const handleRefresh = () => {
    setMessages([]);
    setCurrentOptions([]);
    processStep('start');
  };

  return (
    <>
        <button 
            id="chat-launcher" 
            className="chat-launcher" 
            onClick={toggleChat}
            aria-label="Toggle Chat"
        >
            <MessageCircle size={26} />
        </button>

        <div 
            id="chat-container" 
            className={`chat-container ${!isOpen ? 'hidden' : ''}`}
            ref={chatContainerRef}
        >
            
            <div className="chat-header">
                <div className="header-title">
                    <Gauge size={18} /> Speed Assistant
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
