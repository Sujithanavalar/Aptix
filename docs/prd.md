# Aptix Requirements Document

## 1. Application Overview

### 1.1 Application Name
Aptix\n
### 1.2 Application Description
Aptix is an aptitude learning and problem-solving application for students, supporting free registration and login for over 4000 users, providing systematic learning content and practical testing features.

### 1.3 Application Format
- Desktop: Hosted link access or installable PWA application
- Mobile: Android APK application (mandatory), iOS application (if possible)
- Support seamless switching between desktop and mobile modes
\n## 2. Core Features
\n### 2.1 Home Page
\n#### 2.1.1 Header Section
- Display time-based greeting at the top:\n  - Morning (5:00-11:59):'Good Morning!'
  - Afternoon (12:00-16:59): 'Good Afternoon!'
  - Evening (17:00-20:59): 'Good Evening!'
  - Night (21:00-4:59): 'Good Night!'
- Show rotating motivational quotes below greeting, such as:
  - 'Success is the sum of small efforts repeated day in and day out.'
  - 'The expert in anything was once a beginner.'
  - 'Practice makes progress, not perfection.'
  - 'Every problem is a gift—without problems we would not grow.'
- **Cute Brain Character**: Display a small animated brain character positioned to the left of the motivational quotes
  - Character design: Cute brain with small eyes, hands, and legs
  - Size: 64px × 64px
  - Style: Consistent with app's linear icon style, using primary color palette (#2C3E50 and #E67E22)
  - Animation: Subtle idle animation (gentle bounce or blink) to add personality
  - Positioning: 16px left margin from quote text, vertically centered
