# User Guide

This guide explains how to use VCVQ to create and play quiz games.

## Starting a Quiz

### 1. Access the Application

Open your browser and navigate to `http://localhost:3030` (or your configured URL).

### 2. Configure Game Settings

#### Language Selection

Click the flag buttons to switch between:
- 🇸🇪 Swedish (Svenska)
- 🇬🇧 English

#### Choose a Topic

You have two options:

**Option A: Custom Topic**
- Enter your own topic in the text field
- Examples: "Science", "Movies", "Geography", "80s Music"

**Option B: Random Topics**
- Click the "🎲 Random" button
- Get 15 AI-generated funny topics
- Select one from the dropdown
- Click "🎲 Random" again to switch back to custom input

#### Number of Players (2-5)

Select how many players will participate:
- Minimum: 2 players
- Maximum: 5 players
- Default: 2 players

#### Number of Questions

Choose from:
- 5 questions (quick game)
- 10 questions (default)
- 15 questions
- 20 questions
- 25 questions
- 30 questions
- 50 questions (long game)

#### Answer Options Per Question

Choose how many answer choices each question will have:
- 4 options (easier)
- 6 options (default)
- 8 options (harder)

#### Player Names

You have two options:

**Option A: AI-Generated Names**
- Click "Generate AI Names"
- Get context-aware names based on your topic and car positions
- Examples for topic "Space": "Captain Nova", "Starship Pilot", etc.

**Option B: Custom Names**
- Manually enter each player's name
- Names are persistent when you restart the game

### 3. Start the Game

Click the "Start Quiz" button to begin!

## Playing the Game

### Game Flow

1. **Random Starting Player**
   - First question starts with a randomly selected player
   - Starting player rotates for each subsequent question
   - This ensures fair distribution

2. **Player Turns**
   - ALL players answer EACH question
   - Players answer in numerical sequence from the starting player
   - Current player is highlighted

3. **Answering Questions**
   
   You have two ways to answer:
   
   **Drag and Drop:**
   - Drag your numbered player token
   - Drop it on the answer box you want to select
   
   **Click:**
   - Click directly on the answer box
   - Your player token will automatically appear

4. **Visual Feedback**
   - Player badges appear on selected answers
   - See which players chose which answers in real-time
   - Each player has a unique color

5. **Answer Reveal**
   
   After all players have answered:
   - Results are shown for 5 seconds
   - **Green highlight** = Correct answer
   - **Red highlight** = Incorrect answer
   - Feedback message shows how many players answered correctly:
     - 🎉 "Everyone answered correctly!"
     - 😅 "No one answered correctly!"
     - "X/Y answered correctly"

6. **Next Question**
   - After the 5-second review period
   - The next question appears automatically
   - Starting player rotates to the next player

### Ending the Game Early

- Click "End Game" button at any time
- Jump directly to the final results

### Winning

1. **Scoreboard**
   - Final scores are displayed
   - Players sorted by score (highest first)
   - Ties are supported (multiple winners)

2. **Play Again**
   - Click "Play Again" to restart
   - All settings are preserved:
     - Same topic
     - Same number of players
     - Same player names
     - Same question/answer counts

## Tips for Best Experience

### For Car Trips

- **Driver should NOT play** - Safety first!
- Ideal for passengers (2-5 players)
- Works great in Tesla Model Y browser (1180x919 resolution)
- Simple touch controls work on tablets

### Topic Selection

- Be specific for better questions
  - ✅ "Marvel Cinematic Universe"
  - ❌ "Movies" (too broad)
- Try random topics for fun, unexpected quizzes
- AI generates contextual questions based on your topic

### Game Length

- **Short trip (15-30 min):** 5-10 questions
- **Medium trip (30-60 min):** 15-20 questions
- **Long trip (1+ hours):** 25-50 questions

### Player Names

- AI-generated names are contextual and fun
- Custom names are great for regular players
- Names persist when you click "Play Again"

## Scoring System

- **Correct answer:** +1 point
- **Incorrect answer:** 0 points
- **No penalty** for wrong answers
- Highest score wins
- Multiple winners possible (ties)

## Features in Detail

### Bilingual Support

The entire interface switches language when you select a flag:
- All UI text translates
- AI generates questions in the selected language
- Player names can be generated in the selected language

### AI-Generated Content

VCVQ uses Google Gemini AI to generate:
- Quiz questions based on your topic
- Answer options (with one correct answer)
- Random funny topics
- Context-aware player names

### Tesla Browser Compatibility

Special optimizations for Tesla browsers:
- Dropdown menu fixes
- Touch-optimized controls
- 1180x919 resolution optimization
- Simplified animations for performance

## Accessibility

- Large, touch-friendly buttons
- Color-coded players with numbered tokens
- Clear visual feedback
- Both drag-and-drop and click interfaces
- High contrast text

## Known Limitations

- Requires internet connection (for AI)
- Gemini API key required
- Questions are AI-generated (quality may vary)
- Not all topics may work equally well
- Maximum 5 players per game

## Troubleshooting

### Questions Not Loading

- Check your internet connection
- Verify Gemini API key is valid
- Try a different topic (some topics may not work well)
- Check server logs for errors

### Drag and Drop Not Working

- Try using click interface instead
- Ensure browser supports HTML5 drag and drop
- On touch devices, use touch-and-drag gesture

### Language Not Switching

- Refresh the page
- Clear browser cache
- Check that JavaScript is enabled

### Game Not Starting

- Ensure all required fields are filled
- Check that API key is configured
- Look for error messages on screen

## Next Steps

- [API Reference](api.md) - Technical API documentation
- [Development Guide](development.md) - Contribute to VCVQ
- [Security](../SECURITY.md) - Report security issues

