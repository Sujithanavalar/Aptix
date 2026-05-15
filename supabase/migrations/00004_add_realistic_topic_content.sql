/*
# Add Realistic Educational Content for Topics

Replace placeholder content with actual mathematical concepts, formulas, and techniques
used in aptitude tests. Focus on real learning value.
*/

-- Ages Topic
UPDATE topics SET content = '{
  "introduction": "Age problems form equations based on relationships between ages at different time periods. The key principle: age differences remain constant over time.",
  "key_concepts": [
    "Age difference = Constant (never changes)",
    "Present age ± n years = Past/Future age",
    "Ratio problems: Express ages as multiples of a variable",
    "n years ago: Subtract n from current age"
  ],
  "approaches": [
    {
      "name": "Variable Assignment Method",
      "description": "Assign variables to unknown ages and form equations based on given conditions.",
      "steps": [
        "Let the unknown age = x",
        "Express other ages in terms of x using given relationships",
        "Form equation from the problem statement",
        "Solve for x",
        "Calculate required age"
      ],
      "example": {
        "problem": "A father is 3 times as old as his son. After 12 years, his age will be twice that of his son. Find their present ages.",
        "solution_steps": [
          "Let son''s present age = x years",
          "Father''s present age = 3x years",
          "After 12 years: Son = x + 12, Father = 3x + 12",
          "Given: 3x + 12 = 2(x + 12)",
          "3x + 12 = 2x + 24",
          "x = 12",
          "Son''s age = 12 years, Father''s age = 36 years"
        ],
        "answer": "Son: 12 years, Father: 36 years"
      }
    },
    {
      "name": "Ratio-Based Method",
      "description": "Use ratio multipliers when ages are given in proportion.",
      "steps": [
        "Express ratio as ax and bx",
        "Write ages at different times using the multiplier",
        "Form equation from second condition",
        "Solve for x",
        "Calculate actual ages"
      ],
      "example": {
        "problem": "Ages of A and B are in ratio 5:3. After 6 years, ratio becomes 7:5. Find their present ages.",
        "solution_steps": [
          "Let A = 5x and B = 3x",
          "After 6 years: A = 5x + 6, B = 3x + 6",
          "(5x + 6)/(3x + 6) = 7/5",
          "5(5x + 6) = 7(3x + 6)",
          "25x + 30 = 21x + 42",
          "4x = 12, so x = 3",
          "A = 15 years, B = 9 years"
        ],
        "answer": "A: 15 years, B: 9 years"
      }
    }
  ],
  "key_formulas": [
    "If A is n years older: A = B + n",
    "Age n years ago: Current age - n",
    "Age after n years: Current age + n",
    "Ratio a:b → Express as ax and bx"
  ]
}' WHERE slug = 'ages';

