# Fitness Application Development Prompt

## Project Overview
Build a comprehensive fitness tracking and management web application with AI-powered workout generation, progress analytics, nutrition tracking, and personalized coaching. The application should be a modern, responsive web app with both frontend and backend components.

## Technical Stack Requirements
- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Chart.js for data visualization
- **Backend**: Node.js with Express.js
- **Database**: LocalStorage for client-side data persistence, with option for server-side storage
- **Authentication**: JWT tokens with bcrypt password hashing
- **UI Framework**: Custom CSS with responsive design
- **Icons**: Font Awesome and emoji integration
- **Fonts**: Google Fonts (Poppins)

## Core Features to Implement

### 1. 📊 Dashboard & Analytics
- **Progress Tracking Charts**: Interactive line charts using Chart.js displaying total workout volume (weight × sets) over time
- **Real-time Data Visualization**: Dynamic charts that update automatically when new workout data is logged
- **Performance Metrics**: Track total volume lifted per workout session
- **Visual Progress Indicators**: Color-coded charts with gradient fills and smooth curves

### 2. 👤 User Profile Management
- **Comprehensive Profile Creation**: Multi-field system including name, fitness goals (Build Muscle, Lose Fat, Improve Endurance), and medical history
- **Goal-Based Personalization**: Profile data influences workout generation
- **Medical History Integration**: Text area for injuries, conditions, or physical limitations
- **Profile Persistence**: Auto-save to localStorage with cross-session persistence

### 3. ⚡ AI-Powered Workout Generation
- **Intelligent Exercise Selection**: Algorithm selects exercises based on fitness goals
- **Goal-Specific Programming**:
  - Build Muscle: Compound movements (squats, bench press, bent-over rows)
  - Lose Fat: High-intensity exercises (burpees, kettlebell swings)
  - Improve Endurance: Cardio activities (running, rowing)
- **Dynamic Workout Creation**: Includes exercise name, sets, and target reps/duration
- **Profile Validation**: Check for completed profile before generating workouts

### 4. 📈 Workout Logging System
- **Comprehensive Exercise Tracking**: Log exercise name, sets, reps, and weight
- **Flexible Weight Recording**: Support metric (kg) and imperial (lbs) with auto-conversion
- **Progress Documentation**: Timestamped workout sessions with complete details
- **Achievement Recognition**: Celebration notifications every 10 completed workouts
- **Data Validation**: Input validation for proper data formatting

### 5. 🥗 Nutrition & Meal Tracking
- **Detailed Macro-nutrient Logging**: Track calories, protein, carbs, and fat for each food item
- **Daily Nutrition Analytics**: Automatic calculation of daily macro totals
- **Voice Input Technology**: Speech recognition for hands-free meal logging
- **Real-time Nutrition Visualization**: Chart.js doughnut charts showing macro proportions
- **Meal History Management**: Organized table display of daily meals

### 6. 💧 Hydration Monitoring
- **Precise Water Tracking**: Milliliter-based water intake logging
- **Daily Hydration Totals**: Automatic calculation and display
- **Hydration History**: Persistent storage with timestamps
- **Simple Logging Interface**: Streamlined input form

### 7. 😣 Pain & Fatigue Management
- **Quantified Fatigue Tracking**: 10-point scale (0-10) for energy levels
- **Detailed Pain Documentation**: Text-based notes for pain locations and intensity
- **Recovery Monitoring**: Historical tracking for pattern identification
- **Health Integration**: Data integration with AI coach for personalized recommendations

### 8. 📅 Smart Scheduling Assistant
- **Comprehensive Event Management**: Calendar-based scheduling for workouts, rehab, and stretching
- **Flexible Scheduling Options**: Date and time picker interface
- **Activity Type Categorization**: Dropdown for different activity types
- **Schedule Visualization**: Clean table display of scheduled events

### 9. ✅ Habit Tracker
- **Custom Habit Creation**: User-defined fitness habits
- **Daily Habit Monitoring**: Checkbox-based daily tracking
- **Habit Persistence**: Auto-save to localStorage with date-based logging
- **Visual Habit Management**: Organized table display with completion status