- **Streak Counter**: Display at top right corner of navigation bar, positioned left of settings icon
  - Icon: Yellow lightning bolt with glowing effect when streak is active
  - Active state (streak > 0): Bright yellow (#F1C40F) with subtle glow effect (box-shadow: 0 0 8px rgba(241, 196, 15, 0.6))
  - Inactive state (streak = 0): Colorless/gray (#95A5A6) with no glow effect
  - Display format: Lightning icon followed by number (e.g., '⚡ 7')
  - Tooltip on hover: 'X days streak! Keep it up!' or 'Start your streak today!' (when0)\n  - Size: Icon24px × 24px, number font-size 16px, bold weight
  - Spacing: 24px right margin from settings icon, 16px padding around content
- Settings icon positioned at top right corner\n\n#### 2.1.2 Settings Menu
Clicking the settings icon reveals dropdown menu with following options:
\n**User Profile**
- Display user details: username, email, registration date\n- Show comprehensive progress statistics:\n  - Total questions solved
  - Overall average score
  - Total time spent learning
  - **Current streak count**: Display continuous daily login streak with lightning icon
  - Topic-wise performance breakdown
  - Weekly progress graph: Line chart displaying daily performance metrics for the past 7 days (questions solved, average score, time spent, daily streak status)
-'Share Progress' button: generates both shareable image and shareable link containing:
  - User's achievement scores
  - Shortest time consumption data
  - Weekly performance graph
  - Total questions solved and overall statistics
  - Current streak count
  - Branded Aptix footer with timestamp

**About**
- Opens dedicated page describing:
  - Application purpose and mission
  - Key features overview
  - Development team information
  - Version number\n\n**Switch to Mobile/Desktop Mode**
- Toggle button to switch between desktop and mobile layouts
- Desktop mode: Grid layout with 4 topic boxes per row
- Mobile mode: Single-column responsive layout with 1 topic box per row, optimized touch interactions
- Mode preference saved for future sessions

**Feedback**
- Opens popup modal containing:
  - 5-star rating system (clickable stars)
  - Text area for detailed feedback (placeholder: 'Share your thoughts with us...')
  - Submit button\n  - Thank you message after submission
\n**Sign Out**
- Logs user out and returns to login page
- Confirmation prompt: 'Are you sure you want to sign out?'
\n#### 2.1.3 User Progress Dashboard
Display rectangular progress boxes with enlarged icons (icon size: 48px × 48px), containing:
- Average time taken to solve questions (clock icon)
- Number of questions solved today (checkmark icon)
- Average score - correct answer rate for10 questions (trophy icon)
- **Current streak count** (lightning bolt icon)
- Ensure real-time data synchronization and accurate calculation
- All progress boxes aligned in a single row on desktop (4 boxes), stacked vertically on mobile
- Consistent box dimensions, padding (16px), and spacing (12px gap between boxes)
- Icons centered at top of each box, metric value below icon, label text at bottom
- Uniform typography: metric value (24px bold), label text (14px regular)\n\n#### 2.1.4 Main Entry Buttons
Display 2 prominent action buttons:
- Start learning!\n- Solve Problems

### 2.2 Learning Module (Start learning!)

#### 2.2.1 Learning Topics List
Provide the following8 topics with distinctive colored icons (4 boxes per row on desktop, 1 box per row on mobile):
- Ages (icon: hourglass, color: #9B59B6 purple)
- Speed, Time and Distance (icon: speedometer, color: #E67E22 orange)
- Ratio and Proportion (icon: balance scale, color: #16A085 teal)\n- Arithmetic Progression (icon: ascending staircase, color: #27AE60 green)\n- Surds and Indices (icon: square root symbol, color: #3498DB blue)
- Boats and Streams (icon: boat with water flow, color: #1ABC9C turquoise)
- Pipes and Cisterns (icon: water pipe, color: #F39C12 amber)
- Allegation and Mixtures (icon: beaker, color: #E74C3C red)

#### 2.2.2 Recent Tests Section
Display below the learning topics list:
- Section title: 'Recent Tests'
- Show list of recently performed tests (up to 10 most recent entries)
- Each test entry displays:
  - Topic name with corresponding colored icon
  - Time taken (format: MM:SS or HH:MM:SS)
  - Score earned (format: X/Total)
  - Test completion date and time
- Desktop layout: Table format with columns (Topic, Time Taken, Score, Date)
- Mobile layout: Card-based list with stacked information
- Click on any test entry to view detailed test results
- If no tests performed yet, display message: 'No recent tests. Start your first test now!'

#### 2.2.3 Topic Learning Page
After clicking a topic, display:
\n**Video Tutorial Section**
- Embed responsive YouTube video player at the top of the learning page
- Video dimensions: 16:9 aspect ratio, width adapts to container (max-width: 800px on desktop,100% on mobile)
- Video controls enabled (play, pause, volume, fullscreen)
- Topic-specific video links:\n  - Ages: https://youtu.be/viKaYznFJbw?si=TIz-icJl5u0M_new
  - Speed, Time and Distance: https://youtu.be/Z4aRxGL4ltU?si=WiU4yfktYqm_cjsY
  - Ratio and Proportion: https://youtu.be/xRLNYich5Ls?si=Ol7AisjRUvPkBopf
  - Arithmetic Progression: https://youtu.be/fwUMJhTDGog?si=fmZRFUrsiBbcnteA
  - Surds and Indices: https://youtu.be/6xQCumDHOFA?si=LmD2fPRqC4wlrGEa
  - Boats and Streams: https://youtu.be/Agnaf5cv9lY?si=v3d2fPRqC4wlrGEa
  - Pipes and Cisterns: https://youtu.be/j6vo6d6H6Ho?si=LmD-xUWwcouvf78b
  - Allegation and Mixtures: https://youtu.be/PQ8ux_3hdT4?si=sVwXnaXbUMhKeT-4
- Video player positioned with 16px margin below topic title and 24px margin above text content
- Fallback message displayed if video fails to load: 'Video unavailable. Please check your connection.'

**Learning Content Section**
- Topic definition\n- Classification of problem-solving approaches for each type
- Detailed step-by-step explanation for each approach (with example problems and step-by-step solutions)
\nBelow the learning content, show:\n- Prompt text: 'Finished learning? Shall we practice/solve problems?'
- 2 buttons: Practice Problems, Solve Problems

#### 2.2.4 Practice Mode (Practice Problems)
- Display 10 questions one by one
- Immediately show correctness after user selects answer (green/red indicator)
- Provide 'View Solution' button below each question, displaying detailed step-by-step solution
- Show brief explanation for both correct and incorrect answers
- After completion, display total score (X/10) with encouraging or appreciative message

### 2.3 Testing Module (Solve Problems)\n
#### 2.3.1 Test Homepage
- Display user progress information at the top
- Show 8 learning topic boxes with colored icons
\n#### 2.3.2 Test Configuration
After clicking a topic, select in sequence:
\n**1. Difficulty Level Selection with Progressive Unlock System**
- Three difficulty levels: Easy, Medium, Hard
- **Unlock Logic**:
  - **Easy**: Unlocked by default for all users
  - **Medium**: Unlocked only when user scores ≥ 80% in any Easy level test for the selected topic
  - **Hard**: Unlocked only when user scores ≥ 80% in any Medium level test for the selected topic\n- **UI Display**:
  - Unlocked levels: Display with full color and clickable state
  - Locked levels: Display with reduced opacity (40%), grayscale filter, and lock icon overlay (24px × 24px padlock icon centered on difficulty button)
  - Lock icon color: #95A5A6 (gray)\n  - Tooltip on hover over locked level: 'Complete [Previous Level] with80%+ score to unlock' (e.g., 'Complete Easy with 80%+ score to unlock Medium')
- **Persistence**: Once a level is unlocked, it remains unlocked permanently for that topic
- **Per-Topic Tracking**: Unlock status is tracked separately for each of the 8 topics
\n**2. Number of Questions**
- Select from: 10, 20, 30, 40, 50 questions
- Only available after difficulty level is selected and unlocked

**3. Timer Mode Toggle**
- Timer on: Automatically allocate time based on question count (1 minute per question, e.g., 10 questions = 10 minutes)
- Timer off: No time limit\n- Only available after question count is selected

#### 2.3.3 Test Instruction Page
Display instructions before starting:\n- No other activities during test
- No switching to other browsers or pages
- Blessing: 'All the best!'
- Click 'Start Test' button to enter test\n
#### 2.3.4 Test Window
- Display countdown timer at top right corner (if timer enabled)
- Support navigation between questions\n- Allow re-selection of answers\n- Strict anti-cheating mechanism: clicking anywhere outside the page will terminate the test and not count toward results
- No correctness indicators during test, no'View Solution' feature

#### 2.3.5 Test Results Page
After clicking 'Submit Test', display:
- Test score\n- Time taken
- **Level Unlock Notification**: If score ≥ 80%, display congratulatory message with unlock notification:\n  - For Easy level: 'Congratulations! You scored [X]%! Medium level is now unlocked for this topic.'
  - For Medium level: 'Excellent work! You scored [X]%! Hard level is now unlocked for this topic.'
  - For Hard level: 'Outstanding! You scored [X]%! You have mastered all difficulty levels for this topic.'
- If score < 80%, display encouraging message: 'You scored [X]%. Keep practicing to unlock the next level! (80%+ required)'
- Targeted suggestions (if improvement needed in time or accuracy)\n- Encouraging or appreciative message (when all correct)\n
## 3. User System

### 3.1 Registration/Login
- Support free registration and login for 4000+ users\n- Integrate necessary production-level backend services
\n### 3.2 User Progress Tracking
- Automatically record test scores and time taken
- Calculate and update progress data in real-time on user homepage (average solving time, today's question count, average score, current streak count)
- Ensure accurate data persistence and synchronization across sessions
- Track topic-wise performance for detailed analytics
- Generate weekly progress graphs showing daily performance trends including streak status
- Store shortest time consumption records for each topic and difficulty level
- Store and retrieve recent test history (up to 10 most recent tests) for display in Recent Tests Section
- **Track daily login streak**: Record consecutive days user logs in, reset to 0 if user misses a day
- Update streak counter in real-time upon daily login
- Store streak data persistently in user profile
- Include streak count in all progress analysis displays and shareable progress reports
- **Difficulty Level Unlock Tracking**:
  - Store highest score achieved for each difficulty level (Easy, Medium, Hard) per topic
  - Track unlock status for Medium and Hard levels per topic
  - Persist unlock status permanently once achieved (never reset)
  - Provide API endpoint to retrieve unlock status for each topic and difficulty level
  - Update unlock status immediately after test completion if score ≥ 80%

## 4. Design Style

### 4.1 Overall Style
Structured, minimalist, professional and aesthetically pleasing\n
### 4.2 Color Scheme
- Primary palette: Blue to Orange gradient (#2C3E50 deep blue → #E67E22 vibrant orange)
- Background: Light gray-white (#F8F9FA)\n- Topic icons: Diverse colors (purple, teal, green, turquoise, amber, red) while maintaining visual consistency through unified icon style
- Accent highlights: Fresh green (#27AE60) for positive feedback\n- Streak active state: Bright yellow (#F1C40F) with glow effect
- Streak inactive state: Gray (#95A5A6)\n- Locked state: Gray (#95A5A6) with 40% opacity and grayscale filter
\n### 4.3 Layout Approach
- Desktop mode: Grid layout, 4 topic boxes per row\n- Mobile mode: Single-column card layout, 1 topic box per row, responsive touch-friendly design
- Adaptive spacing and font sizes based on screen dimensions
- Navigation bar: Flexbox layout with streak counter and settings icon aligned to the right, maintaining24px spacing between elements
- **Progress Dashboard**: Flexbox layout with equal-width boxes, consistent 12px gap,16px internal padding, perfect vertical and horizontal alignment
- **Difficulty Selection**: Horizontal button group with equal widths, lock icon overlay centered on locked buttons\n\n### 4.4 Visual Details
- Border radius: 8px, soft yet professional
- Button shadow: 0 2px 4px rgba(0,0,0,0.1), enhancing depth\n- Icon style: Linear icons with 2px stroke width, clean and modern
- User progress box icons: Enlarged to 48px × 48px for better visibility
- Transition animation: 0.3s ease-in-out, smooth and natural
- Video tutorial button: No hover effect (removed yellow hover state)
- **Brain character animation**: Subtle 2s infinite loop with gentle bounce (translateY:0→ -4px → 0)\n- **Streak glow effect**: Smooth pulsing animation (0 0 8px → 0 0 12px → 0 0 8px) with 2s duration for active state
- **Progress boxes alignment**: CSS Grid or Flexbox with justify-content: space-between, align-items: stretch for perfect alignment
- **Locked level visual**: Grayscale filter (100%), opacity 40%, lock icon with 2px stroke, no hover effect on locked buttons

### 4.5 App Icon and Topic Icons
- App icon: Creative design featuring a brain integrated with logic circuit patterns or geometric puzzle elements, using the primary color palette (deep blue #2C3E50 and vibrant orange #E67E22)
- Topic-specific icons with distinctive colors:
  - Ages: Hourglass icon (#9B59B6 purple)\n  - Speed, Time and Distance: Speedometer icon (#E67E22 orange)
  - Ratio and Proportion: Balance scale icon (#16A085 teal)
  - Arithmetic Progression: Ascending staircase icon (#27AE60 green)
  - Surds and Indices: Square root symbol icon (#3498DB blue)
  - Boats and Streams: Boat with water flow icon (#1ABC9C turquoise)
  - Pipes and Cisterns: Water pipe icon (#F39C12 amber)\n  - Allegation and Mixtures: Beaker icon (#E74C3C red)
- All icons maintain consistent linear style with 2px stroke width\n- Icons use appropriate contrast ratios for accessibility
- **Brain character**: Cute brain design with small eyes, hands, and legs, using primary color palette with linear style consistency
- **Lock icon**: 24px × 24px padlock icon in gray (#95A5A6) with 2px stroke width\n
### 4.6 Interactive Feedback
- Correct answer: Green highlight (#27AE60)
- Wrong answer: Red highlight (#E74C3C)
- Button hover: Slight scale up (scale1.02) + deepened shadow (except video tutorial button and locked difficulty buttons)
- Star rating: Gold color (#F1C40F) on hover and selection
- Page transition: Smooth fade and slide animations
- Streak counter hover: Tooltip appears with fade-in animation (0.2s)
- Brain character hover: Slight scale up (scale 1.05) with playful wiggle animation
- Locked difficulty button hover: Tooltip appears explaining unlock requirement, no scale or shadow effect
- Unlock notification: Celebratory animation (confetti or badge reveal) when new level is unlocked

## 5. Technical Requirements

### 5.1 Frontend
- Desktop: Support PWA installation\n- Mobile: Android APK (mandatory), iOS (if possible)
- Responsive design with efficient mode switching functionality
- Local storage for user preferences (theme mode, settings)
- YouTube iframe API integration for video embedding with responsive container
- Chart.js or similar library for rendering weekly progress graphs
- Social sharing API integration for generating shareable links and images
- CSS animations for brain character and streak glow effects
- SVG or icon font for brain character, lightning bolt icon, and lock icon
- **CSS Grid/Flexbox** for progress dashboard with perfect alignment (equal widths, consistent spacing, centered content)
- **Conditional rendering** for difficulty level buttons based on unlock status
- **Grayscale filter and opacity** for locked difficulty buttons with lock icon overlay
\n### 5.2 Backend
- Integrate production-level backend services
- Support 4000+ concurrent users\n- Persistent storage for user progress and test records
- Real-time data synchronization for progress tracking
- Secure API endpoints for user profile and feedback submission
- Generate unique shareable links for progress reports with expiration settings
- Store and retrieve weekly performance data for graph generation including streak information
- Track and store shortest time consumption records per user, topic, and difficulty\n- Store recent test history with topic name, time taken, score, and completion timestamp
- Provide API endpoint to retrieve recent tests list for display in learning page
- **Streak tracking system**: Record daily login timestamps, calculate consecutive days, reset logic for missed days
- API endpoint to retrieve and update streak count in real-time
- Include streak data in all progress analysis API responses
- **Difficulty unlock system**:
  - Store highest score for each difficulty level (Easy, Medium, Hard) per topic per user
  - Track unlock status for Medium and Hard levels per topic per user
  - API endpoint to check unlock status before allowing test configuration
  - API endpoint to update unlock status after test completion (if score ≥ 80%)
  - Ensure unlock status persists permanently and is never reset
  - Validate unlock requirements server-side to prevent unauthorized access to locked levels

### 5.3 Anti-Cheating Mechanism
- Test window focus detection\n- Automatic test termination when leaving page
- Invalid test results not counted\n\n### 5.4 Data Accuracy
- Implement robust calculation algorithms for progress metrics
- Validate data integrity on both client and server sides
- Error handling for edge cases in progress tracking
- Accurate tracking of achievement scores and time consumption data for sharing features
- Precise streak calculation with timezone consideration to ensure accurate daily login tracking
- Ensure streak data is consistently displayed across all progress views with proper alignment
- **Accurate unlock logic**: Verify score threshold (≥ 80%) before unlocking next level, ensure unlock status is correctly persisted and retrieved