-- Speed, Time, Distance
UPDATE topics SET content = '{
  "introduction": "All motion problems are based on the fundamental relationship: Distance = Speed × Time. Understanding this formula and its variations solves most problems.",
  "key_concepts": [
    "Distance = Speed × Time",
    "Speed = Distance / Time",
    "Time = Distance / Speed",
    "Relative Speed: Add when opposite, subtract when same direction"
  ],
  "approaches": [
    {
      "name": "Direct Formula Application",
      "description": "Apply D = S × T directly when two quantities are known.",
      "steps": [
        "Identify given: Distance, Speed, or Time",
        "Choose appropriate formula variant",
        "Convert units if needed (km/h ↔ m/s: multiply/divide by 5/18)",
        "Substitute and calculate"
      ],
      "example": {
        "problem": "A train travels 360 km at 90 km/h. How long does it take?",
        "solution_steps": [
          "Given: Distance = 360 km, Speed = 90 km/h",
          "Required: Time",
          "Formula: Time = Distance / Speed",
          "Time = 360 / 90 = 4 hours"
        ],
        "answer": "4 hours"
      }
    },
    {
      "name": "Relative Speed Method",
      "description": "Calculate effective speed when two objects are in motion.",
      "steps": [
        "Identify direction: same or opposite",
        "Opposite direction: Relative Speed = S₁ + S₂",
        "Same direction: Relative Speed = |S₁ - S₂|",
        "Apply D = S × T with relative speed"
      ],
      "example": {
        "problem": "Two trains 200 km apart travel towards each other at 50 km/h and 30 km/h. When do they meet?",
        "solution_steps": [
          "Distance between trains = 200 km",
          "Moving towards each other (opposite direction)",
          "Relative Speed = 50 + 30 = 80 km/h",
          "Time = Distance / Relative Speed",
          "Time = 200 / 80 = 2.5 hours"
        ],
        "answer": "2.5 hours (2 hours 30 minutes)"
      }
    },
    {
      "name": "Average Speed Calculation",
      "description": "When speed varies, average speed = Total Distance / Total Time (NOT average of speeds).",
      "steps": [
        "Calculate total distance covered",
        "Calculate total time taken",
        "Average Speed = Total Distance / Total Time"
      ],
      "example": {
        "problem": "A car travels 60 km at 30 km/h and returns at 60 km/h. Find average speed.",
        "solution_steps": [
          "Total distance = 60 + 60 = 120 km",
          "Time for first half = 60/30 = 2 hours",
          "Time for return = 60/60 = 1 hour",
          "Total time = 2 + 1 = 3 hours",
          "Average speed = 120/3 = 40 km/h"
        ],
        "answer": "40 km/h (Note: NOT 45 km/h)"
      }
    }
  ],
  "key_formulas": [
    "D = S × T, S = D/T, T = D/S",
    "km/h to m/s: multiply by 5/18",
    "m/s to km/h: multiply by 18/5",
    "Relative Speed (opposite): S₁ + S₂",
    "Relative Speed (same): |S₁ - S₂|",
    "Average Speed = Total Distance / Total Time"
  ]
}' WHERE slug = 'speed-time-distance';

-- Ratio and Proportion
UPDATE topics SET content = '{
  "introduction": "Ratio compares quantities. Proportion states equality of ratios. Master these to solve distribution, mixture, and scaling problems.",
  "key_concepts": [
    "Ratio a:b means a/b",
    "Proportion: a:b = c:d → a×d = b×c (cross multiplication)",
    "To divide N in ratio a:b → shares are (a/(a+b))×N and (b/(a+b))×N",
    "Compound ratio: (a:b) and (c:d) → ac:bd"
  ],
  "approaches": [
    {
      "name": "Cross Multiplication",
      "description": "Standard method for solving proportions.",
      "steps": [
        "Set up proportion: a/b = c/d",
        "Cross multiply: a × d = b × c",
        "Solve for unknown"
      ],
      "example": {
        "problem": "If 15 workers complete a job in 12 days, how many days will 20 workers take?",
        "solution_steps": [
          "More workers → Less time (inverse proportion)",
          "15 workers : 12 days = 20 workers : x days",
          "15 × 12 = 20 × x",
          "180 = 20x",
          "x = 9 days"
        ],
        "answer": "9 days"
      }
    },
    {
      "name": "Ratio Distribution",
      "description": "Divide a quantity in given ratio.",
      "steps": [
        "Add ratio parts: a + b + c + ...",
        "Each share = (ratio part / sum) × total",
        "Calculate individual shares"
      ],
      "example": {
        "problem": "Divide $850 among A, B, C in ratio 2:3:12.",
        "solution_steps": [
          "Sum of ratio = 2 + 3 + 12 = 17",
          "A''s share = (2/17) × 850 = $100",
          "B''s share = (3/17) × 850 = $150",
          "C''s share = (12/17) × 850 = $600"
        ],
        "answer": "A: $100, B: $150, C: $600"
      }
    }
  ],
  "key_formulas": [
    "a:b = c:d ⟹ ad = bc",
    "Divide N in ratio a:b → (a/(a+b))N and (b/(a+b))N",
    "Compound ratio (a:b)(c:d) = ac:bd",
    "Inverse proportion: a₁b₁ = a₂b₂"
  ]
}' WHERE slug = 'ratio-proportion';

