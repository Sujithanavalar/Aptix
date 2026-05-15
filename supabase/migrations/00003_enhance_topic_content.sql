/*
# Enhance Topic Content with Detailed Step-by-Step Learning

Update topics table to include more detailed learning content with:
- Comprehensive explanations
- Step-by-step problem-solving guides
- Multiple worked examples
- Key formulas and concepts
- Common mistakes to avoid
*/

-- Update topics with enhanced content
UPDATE topics SET content = '{
  "introduction": "Age problems involve calculating the ages of people based on given relationships and conditions. These problems test your ability to form and solve equations.",
  "key_concepts": [
    "Present age vs. past/future age relationships",
    "Age ratios and their changes over time",
    "Sum and difference of ages",
    "Age-based equations and algebraic manipulation"
  ],
  "approaches": [
    {
      "name": "Direct Age Calculation Method",
      "description": "This method involves setting up simple equations based on the given age relationships. It works best when you have direct information about age differences or sums.",
      "when_to_use": "Use this when the problem gives you direct relationships like ''A is 5 years older than B'' or ''The sum of their ages is 30''",
      "steps": [
        "Identify what you need to find (whose age, at what time)",
        "Assign a variable (usually x) to the unknown age",
        "Express other ages in terms of this variable",
        "Form an equation based on the given condition",
        "Solve the equation step by step",
        "Verify your answer makes logical sense"
      ],
      "example": {
        "problem": "John is 5 years older than Mary. The sum of their ages is 25. Find John''s age.",
        "solution_steps": [
          "Let Mary''s age = x years",
          "Then John''s age = (x + 5) years",
          "According to the problem: x + (x + 5) = 25",
          "Simplify: 2x + 5 = 25",
          "Subtract 5 from both sides: 2x = 20",
          "Divide by 2: x = 10",
          "Therefore, Mary is 10 years old",
          "John''s age = 10 + 5 = 15 years"
        ],
        "answer": "15 years",
        "verification": "Check: 10 + 15 = 25 ✓ and 15 - 10 = 5 ✓"
      },
      "common_mistakes": [
        "Forgetting to add/subtract the age difference correctly",
        "Not checking if the answer satisfies all given conditions",
        "Mixing up present, past, and future ages"
      ]
    },
    {
      "name": "Age Ratio Method",
      "description": "This powerful method uses ratios to solve problems where ages are given in proportion. It''s especially useful when dealing with changing ratios over time.",
      "when_to_use": "Use this when the problem mentions ratios like ''ages are in the ratio 3:5'' or ''ratio becomes 4:7 after 10 years''",
      "steps": [
        "Express ages using the ratio with a common multiplier (e.g., 3x and 5x)",
        "Write expressions for ages at different times (past/future)",
        "Set up an equation using the second ratio condition",
        "Cross-multiply to eliminate fractions",
        "Solve for the multiplier x",
        "Calculate the actual ages using the value of x"
      ],
      "example": {
        "problem": "The ratio of ages of A and B is 3:5. After 10 years, the ratio becomes 5:7. Find their current ages.",
        "solution_steps": [
          "Let current ages be 3x and 5x (using ratio 3:5)",
          "After 10 years: A = 3x + 10, B = 5x + 10",
          "New ratio condition: (3x + 10)/(5x + 10) = 5/7",
          "Cross multiply: 7(3x + 10) = 5(5x + 10)",
          "Expand: 21x + 70 = 25x + 50",
          "Rearrange: 70 - 50 = 25x - 21x",
          "Simplify: 20 = 4x",
          "Solve: x = 5",
          "Current ages: A = 3(5) = 15 years, B = 5(5) = 25 years"
        ],
        "answer": "A is 15 years old, B is 25 years old",
        "verification": "Current ratio: 15:25 = 3:5 ✓, After 10 years: 25:35 = 5:7 ✓"
      },
      "common_mistakes": [
        "Forgetting to add/subtract years to both ages when time changes",
        "Incorrectly setting up the ratio equation",
        "Not simplifying ratios before comparing"
      ]
    }
  ],
  "key_formulas": [
    "If A is n years older than B: A = B + n",
    "If ratio of ages is a:b, express as ax and bx",
    "Age n years ago = Current age - n",
    "Age after n years = Current age + n"
  ],
  "practice_tips": [
    "Always define your variable clearly at the start",
    "Draw a timeline if the problem involves multiple time periods",
    "Check your answer by substituting back into the original conditions",
    "Remember: age differences remain constant over time"
  ]
}' WHERE slug = 'ages';

