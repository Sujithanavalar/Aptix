import React, { useState, useEffect, useRef } from 'react';
import { Scale, X, RefreshCw } from 'lucide-react';
import './AllegationChatbot.css';

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
// 2. THE CHATBOT BRAIN (ALLEGATION & MIXTURES)
// ==========================================

const CHAT_FLOW: ChatLogic = {
  // --- ENTRY POINT ---
  start: {
    text: (
      <>
        Hello! I am your <b>Allegation & Mixtures Assistant</b>.
        <br /><br />
        I can help you find mixing ratios, average prices, and solve replacement problems.
        <br /><br />
        Where shall we begin?
      </>
    ),
    options: [
      { label: "📖 Key Concepts", nextStep: "concepts" },
      { label: "∑ Essential Formulas", nextStep: "formulas" },
      { label: "📝 Solved Example (Rice)", nextStep: "example_intro" },
      { label: "🤔 Doubts & Shortcuts", nextStep: "doubts" },
    ],
  },

  // --- CONCEPTS BRANCH ---
  concepts: {
    text: (
      <>
        <b>Key Concepts:</b>
        <br /><br />
        1. <b>The Rule of Allegation:</b> A method to find the ratio in which two ingredients must be mixed to get a desired average price.
        <br />
        2. <b>The "Cross" Method:</b> You subtract diagonally to find the ratio parts.
        <br />
        3. <b>Mean Price:</b> The price of the final mixture. It <i>always</i> lies between the cheaper and dearer prices.
      </>
    ),
    options: [
      { label: "Show Formulas", nextStep: "formulas" },
      { label: "See the Cross Method", nextStep: "shortcut_cross" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- FORMULAS BRANCH ---
  formulas: {
    text: (
      <>
        <b>Essential Formulas:</b>
        <br /><br />
        <b>1. Allegation Ratio:</b>
        <br />
        <span className="math-highlight">(Dearer - Mean) : (Mean - Cheaper)</span>
        <br />
        <i>Where D = Dearer Price, C = Cheaper Price, M = Mean Price.</i>
        <br /><br />
        <b>2. Repeated Replacement:</b>
        <br />
        Final Qty = Initial × (1 - r/V)ⁿ
        <br />
        <i>(r = removed qty, V = total volume, n = number of times)</i>
      </>
    ),
    options: [
      { label: "Apply to Example", nextStep: "example_intro" },
      { label: "Explain Replacement", nextStep: "doubt_replace" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- EXAMPLE BRANCH ---
  example_intro: {
    text: (
      <>
        Let's solve the problem from your notes:
        <div className="problem-box">
          Mix rice at <b>$6/kg</b> and <b>$4/kg</b> to get a mixture worth <b>$5/kg</b>. Find the ratio.
        </div>
        Shall we solve this using the <b>Cross Method</b>?
      </>
    ),
    options: [
      { label: "Step 1: Identify D, C, M", nextStep: "step1" },
      { label: "Just show answer", nextStep: "answer" },
    ],
  },
  step1: {
    text: (
      <>
        <b>Step 1: Identify Prices</b>
        <br />
        • Dearer Price (D) = <b>$6</b>
        <br />
        • Cheaper Price (C) = <b>$4</b>
        <br />
        • Mean/Target Price (M) = <b>$5</b>
      </>
    ),
    options: [
      { label: "Step 2: Subtract", nextStep: "step2" },
    ],
  },
  step2: {
    text: (
      <>
        <b>Step 2: Calculate Differences</b>
        <br />
        Using the formula (D - M) and (M - C):
        <br /><br />
        • D - M = 6 - 5 = <b>1</b>
        <br />
        • M - C = 5 - 4 = <b>1</b>
      </>
    ),
    options: [
      { label: "Step 3: Form Ratio", nextStep: "step3" },
    ],
  },
  step3: {
    text: (
      <>
        <b>Step 3: Final Ratio</b>
        <br />
        The ratio is (M - C) : (D - M)
        <br />
        <i>(Wait! Note the order: Cheaper part is on left usually, or follow the cross output).</i>
        <br /><br />
        Ratio = 1 : 1
        <br /><br />
        <b>Answer:</b> <span className="success-text">Mix in equal quantities (1:1)</span>
      </>
    ),
    options: [
      { label: "Try another doubt", nextStep: "doubts" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  answer: {
    text: (
      <>
        <b>Solution:</b>
        <br />
        D=$6, C=$4, M=$5.
        <br />
        Ratio = (5-4) : (6-5)
        <br />
        Ratio = <b>1 : 1</b>.
      </>
    ),
    options: [
      { label: "Explain steps", nextStep: "step1" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },

  // --- DOUBTS & SHORTCUTS BRANCH ---
  doubts: {
    text: "Here are common doubts and memory tips. Select one:",
    options: [
      { label: "🧠 Shortcut: Visualizing Cross", nextStep: "shortcut_cross" },
      { label: "❓ Confusion: Which side is which?", nextStep: "doubt_sides" },
      { label: "❓ What is 'Replacement'?", nextStep: "doubt_replace" },
      { label: "🏠 Restart", nextStep: "start", variant: "back" },
    ],
  },
  shortcut_cross: {
    text: (
      <>
        <b>How to Memorize: The Cross</b>
        <br /><br />
        Visualize an 'X'.
        <br />
        <b>Top Left:</b> Dearer ($6) &nbsp;&nbsp;&nbsp; <b>Top Right:</b> Cheaper ($4)
        <br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Center:</b> Mean ($5)
        <br /><br />
        Now subtract along the lines of the X:
        <br />
        • Bottom Right gets (D - M)
        <br />
        • Bottom Left gets (M - C)
      </>
    ),
    options: [ { label: "Got it!", nextStep: "doubts" } ],
  },
  doubt_sides: {
    text: (
      <>
        <b>Which side corresponds to which?</b>
        <br /><br />
        The value you calculate on the <b>Left</b> corresponds to the ingredient on the <b>Left</b>.
        <br /><br />
        If you put Dearer on the left top, the weight of the Dearer ingredient appears on the left bottom.
      </>
    ),
    options: [ { label: "Got it!", nextStep: "doubts" } ],
  },
  doubt_replace: {
    text: (
      <>
        <b>Understanding Replacement:</b>
        <br /><br />
        This formula is for when you remove some milk and add water, then repeat.
        <br />
        <b>Final = Initial × (1 - r/V)ⁿ</b>
        <br /><br />
        • <b>r:</b> Amount removed each time
        <br />
        • <b>V:</b> Total tank capacity
        <br />
        • <b>n:</b> Number of times you did it.
      </>
    ),
    options: [ { label: "Got it!", nextStep: "doubts" } ],
  },
};

// ==========================================
// 3. REACT COMPONENT
// ==========================================

const AllegationChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('start');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      processStep('start');
    }
  }, [isOpen]);

  const processStep = (stepKey: string) => {
    const stepData = CHAT_FLOW[stepKey];
    if (!stepData) return;

    setIsTyping(true);
    setCurrentStep(stepKey);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content: stepData.text,
        },
      ]);
    }, 600);
  };

  const handleOptionClick = (option: Option) => {
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

  const handleRestart = () => {
    setMessages([]);
    processStep('start');
  };

  return (
    <>
      {/* --- LAUNCHER --- */}
      <button 
        className="chat-launcher" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Allegation Assistant"
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <Scale size={24} />
        )}
      </button>

      {/* --- CHAT WINDOW --- */}
      <div className={`chat-container ${!isOpen ? 'hidden' : ''}`}>
        <div className="chat-header">
          <div className="header-title">
            <Scale size={20} />
            <span>Allegation Assistant</span>
          </div>
          <div className="header-controls">
            <button className="control-btn" onClick={handleRestart} title="Restart">
              <RefreshCw size={18} />
            </button>
            <button className="control-btn" onClick={() => setIsOpen(false)} title="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              {msg.content}
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-options">
          {!isTyping && CHAT_FLOW[currentStep]?.options.map((opt, index) => (
            <button
              key={index}
              className={`option-btn ${opt.variant === 'back' ? 'back' : ''}`}
              onClick={() => handleOptionClick(opt)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllegationChatbot;