-- Arithmetic Progression
UPDATE topics SET content = '{
  "introduction": "An Arithmetic Progression (AP) is a sequence where each term differs from the previous by a constant value called common difference (d).",
  "key_concepts": [
    "General form: a, a+d, a+2d, a+3d, ...",
    "nth term: aₙ = a + (n-1)d",
    "Sum of n terms: Sₙ = (n/2)[2a + (n-1)d] or Sₙ = (n/2)(first + last)",
    "Common difference d = aₙ - aₙ₋₁"
  ],
  "approaches": [
    {
      "name": "Finding nth Term",
      "description": "Use the nth term formula to find any term in the sequence.",
      "steps": [
        "Identify first term (a) and common difference (d)",
        "Apply formula: aₙ = a + (n-1)d",
        "Substitute values and calculate"
      ],
      "example": {
        "problem": "Find the 20th term of AP: 5, 8, 11, 14, ...",
        "solution_steps": [
          "First term a = 5",
          "Common difference d = 8 - 5 = 3",
          "n = 20",
          "a₂₀ = 5 + (20-1)×3",
          "a₂₀ = 5 + 57 = 62"
        ],
        "answer": "62"
      }
    },
    {
      "name": "Sum of n Terms",
      "description": "Calculate sum of first n terms using sum formula.",
      "steps": [
        "Find a (first term) and d (common difference)",
        "Use Sₙ = (n/2)[2a + (n-1)d]",
        "Or if last term known: Sₙ = (n/2)(first + last)"
      ],
      "example": {
        "problem": "Find sum of first 15 terms of AP: 3, 7, 11, 15, ...",
        "solution_steps": [
          "a = 3, d = 4, n = 15",
          "Sₙ = (n/2)[2a + (n-1)d]",
          "S₁₅ = (15/2)[2×3 + 14×4]",
          "S₁₅ = 7.5[6 + 56]",
          "S₁₅ = 7.5 × 62 = 465"
        ],
        "answer": "465"
      }
    }
  ],
  "key_formulas": [
    "nth term: aₙ = a + (n-1)d",
    "Sum: Sₙ = (n/2)[2a + (n-1)d]",
    "Sum: Sₙ = (n/2)(first + last)",
    "Common difference: d = a₂ - a₁"
  ]
}' WHERE slug = 'arithmetic-progression';

-- Surds and Indices
UPDATE topics SET content = '{
  "introduction": "Surds are irrational roots (√2, ∛5). Indices are exponents (aⁿ). Master the laws to simplify complex expressions.",
  "key_concepts": [
    "Surd: √a where a is not a perfect square",
    "Laws of indices: aᵐ × aⁿ = aᵐ⁺ⁿ, aᵐ / aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ",
    "a⁰ = 1, a⁻ⁿ = 1/aⁿ, a^(1/n) = ⁿ√a",
    "Rationalization: Multiply by conjugate to remove surd from denominator"
  ],
  "approaches": [
    {
      "name": "Simplifying Surds",
      "description": "Express surds in simplest form by factoring out perfect squares.",
      "steps": [
        "Factor the number under the root",
        "Identify perfect square factors",
        "Take square root of perfect squares outside",
        "Simplify"
      ],
      "example": {
        "problem": "Simplify √72",
        "solution_steps": [
          "72 = 36 × 2",
          "√72 = √(36 × 2)",
          "√72 = √36 × √2",
          "√72 = 6√2"
        ],
        "answer": "6√2"
      }
    },
    {
      "name": "Applying Index Laws",
      "description": "Use exponent rules to simplify expressions.",
      "steps": [
        "Identify the index law applicable",
        "Apply: aᵐ × aⁿ = aᵐ⁺ⁿ or aᵐ / aⁿ = aᵐ⁻ⁿ",
        "Simplify the result"
      ],
      "example": {
        "problem": "Simplify: (2³ × 2⁵) / 2⁴",
        "solution_steps": [
          "Numerator: 2³ × 2⁵ = 2³⁺⁵ = 2⁸",
          "Division: 2⁸ / 2⁴ = 2⁸⁻⁴ = 2⁴",
          "2⁴ = 16"
        ],
        "answer": "16"
      }
    },
    {
      "name": "Rationalization",
      "description": "Remove surds from denominators by multiplying by conjugate.",
      "steps": [
        "Identify the surd in denominator",
        "Multiply numerator and denominator by conjugate",
        "Simplify using (a+b)(a-b) = a² - b²"
      ],
      "example": {
        "problem": "Rationalize: 1/(√5 - 2)",
        "solution_steps": [
          "Conjugate of (√5 - 2) is (√5 + 2)",
          "Multiply: [1/(√5-2)] × [(√5+2)/(√5+2)]",
          "= (√5 + 2) / [(√5)² - 2²]",
          "= (√5 + 2) / (5 - 4)",
          "= √5 + 2"
        ],
        "answer": "√5 + 2"
      }
    }
  ],
  "key_formulas": [
    "aᵐ × aⁿ = aᵐ⁺ⁿ",
    "aᵐ / aⁿ = aᵐ⁻ⁿ",
    "(aᵐ)ⁿ = aᵐⁿ",
    "a⁰ = 1, a⁻ⁿ = 1/aⁿ",
    "√(a×b) = √a × √b",
    "(a+√b)(a-√b) = a² - b"
  ]
}' WHERE slug = 'surds-indices';

