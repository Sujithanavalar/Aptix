import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RefreshCw, Scale } from 'lucide-react';
import './RatioChatbot.css';

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
// 2. THE CHATBOT BRAIN (RATIO & PROPORTION)
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Ratio & Proportion Assistant</b>.
        <br /><br />
        I can help you master comparisons, distributions, and inverse proportions.
        <br /><br />
        What would you like to start with?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (Workers)", nextStep: "example_intro" },
      { label: "❓ Common Doubts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts:</b>
        <br /><br />
        1. <b>Ratio (a:b):</b> A comparison by division (a/b).
        <br />
        2. <b>Proportion (a:b = c:d):</b> States that two ratios are equal.
        <br />
        3. <b>Compound Ratio:</b> When ratios (a:b) and (c:d) are multiplied to form <b>ac:bd</b>.
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
        <br /><br />
        <b>1. Cross Multiplication:</b>
        <br />
        If a:b :: c:d, then <span className="math-highlight">a × d = b × c</span>
        <br /><br />
        <b>2. Inverse Proportion:</b>
        <br />
        <span className="math-highlight">a₁b₁ = a₂b₂</span>
        <br />
        <i>(Used for Work/Time problems: More workers = Less time)</i>
        <br /><br />
        <b>3. Distribution:</b>
        <br />
        Share of A = (a / (a+b)) × Total Amount
      </>
    ),
    options: [
      { label: "See Applied Example", nextStep: "example_intro" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the specific problem from your notes:
        <div className="problem-box">
          If <b>15 workers</b> complete a job in <b>12 days</b>, how many days will <b>20 workers</b> take?
        </div>
        Shall we solve this step-by-step?
      </>
    ),
    options: [
      { label: "Step 1: Identify Type", nextStep: "step1" },
      { label: "Just show the answer", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Identify Proportion Type</b>
        <br />
        Ask yourself: If I add more workers, will the work finish faster or slower?
        <br /><br />
        <b>Faster (Less Time).</b>
        <br />
        Since one quantity increases and the other decreases, this is <b>Inverse Proportion</b>.
      </>
    ),
    options: [
      { label: "Step 2: Formula", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Apply Formula</b>
        <br />
        For inverse proportion, the product is constant:
        <br />
        <span className="math-highlight">Workers₁ × Days₁ = Workers₂ × Days₂</span>
        <br /><br />
        Substitute the values:
        <br />
        15 × 12 = 20 × x
      </>
    ),
    options: [
      { label: "Step 3: Calculate", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Solve for x</b>
        <br />
        180 = 20x
        <br />
        x = 180 / 20
        <br /><br />
        <b>Answer:</b>
        <br />
        <span className="success-text">9 Days</span>
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
        Inverse Proportion Formula: M1 × D1 = M2 × D2
        <br />
        15 × 12 = 20 × D2
        <br />
        180 = 20 × D2
        <br />
        <b>D2 = 9 Days.</b>
      </>
    ),
    options: [
      { label: "Explain the steps", nextStep: "step1" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },

  // --- DOUBTS BRANCH ---
  doubts: {
    text: "Select a common topic for clarification:",
    options: [
      { label: "Direct vs Inverse?", nextStep: "doubt_types" },
      { label: "What is 'Mean Proportional'?", nextStep: "doubt_mean" },
      { label: "🏠 Main Menu", nextStep: "start", variant: "back" },
    ],
  },
  doubt_types: {
    text: (
      <>
        <b>Direct Proportion (a/b = k):</b>
        <br />
        If one increases, the other increases (e.g., Cost vs Quantity).
        <br /><br />
        <b>Inverse Proportion (a×b = k):</b>
        <br />
        If one increases, the other decreases (e.g., Speed vs Time).
      </>
    ),
    options: [ { label: "Got it", nextStep: "start" } ],
  },
  doubt_mean: {
    text: (
      <>
        The <b>Mean Proportional</b> between two numbers <i>a</i> and <i>b</i> is:
        <br />
        <span className="math-highlight">√ab</span>
      </>
    ),
    options: [ { label: "Got it", nextStep: "start" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const RatioChatbot: React.FC = () => {
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
                    <Scale size={18} /> Ratio Assistant
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

export default RatioChatbot;
