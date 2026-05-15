import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RefreshCw, Calculator } from 'lucide-react';
import './ArithChatbot.css';

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
// 2. THE CHATBOT BRAIN (ARITHMETIC PROGRESSION)
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Arithmetic Progression (AP) Assistant</b>.
        <br /><br />
        I can help you with sequences, nth terms, and summations.
        <br /><br />
        Where should we begin?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (20th Term)", nextStep: "example_intro" },
      { label: "🤔 Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts of AP:</b>
        <br /><br />
        1. <b>Definition:</b> A sequence where each term differs from the previous one by a constant value.
        <br />
        2. <b>General Form:</b> <span className="math-highlight">a, a+d, a+2d, a+3d...</span>
        <br />
        3. <b>Components:</b>
        <ul className="bot-list">
          <li><b>a:</b> First term</li>
          <li><b>d:</b> Common difference (a₂ - a₁)</li>
          <li><b>n:</b> Number of terms</li>
        </ul>
      </>
    ),
    options: [
      { label: "Show Formulas", nextStep: "formulas" },
      { label: "See an Example", nextStep: "example_intro" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential AP Formulas:</b>
        <br /><br />
        <b>1. Finding the nth Term:</b>
        <br />
        <span className="math-highlight">aₙ = a + (n-1)d</span>
        <br /><br />
        <b>2. Sum of n Terms (General):</b>
        <br />
        Sₙ = (n/2) × [2a + (n-1)d]
        <br /><br />
        <b>3. Sum (if Last Term 'l' is known):</b>
        <br />
        Sₙ = (n/2) × (a + l)
      </>
    ),
    options: [
      { label: "Apply to Example", nextStep: "example_intro" },
      { label: "Clarify Formulas", nextStep: "doubts" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the specific problem from your notes:
        <div className="problem-box">
          Find the <b>20th term</b> of the AP:
          <br />
          5, 8, 11, 14, ...
        </div>
        Shall we break this down?
      </>
    ),
    options: [
      { label: "Step 1: Identify Values", nextStep: "step1" },
      { label: "Just show result", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Identify 'a' and 'd'</b>
        <br /><br />
        • First term (a) = <b>5</b>
        <br />
        • Common difference (d) = 8 - 5 = <b>3</b>
        <br />
        • Target term (n) = <b>20</b>
      </>
    ),
    options: [
      { label: "Step 2: Apply Formula", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Apply nth Term Formula</b>
        <br />
        Formula: aₙ = a + (n-1)d
        <br /><br />
        Substitute values:
        <br />
        a₂₀ = 5 + (20 - 1) × 3
      </>
    ),
    options: [
      { label: "Step 3: Calculate", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Calculation</b>
        <br />
        a₂₀ = 5 + (19 × 3)
        <br />
        a₂₀ = 5 + 57
        <br /><br />
        <b>Answer:</b>
        <br />
        <span className="success-text">62</span>
      </>
    ),
    options: [
      { label: "Solve another doubt", nextStep: "doubts" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  answer: {
    text: (
      <>
        <b>Solution:</b>
        <br />
        a = 5, d = 3, n = 20.
        <br />
        a₂₀ = 5 + 19(3)
        <br />
        a₂₀ = 5 + 57 = <b>62</b>.
      </>
    ),
    options: [
      { label: "Explain steps", nextStep: "step1" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- DOUBTS BRANCH ---
  doubts: {
    text: "Here are common questions students ask about AP. Which one is confusing you?",
    options: [
      { label: "Can 'd' be negative?", nextStep: "doubt_negative" },
      { label: "When to use which Sum formula?", nextStep: "doubt_sum" },
      { label: "Difference: 'n' vs 'aₙ'?", nextStep: "doubt_n_vs_an" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  doubt_negative: {
    text: (
      <>
        <b>Can the common difference (d) be negative?</b>
        <br /><br />
        <b>Yes!</b> If the sequence is decreasing (e.g., 10, 8, 6...), then d is negative (-2).
        <br /><br />
        <i>Tip: Always calculate d as (Second Term - First Term), even if the result is negative.</i>
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
  doubt_sum: {
    text: (
      <>
        <b>Which Sum formula should I use?</b>
        <br /><br />
        1. Use <b>Sₙ = (n/2)[2a + (n-1)d]</b> when you <i>don't</i> know the last term.
        <br /><br />
        2. Use <b>Sₙ = (n/2)(a + l)</b> when you <i>do</i> know the last term (l). It's faster!
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
  doubt_n_vs_an: {
    text: (
      <>
        <b>What is the difference between 'n' and 'aₙ'?</b>
        <br /><br />
        • <b>n</b> is the <b>Position</b> (like a roll number: 1st, 2nd, 20th). It must be a positive integer.
        <br /><br />
        • <b>aₙ</b> is the <b>Value</b> at that position (the actual number written there). It can be negative, fraction, or zero.
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const ArithChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                    <Calculator size={18} /> AP Assistant
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

export default ArithChatbot;
