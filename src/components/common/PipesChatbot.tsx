import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Droplet } from 'lucide-react';
import './PipesChatbot.css';

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
// 2. THE CHATBOT BRAIN (PIPES & CISTERNS)
// Sources:
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Pipes & Cisterns Assistant</b>.
        <br /><br />
        I can help you calculate filling rates, emptying times, and combined pipe efficiency.
        <br /><br />
        What would you like to explore?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (1/3 Tank)", nextStep: "example_intro" },
      { label: "🤔 Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts:</b>
        <br /><br />
        1. <b>Rate of Filling:</b> If a pipe fills a tank in <b>n</b> hours, it fills <span className="math-highlight">1/n</span> of the tank in 1 hour.
        <br />
        2. <b>Work Done:</b> Work = Rate × Time.
        <br />
        3. <b>Emptying:</b> An emptying pipe (leak) is treated as having a <b>negative rate</b>.
      </>
    ),
    options: [
      { label: "Show Formulas", nextStep: "formulas" },
      { label: "Try an Example", nextStep: "example_intro" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential Formulas:</b>
        <br /><br />
        <b>1. Single Pipe:</b>
        <br />
        Rate = 1 / Time to complete
        <br /><br />
        <b>2. Combined Rate:</b>
        <br />
        Combined = Rate₁ + Rate₂ + ...
        <br />
        <i>(Subtract rate if the pipe is emptying)</i>
        <br /><br />
        <b>3. Time Together:</b>
        <br />
        Time = 1 / Combined Rate
      </>
    ),
    options: [
      { label: "Apply to Example", nextStep: "example_intro" },
      { label: "Explain Emptying", nextStep: "doubt_empty" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the problem from your notes:
        <div className="problem-box">
          <b>Pipe A</b> fills a tank in <b>6 hours</b>. What fraction of the tank fills in <b>2 hours</b>?
        </div>
        Shall we solve this step-by-step?
      </>
    ),
    options: [
      { label: "Step 1: Find Rate", nextStep: "step1" },
      { label: "Show Final Answer", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Calculate Rate of Pipe A</b>
        <br />
        If it fills the whole tank in 6 hours...
        <br /><br />
        Rate = <b>1/6</b> per hour.
      </>
    ),
    options: [
      { label: "Step 2: Calculate Work", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Calculate Work Done</b>
        <br />
        Formula: Work = Rate × Time
        <br />
        Time given = 2 hours
        <br /><br />
        Work = (1/6) × 2
      </>
    ),
    options: [
      { label: "Step 3: Simplify", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Simplify Fraction</b>
        <br />
        Work = 2 / 6
        <br />
        Dividing both by 2 gives:
        <br /><br />
        <b>Answer:</b> <span className="success-text">1/3 of the tank</span>
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
        Rate = 1/6 per hour.
        <br />
        Time = 2 hours.
        <br />
        Work = (1/6) × 2 = 2/6 = <b>1/3</b>.
        <br /><br />
        So, <b>1/3 of the tank</b> is filled.
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
      { label: "How to handle leaks?", nextStep: "doubt_empty" },
      { label: "Why do we use '1/n'?", nextStep: "doubt_rate" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  doubt_empty: {
    text: (
      <>
        <b>How to handle Emptying Pipes (Leaks)?</b>
        <br /><br />
        Just assign a <b>negative sign</b> to its rate.
        <br /><br />
        <i>Example:</i>
        <br />
        • Fill Pipe A: +1/10
        <br />
        • Empty Pipe B: -1/15
        <br />
        • Combined: (1/10) - (1/15)
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
  doubt_rate: {
    text: (
      <>
        <b>Why is rate 1/n?</b>
        <br /><br />
        Think of the "Tank" as <b>1 unit of work</b>.
        <br /><br />
        If it takes 4 hours to finish 1 tank, then in 1 hour, you must have finished 1/4th of the tank.
        <br />
        This makes the math for combining pipes much easier!
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const PipesChatbot: React.FC = () => {
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
            aria-label="Open Pipes Assistant"
        >
            {isOpen ? (
                <X size={28} />
            ) : (
                <Droplet size={28} />
            )}
        </button>

        {/* --- CHAT WINDOW --- */}
        <div className={`chat-container ${isOpen ? '' : 'hidden'}`} ref={chatContainerRef}>
            <div className="chat-header">
                <div className="header-title">
                    <Droplet size={18} /> Pipes Assistant
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

export default PipesChatbot;