import React, { useState, useEffect, useRef } from 'react';
import { X, RefreshCw, Calculator } from 'lucide-react';
import './SurdsChatbot.css';

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
// 2. THE CHATBOT BRAIN (SURDS & INDICES)
// Sources:
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Surds & Indices Assistant</b>.
        <br /><br />
        I can help you simplify irrational roots (surds) and master exponent rules (indices).
        <br /><br />
        What would you like to explore?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Law of Indices", nextStep: "formulas" },
      { label: "📝 Solved Example (√72)", nextStep: "example_intro" },
      { label: "🤔 Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Definitions:</b>
        <br /><br />
        1. <b>Surds:</b> Irrational roots like <span className="math-highlight">√2</span> or <span className="math-highlight">∛5</span>. They cannot be written as simple fractions.
        <br />
        2. <b>Indices (Exponents):</b> The power to which a number is raised, e.g., in <b>aⁿ</b>, n is the index.
        <br />
        3. <b>Rationalization:</b> The process of removing a surd from the denominator of a fraction.
      </>
    ),
    options: [
      { label: "Show Index Laws", nextStep: "formulas" },
      { label: "Try an Example", nextStep: "example_intro" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential Laws & Rules:</b>
        <br /><br />
        <b>1. Index Laws:</b>
        <ul className="bot-list">
          <li>Multiplication: aᵐ × aⁿ = aᵐ⁺ⁿ</li>
          <li>Division: aᵐ / aⁿ = aᵐ⁻ⁿ</li>
          <li>Power of Power: (aᵐ)ⁿ = aᵐⁿ</li>
          <li>Negative Power: a⁻ⁿ = 1/aⁿ</li>
        </ul>
        <b>2. Surd Rules:</b>
        <ul className="bot-list">
          <li>√(a × b) = √a × √b</li>
          <li>Identity: (a + √b)(a - √b) = a² - b</li>
        </ul>
      </>
    ),
    options: [
      { label: "Apply to Example", nextStep: "example_intro" },
      { label: "What about adding?", nextStep: "doubt_add" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the problem from your notes:
        <div className="problem-box">
          Simplify the surd: <b>√72</b>
        </div>
        Shall we solve this step-by-step using the <b>Simplifying Surds</b> method?
      </>
    ),
    options: [
      { label: "Step 1: Factorize", nextStep: "step1" },
      { label: "Show Final Answer", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Factor under the root</b>
        <br />
        We need to find a factor of 72 that is a <b>perfect square</b> (like 4, 9, 16, 36).
        <br /><br />
        72 can be written as <b>36 × 2</b>.
        <br />
        <i>(We chose 36 because it is the largest perfect square).</i>
      </>
    ),
    options: [
      { label: "Step 2: Split Root", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Split the Surd</b>
        <br />
        Using the rule √(ab) = √a × √b:
        <br /><br />
        √72 = √(36 × 2)
        <br />
        √72 = √36 × √2
      </>
    ),
    options: [
      { label: "Step 3: Simplify", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Calculate Square Root</b>
        <br />
        We know that √36 = 6.
        <br /><br />
        So:
        <br />
        6 × √2
        <br /><br />
        <b>Answer:</b> <span className="success-text">6√2</span>
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
        √72 = √(36 × 2)
        <br />
        √72 = √36 × √2
        <br />
        √72 = <b>6√2</b>
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
      { label: "Can I add surds? (√2 + √3)", nextStep: "doubt_add" },
      { label: "What is a fractional index?", nextStep: "doubt_fraction" },
      { label: "What is a 'Conjugate'?", nextStep: "doubt_conjugate" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  doubt_add: {
    text: (
      <>
        <b>Can we add √2 + √3?</b>
        <br /><br />
        <b>NO.</b> Unlike multiplication, you cannot combine surds under addition.
        <br />
        √2 + √3 ≠ √5.
        <br /><br />
        <i>You can only add "like" surds (e.g., 2√5 + 3√5 = 5√5).</i>
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
  doubt_fraction: {
    text: (
      <>
        <b>What is a fractional power mean?</b>
        <br /><br />
        A fractional index represents a <b>root</b>.
        <br />
        • <span className="math-highlight">x^(1/2) = √x</span> (Square root)
        <br />
        • <span className="math-highlight">x^(1/3) = ∛x</span> (Cube root)
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
  doubt_conjugate: {
    text: (
      <>
        <b>What is a Conjugate?</b>
        <br /><br />
        To remove a surd from a denominator (Rationalization), we multiply by the conjugate.
        <br /><br />
        If the term is <b>(a + √b)</b>, the conjugate is <b>(a - √b)</b>.
        <br />
        <i>Multiplying them always gives a rational number.</i>
      </>
    ),
    options: [ { label: "Got it", nextStep: "doubts" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const SurdsChatbot: React.FC = () => {
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
            aria-label="Open Surds Assistant"
        >
            {isOpen ? (
                <X size={28} />
            ) : (
                <Calculator size={28} />
            )}
        </button>

        {/* --- CHAT WINDOW --- */}
        <div className={`chat-container ${isOpen ? '' : 'hidden'}`} ref={chatContainerRef}>
            <div className="chat-header">
                <div className="header-title">
                    <Calculator size={18} /> Surds Assistant
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

export default SurdsChatbot;