-- Boats and Streams
UPDATE topics SET content = '{
  "introduction": "Boat problems involve calculating effective speed in flowing water. Downstream speed increases, upstream speed decreases by stream speed.",
  "key_concepts": [
    "Downstream speed = Boat speed + Stream speed",
    "Upstream speed = Boat speed - Stream speed",
    "Boat speed in still water = (Downstream + Upstream) / 2",
    "Stream speed = (Downstream - Upstream) / 2"
  ],
  "approaches": [
    {
      "name": "Finding Boat and Stream Speed",
      "description": "Calculate individual speeds from downstream and upstream speeds.",
      "steps": [
        "Let boat speed = b, stream speed = s",
        "Downstream = b + s, Upstream = b - s",
        "Add equations: 2b = Downstream + Upstream",
        "Subtract equations: 2s = Downstream - Upstream"
      ],
      "example": {
        "problem": "A boat travels 20 km downstream in 2 hours and upstream in 4 hours. Find boat and stream speeds.",
        "solution_steps": [
          "Downstream speed = 20/2 = 10 km/h",
          "Upstream speed = 20/4 = 5 km/h",
          "Boat speed = (10 + 5)/2 = 7.5 km/h",
          "Stream speed = (10 - 5)/2 = 2.5 km/h"
        ],
        "answer": "Boat: 7.5 km/h, Stream: 2.5 km/h"
      }
    },
    {
      "name": "Time and Distance Calculation",
      "description": "Calculate time or distance using effective speeds.",
      "steps": [
        "Determine direction: downstream or upstream",
        "Calculate effective speed",
        "Apply D = S × T"
      ],
      "example": {
        "problem": "Boat speed 15 km/h, stream 3 km/h. Time to travel 36 km downstream?",
        "solution_steps": [
          "Downstream speed = 15 + 3 = 18 km/h",
          "Distance = 36 km",
          "Time = Distance / Speed",
          "Time = 36 / 18 = 2 hours"
        ],
        "answer": "2 hours"
      }
    }
  ],
  "key_formulas": [
    "Downstream = Boat + Stream",
    "Upstream = Boat - Stream",
    "Boat = (Downstream + Upstream) / 2",
    "Stream = (Downstream - Upstream) / 2"
  ]
}' WHERE slug = 'boats-streams';

