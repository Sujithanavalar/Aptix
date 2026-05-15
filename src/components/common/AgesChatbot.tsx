import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, RefreshCw, Calculator } from 'lucide-react';
import './AgesChatbot.css';

// --- DATA: The Decision Tree (Ages Topic) ---
const agesLogic: Record<string, any> = {
    // Root Node
    start: {
        text: "Hello! I am your <b>Ages Topic Assistant</b>.<br>I can guide you through concepts, formulas, or detailed solved examples.",
        options: [
            { label: "📖 Key Concepts", next: "concepts" },
            { label: "∑ Important Formulas", next: "formulas" },
            { label: "📝 Solved Example (Step-by-Step)", next: "example_intro" },
            { label: "❓ Common Doubts", next: "doubts" }
        ]
    },

    // --- CONCEPTS BRANCH ---
    concepts: {
        text: "Here are the core concepts for Age problems:<br><br>1. <b>Constant Difference:</b> The age difference between two people <i>never</i> changes. If Dad is 20 years older today, he is 20 years older forever.<br>2. <b>Timeline:</b> Past (-n) | Present (x) | Future (+n).",
        options: [
            { label: "Show Formulas", next: "formulas" },
            { label: "See an Example", next: "example_intro" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },

    // --- FORMULAS BRANCH ---
    formulas: {
        text: "<b>Essential Formulas:</b><br><ul><li><b>n years ago:</b> Age - n</li><li><b>n years hence/later:</b> Age + n</li><li><b>Ratio a:b:</b> Express as <i>ax</i> and <i>bx</i></li><li><b>A is n times B:</b> A = nB</li></ul>",
        options: [
            { label: "Apply to Example", next: "example_intro" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },

    // --- EXAMPLE BRANCH (Step-by-Step) ---
    example_intro: {
        text: "Let's solve this problem together:<br><div class='math-box'>Father is 3 times as old as his son. After 12 years, his age will be twice that of his son. Find their present ages.</div><br>Shall we solve it step-by-step?",
        options: [
            { label: "Yes, Start with Variables", next: "ex_step1" },
            { label: "Just show the answer", next: "ex_answer" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },
    ex_step1: {
        text: "<b>Step 1: Assign Variables</b><br>We don't know the exact ages, but we know the ratio.<br><br>Let Son's age = <b>x</b><br>Since Father is 3 times older, Father's age = <b>3x</b>",
        options: [
            { label: "Step 2: Apply Timeline", next: "ex_step2" },
            { label: "Wait, explain the ratio", next: "doubt_ratio" }
        ]
    },
    ex_step2: {
        text: "<b>Step 2: The Timeline (After 12 Years)</b><br>We need to add 12 to BOTH ages.<br><br>Son's age = <b>x + 12</b><br>Father's age = <b>3x + 12</b>",
        options: [
            { label: "Step 3: Form Equation", next: "ex_step3" }
        ]
    },
    ex_step3: {
        text: "<b>Step 3: The Condition</b><br>The problem says: <i>Father will be twice (2x) the son.</i><br><br>Equation:<br><div class='math-box'>3x + 12 = 2(x + 12)</div>",
        options: [
            { label: "Step 4: Solve", next: "ex_step4" }
        ]
    },
    ex_step4: {
        text: "<b>Step 4: Calculation</b><br>3x + 12 = 2x + 24<br>3x - 2x = 24 - 12<br><b>x = 12</b><br><br>So, Son = 12 years, Father = 36 years.",
        options: [
            { label: "Try another doubt", next: "doubts" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },
    ex_answer: {
        text: "<b>Solution:</b><br>3x + 12 = 2(x + 12)<br>x = 12.<br><br>Son is 12, Father is 36.",
        options: [
            { label: "Explain the steps", next: "ex_step1" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },

    // --- DOUBTS BRANCH ---
    doubts: {
        text: "Select a common doubt:",
        options: [
            { label: "How to handle Ratios?", next: "doubt_ratio" },
            { label: "Meaning of 'Hence'?", next: "doubt_words" },
            { label: "🏠 Main Menu", next: "start" }
        ]
    },
    doubt_ratio: {
        text: "<b>Ratio Rule:</b><br>If ages are in ratio A:B, <b>never</b> assume the ages are just A and B.<br>Always multiply by a variable x. So, ages are <b>Ax</b> and <b>Bx</b>.",
        options: [ { label: "Got it", next: "start" } ]
    },
    doubt_words: {
        text: "<b>Keywords:</b><br>Ago / Before = Subtract (-)<br>Hence / After / Later = Add (+)",
        options: [ { label: "Got it", next: "start" } ]
    }
};

interface Message {
    text: string;
    type: 'bot' | 'user';
    id: number;
}

interface Option {
    label: string;
    next: string;
}

export default function AgesChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentOptions, setCurrentOptions] = useState<Option[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const chatBodyRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

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

    const processNode = (nodeKey: string) => {
        const data = agesLogic[nodeKey];
        if (!data) return;

        // Clear options immediately (simulating disableOldButtons/clearing area)
        setCurrentOptions([]);
        
        // Show typing
        setIsTyping(true);

        // Simulate delay
        setTimeout(() => {
            setIsTyping(false);
            
            // Add Bot Message
            setMessages(prev => [...prev, { 
                text: data.text, 
                type: 'bot', 
                id: Date.now() 
            }]);

            // Set new options
            if (data.options) {
                setCurrentOptions(data.options);
            }
        }, 600);
    };

    const toggleChat = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        
        if (newState && !hasStartedRef.current) {
            hasStartedRef.current = true;
            if (messages.length === 0) {
                processNode('start');
            }
        }
    };

    const handleOptionClick = (option: Option) => {
        // Add user message
        setMessages(prev => [...prev, { 
            text: option.label, 
            type: 'user', 
            id: Date.now() 
        }]);
        
        // Process next node
        processNode(option.next);
    };

    const handleRefresh = () => {
        setMessages([]);
        setCurrentOptions([]);
        processNode('start');
    };

    return (
        <>
            <button 
                id="chat-launcher" 
                className="chat-launcher" 
                onClick={toggleChat}
                aria-label="Toggle Chat"
            >
                {/* Using Lucide icons to match project, but mimicking the class structure if needed */}
                <MessageCircle size={26} />
            </button>

            <div 
                id="chat-container" 
                className={`chat-container ${!isOpen ? 'hidden' : ''}`}
                ref={chatContainerRef}
            >
                
                <div className="chat-header">
                    <div className="header-title">
                        <Calculator size={18} /> Ages Assistant
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
                            dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
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
                            className={`opt-btn ${opt.next === 'start' || opt.label.includes('Back') ? 'nav-btn' : ''}`}
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