UPDATE topics SET content = '{
  "introduction": "Speed, Time, and Distance problems are based on the fundamental relationship: Distance = Speed × Time. These problems test your understanding of motion, relative speed, and time calculations.",
  "key_concepts": [
    "The basic formula: Distance = Speed × Time",
    "Relative speed when objects move in same/opposite directions",
    "Average speed calculations",
    "Time and distance conversions"
  ],
  "approaches": [
    {
      "name": "Basic Formula Application",
      "description": "The most straightforward method using the fundamental formula D = S × T. This works when you have two of the three variables and need to find the third.",
      "when_to_use": "Use this for direct problems where you need to find distance, speed, or time with given values",
      "steps": [
        "Identify what is given: distance, speed, or time",
        "Identify what you need to find",
        "Choose the appropriate formula variant",
        "Ensure all units are consistent (km/h, m/s, etc.)",
        "Substitute values and calculate",
        "Convert units if necessary for the final answer"
      ],
      "example": {
        "problem": "A car travels at 60 km/h for 3 hours. What distance does it cover?",
        "solution_steps": [
          "Given: Speed = 60 km/h, Time = 3 hours",
          "Need to find: Distance",
          "Formula: Distance = Speed × Time",
          "Substitute: Distance = 60 × 3",
          "Calculate: Distance = 180 km"
        ],
        "answer": "180 km",
        "verification": "Check: 180 ÷ 60 = 3 hours ✓"
      },
      "common_mistakes": [
        "Mixing units (km/h with minutes, etc.)",
        "Using wrong formula variant",
        "Not converting time properly (e.g., 1.5 hours vs 1 hour 30 minutes)"
      ]
    },
    {
      "name": "Relative Speed Method",
      "description": "This method calculates the effective speed when two objects are moving. It''s crucial for problems involving trains, cars, or people moving towards or away from each other.",
      "when_to_use": "Use when two objects are moving and you need to find when they meet or the distance between them",
      "steps": [
        "Identify the direction of motion for each object",
        "If moving towards each other: Relative Speed = Speed₁ + Speed₂",
        "If moving in same direction: Relative Speed = |Speed₁ - Speed₂|",
        "Apply D = S × T using relative speed",
        "Calculate the required value",
        "Interpret the result in context"
      ],
      "example": {
        "problem": "Two trains 120 km apart are moving towards each other at 40 km/h and 50 km/h. When will they meet?",
        "solution_steps": [
          "Given: Distance = 120 km, Speed₁ = 40 km/h, Speed₂ = 50 km/h",
          "Direction: Moving towards each other",
          "Relative Speed = 40 + 50 = 90 km/h",
          "Formula: Time = Distance ÷ Relative Speed",
          "Substitute: Time = 120 ÷ 90",
          "Calculate: Time = 1.33 hours",
          "Convert: 1.33 hours = 1 hour 20 minutes"
        ],
        "answer": "1 hour 20 minutes (or 1.33 hours)",
        "verification": "Distance covered by train 1: 40 × 1.33 = 53.2 km, Train 2: 50 × 1.33 = 66.8 km, Total: 120 km ✓"
      },
      "common_mistakes": [
        "Adding speeds when objects move in same direction",
        "Subtracting speeds when moving towards each other",
        "Forgetting to consider the initial distance between objects"
      ]
    }
  ],
  "key_formulas": [
    "Distance = Speed × Time",
    "Speed = Distance ÷ Time",
    "Time = Distance ÷ Speed",
    "Relative Speed (opposite directions) = S₁ + S₂",
    "Relative Speed (same direction) = |S₁ - S₂|",
    "Average Speed = Total Distance ÷ Total Time"
  ],
  "practice_tips": [
    "Always convert all measurements to the same units first",
    "Draw a diagram for complex problems with multiple objects",
    "Remember: relative speed is key when objects are moving",
    "Check if your answer makes practical sense"
  ]
}' WHERE slug = 'speed-time-distance';

-- Update remaining topics with similar detailed structure
UPDATE topics SET content = '{
  "introduction": "Ratio and Proportion problems deal with comparing quantities and their relationships. Understanding these concepts is fundamental to solving many real-world problems.",
  "key_concepts": [
    "Ratio: Comparison of two quantities",
    "Proportion: Equality of two ratios",
    "Direct and inverse proportions",
    "Ratio distribution and sharing"
  ],
  "approaches": [
    {
      "name": "Direct Proportion Method",
      "description": "When one quantity increases, the other increases proportionally. This is the most common type of proportion problem.",
      "when_to_use": "Use when quantities increase or decrease together at the same rate",
      "steps": [
        "Identify the two quantities that are proportional",
        "Set up the proportion equation: a/b = c/d",
        "Cross multiply: a × d = b × c",
        "Solve for the unknown value",
        "Verify the proportion holds true"
      ],
      "example": {
        "problem": "If 5 books cost $25, how much do 8 books cost?",
        "solution_steps": [
          "Given: 5 books = $25",
          "Need to find: Cost of 8 books",
          "Set up proportion: 5/25 = 8/x",
          "Cross multiply: 5x = 25 × 8",
          "Calculate: 5x = 200",
          "Solve: x = 200 ÷ 5 = 40"
        ],
        "answer": "$40",
        "verification": "Cost per book: $25 ÷ 5 = $5, For 8 books: 8 × $5 = $40 ✓"
      },
      "common_mistakes": [
        "Setting up the proportion incorrectly",
        "Forgetting to cross multiply",
        "Not checking if the relationship is actually proportional"
      ]
    }
  ],
  "key_formulas": [
    "If a:b = c:d, then a×d = b×c",
    "To divide amount A in ratio m:n, shares are (m/(m+n))×A and (n/(m+n))×A",
    "Direct Proportion: y = kx (k is constant)",
    "Inverse Proportion: y = k/x (k is constant)"
  ],
  "practice_tips": [
    "Always simplify ratios to lowest terms",
    "Check if the proportion is direct or inverse",
    "Use cross multiplication for quick solving",
    "Verify your answer makes logical sense"
  ]
}' WHERE slug = 'ratio-proportion';