-- Pipes and Cisterns
UPDATE topics SET content = '{
  "introduction": "Pipes fill or empty tanks at certain rates. Work done = Rate × Time. Multiple pipes working together: add rates for filling, subtract for emptying.",
  "key_concepts": [
    "If pipe fills in n hours, rate = 1/n per hour",
    "Combined rate = Sum of individual rates",
    "Emptying pipe: negative rate",
    "Time to fill = 1 / Combined rate"
  ],
  "approaches": [
    {
      "name": "Single Pipe Calculation",
      "description": "Calculate time or rate for one pipe.",
      "steps": [
        "If fills in n hours → rate = 1/n per hour",
        "Work done = Rate × Time",
        "Time = Work / Rate"
      ],
      "example": {
        "problem": "Pipe A fills tank in 6 hours. What fraction fills in 2 hours?",
        "solution_steps": [
          "Rate of pipe A = 1/6 per hour",
          "Time = 2 hours",
          "Work done = (1/6) × 2 = 2/6 = 1/3",
          "Tank is 1/3 full"
        ],
        "answer": "1/3 of tank"
      }
    },
    {
      "name": "Multiple Pipes Together",
      "description": "Calculate combined filling/emptying time.",
      "steps": [
        "Find rate of each pipe (1/time)",
        "Add rates for filling pipes",
        "Subtract rates for emptying pipes",
        "Time = 1 / Combined rate"
      ],
      "example": {
        "problem": "Pipe A fills in 4 hours, Pipe B in 6 hours. Time to fill together?",
        "solution_steps": [
          "Rate of A = 1/4 per hour",
          "Rate of B = 1/6 per hour",
          "Combined rate = 1/4 + 1/6 = 3/12 + 2/12 = 5/12",
          "Time = 1 / (5/12) = 12/5 = 2.4 hours"
        ],
        "answer": "2.4 hours (2 hours 24 minutes)"
      }
    },
    {
      "name": "Filling and Emptying Together",
      "description": "Handle pipes that fill and empty simultaneously.",
      "steps": [
        "Calculate filling rate (positive)",
        "Calculate emptying rate (negative)",
        "Net rate = Filling rate - Emptying rate",
        "Time = 1 / Net rate"
      ],
      "example": {
        "problem": "Pipe fills in 3 hours, drain empties in 5 hours. Time to fill with both open?",
        "solution_steps": [
          "Filling rate = 1/3 per hour",
          "Emptying rate = 1/5 per hour",
          "Net rate = 1/3 - 1/5 = 5/15 - 3/15 = 2/15",
          "Time = 1 / (2/15) = 15/2 = 7.5 hours"
        ],
        "answer": "7.5 hours"
      }
    }
  ],
  "key_formulas": [
    "Rate = 1 / Time to complete",
    "Combined rate = Rate₁ + Rate₂ + ...",
    "Time together = 1 / Combined rate",
    "Emptying: subtract rate"
  ]
}' WHERE slug = 'pipes-cisterns';

-- Allegation and Mixtures
UPDATE topics SET content = '{
  "introduction": "Allegation finds the ratio of mixing two ingredients to achieve a desired average. Used for mixtures, alloys, and average problems.",
  "key_concepts": [
    "Mean price lies between two ingredient prices",
    "Ratio = (Dearer - Mean) : (Mean - Cheaper)",
    "Cross-method: Subtract diagonally",
    "Final mixture = Sum of individual quantities"
  ],
  "approaches": [
    {
      "name": "Allegation Rule",
      "description": "Find mixing ratio using the allegation formula.",
      "steps": [
        "Identify cheaper price (C), dearer price (D), mean price (M)",
        "Calculate: (D - M) and (M - C)",
        "Ratio = (D - M) : (M - C)",
        "Simplify ratio"
      ],
      "example": {
        "problem": "Mix rice at $6/kg and $4/kg to get mixture at $5/kg. Find ratio.",
        "solution_steps": [
          "Dearer (D) = $6, Cheaper (C) = $4, Mean (M) = $5",
          "D - M = 6 - 5 = 1",
          "M - C = 5 - 4 = 1",
          "Ratio = 1 : 1",
          "Mix in equal quantities"
        ],
        "answer": "1:1 ratio"
      }
    },
    {
      "name": "Mixture Replacement",
      "description": "Calculate concentration after replacing part of mixture.",
      "steps": [
        "Initial concentration = (quantity/total) × 100%",
        "After removal: remaining = total - removed",
        "After adding: new concentration calculation",
        "Final concentration = (final quantity/total) × 100%"
      ],
      "example": {
        "problem": "20L vessel has 20% alcohol. Replace 4L with water. Find new concentration.",
        "solution_steps": [
          "Initial alcohol = 20% of 20L = 4L",
          "4L removed contains: 20% of 4L = 0.8L alcohol",
          "Remaining alcohol = 4 - 0.8 = 3.2L",
          "Total volume = 20L (4L removed, 4L water added)",
          "New concentration = (3.2/20) × 100% = 16%"
        ],
        "answer": "16%"
      }
    }
  ],
  "key_formulas": [
    "Allegation ratio = (D - M) : (M - C)",
    "Where D = Dearer, C = Cheaper, M = Mean",
    "Concentration = (Quantity/Total) × 100%",
    "After n replacements: Final = Initial × (1 - r/V)ⁿ"
  ]
}' WHERE slug = 'allegation-mixtures';