### 10. 🤖 AI Coach
- **Personalized Fitness Guidance**: AI-powered coaching based on profile and history
- **Performance Analysis**: Automatic analysis of recent workout performance
- **Recovery Monitoring**: Fatigue level assessment with rest day recommendations
- **Goal-Oriented Motivation**: Personalized encouragement for specific fitness goals
- **Contextual Recommendations**: Real-time coaching considering current status

### 11. ⚙️ Settings & Customization
- **Dark Mode Toggle**: User-selectable dark/light theme
- **Unit System Preferences**: Metric (kg, cm) vs Imperial (lbs, in) units
- **Persistent Settings**: Auto-save and restore across sessions
- **Real-time Settings Application**: Immediate application of changes

### 12. 🔐 Authentication System
- **Secure User Registration**: Complete registration with validation
- **Encrypted Password Storage**: bcrypt with salt rounds
- **JWT Token Authentication**: 7-day expiration tokens
- **Protected User Sessions**: Automatic token validation
- **Secure Login/Logout**: Encrypted login with session management
- **User Data Isolation**: Privacy and data security

### 13. 🎨 User Interface Features
- **Modern Sidebar Navigation**: Clean, icon-based navigation with Font Awesome
- **Responsive Design**: Mobile-friendly interface
- **Intuitive Icon System**: Consistent emoji and Font Awesome usage
- **Smooth Page Transitions**: Seamless navigation with active state management
- **Professional Typography**: Google Fonts (Poppins) integration

### 14. 🛠️ Technical Features
- **LocalStorage Data Persistence**: Client-side storage with offline functionality
- **Real-time Data Synchronization**: Immediate updates across components
- **Advanced Chart Integration**: Chart.js for professional data visualization
- **Speech Recognition API**: Web Speech API for voice input
- **RESTful API Backend**: Express.js with proper endpoints
- **CORS Support**: Cross-origin resource sharing
- **Modular JavaScript Architecture**: Object-oriented, maintainable code
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Development Guidelines

### File Structure
```
fitness/
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── style.css
│   │   └── dark-mode.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── workout.js
│   │   ├── nutrition.js
│   │   ├── hydration.js
│   │   ├── pain-fatigue.js
│   │   ├── scheduling.js
│   │   ├── habits.js
│   │   ├── ai-coach.js
│   │   ├── settings.js
│   │   └── charts.js
│   └── assets/
│       └── icons/
├── server/
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── api.js
│   ├── middleware/
│   │   └── auth.js
│   └── package.json
├── package.json
└── README.md
```

### Implementation Priorities
1. **Phase 1**: Core authentication and user profile system
2. **Phase 2**: Dashboard and basic workout logging
3. **Phase 3**: AI workout generation and progress tracking
4. **Phase 4**: Nutrition and hydration tracking
5. **Phase 5**: Pain/fatigue management and scheduling
6. **Phase 6**: Habit tracker and AI coach
7. **Phase 7**: Settings, UI polish, and advanced features

### Code Quality Requirements
- **Modular Architecture**: Separate concerns into logical modules
- **Error Handling**: Comprehensive try-catch blocks and user feedback
- **Data Validation**: Input sanitization and validation
- **Responsive Design**: Mobile-first approach
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized loading and efficient data handling

### Security Considerations
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Security**: Proper token validation and expiration
- **Input Sanitization**: Prevent XSS and injection attacks
- **Data Privacy**: User data isolation and secure storage

### Testing Requirements
- **Cross-browser Compatibility**: Chrome, Firefox, Safari, Edge
- **Mobile Responsiveness**: iOS and Android testing
- **Data Persistence**: Verify localStorage functionality
- **Error Scenarios**: Test edge cases and error handling

## Success Criteria
- All features implemented and functional
- Responsive design working on all devices
- Data persistence across browser sessions
- Smooth user experience with intuitive navigation
- Professional-grade data visualization
- Secure authentication system
- AI-powered workout generation working correctly
- Voice input functionality for nutrition tracking
- Dark mode toggle working throughout the app
- Comprehensive error handling and user feedback

## Additional Notes
- Focus on creating a polished, professional user experience
- Ensure all charts and visualizations are interactive and informative
- Implement progressive enhancement for better accessibility
- Consider adding offline functionality for better user experience
- Include comprehensive documentation for future maintenance
