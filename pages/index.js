import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, User, MapPin, Target, Compass, Shield, Star, Activity, Music, Camera, Coffee } from 'lucide-react';

// Database configuration - you'll replace these with your Supabase details
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Simple database save function
const saveToDatabase = async (profileData) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(profileData)
    });
    
    if (response.ok) {
      console.log('Profile saved successfully!');
      return true;
    } else {
      console.error('Failed to save profile');
      return false;
    }
  } catch (error) {
    console.error('Database error:', error);
    return false;
  }
};

const DatingConcierge = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hi there! I'm your AI dating concierge 💕 I'll ask you some questions to understand who you are and what you're looking for. This helps me find people who are truly compatible with you. Ready to get started?",
      timestamp: new Date()
    }
  ]);
  
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userProfile, setUserProfile] = useState({});
  const [schwartzScores, setSchwartzScores] = useState({
    power: 0, achievement: 0, hedonism: 0, stimulation: 0, self_direction: 0,
    universalism: 0, benevolence: 0, tradition: 0, conformity: 0, security: 0
  });
  const messagesEndRef = useRef(null);

  const questions = [
    // Demographics
    {
      id: 'name',
      text: "What's your first name?",
      type: 'text',
      icon: User,
      category: 'demographics'
    },
    {
      id: 'age',
      text: "How old are you?",
      type: 'number',
      icon: User,
      category: 'demographics'
    },
    {
      id: 'location',
      text: "What city are you based in?",
      type: 'text',
      icon: MapPin,
      category: 'demographics'
    },
    {
      id: 'gender_identity',
      text: "How do you identify?",
      type: 'choice',
      options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'],
      icon: User,
      category: 'demographics'
    },
    {
      id: 'seeking_gender',
      text: "Who are you interested in meeting?",
      type: 'choice',
      options: ['Women', 'Men', 'Both', 'All genders'],
      icon: Heart,
      category: 'demographics'
    },
    {
      id: 'race_ethnicity',
      text: "How would you describe your race/ethnicity? (Optional - helps with cultural compatibility)",
      type: 'choice',
      options: ['Asian', 'Black/African American', 'Hispanic/Latino', 'Middle Eastern', 'Native American', 'White/Caucasian', 'Mixed/Multiracial', 'Other', 'Prefer not to say'],
      icon: User,
      category: 'demographics'
    },
    
    // Physical Characteristics
    {
      id: 'height',
      text: "What's your height?",
      type: 'choice',
      options: ['Under 5\'2"', '5\'2" - 5\'5"', '5\'6" - 5\'9"', '5\'10" - 6\'1"', 'Over 6\'1"'],
      icon: User,
      category: 'physical'
    },
    {
      id: 'fitness_level',
      text: "How would you describe your fitness level?",
      type: 'choice',
      options: ['Very athletic/fitness enthusiast', 'Active and healthy', 'Moderately active', 'Not very active', 'Prefer not to say'],
      icon: Activity,
      category: 'physical'
    },
    
    // Interests
    {
      id: 'interests',
      text: "What are your main interests? (Select all that apply - type them separated by commas)",
      type: 'multiple',
      suggestions: ['Travel', 'Fitness', 'Reading', 'Cooking', 'Music', 'Art', 'Movies/TV', 'Outdoor activities', 'Sports', 'Gaming', 'Photography', 'Dancing', 'Technology', 'Fashion', 'Food & dining', 'Learning languages', 'Volunteering'],
      icon: Music,
      category: 'interests'
    },
    {
      id: 'weekend_activities',
      text: "How do you typically like to spend weekends?",
      type: 'choice',
      options: ['Outdoor adventures and activities', 'Cultural events - museums, shows, galleries', 'Social gatherings with friends', 'Quiet time at home with hobbies', 'Exploring new restaurants and neighborhoods', 'Fitness and wellness activities'],
      icon: Compass,
      category: 'interests'
    },
    
    // Values (Likert Scale Questions)
    {
      id: 'values_intro',
      text: "Now I'll share some statements. Please tell me how much you agree with each one using: Strongly Disagree (1), Disagree (2), Neutral (3), Agree (4), Strongly Agree (5). Ready?",
      type: 'confirmation',
      icon: Target,
      category: 'values'
    },
    {
      id: 'value_power',
      text: '"It\'s important for me to be in leadership positions and have influence over others."',
      type: 'likert',
      icon: Shield,
      category: 'values',
      value_type: 'power'
    },
    {
      id: 'value_achievement',
      text: '"Personal success and recognition for my accomplishments are very important to me."',
      type: 'likert',
      icon: Star,
      category: 'values',
      value_type: 'achievement'
    },
    {
      id: 'value_hedonism',
      text: '"I believe in enjoying life\'s pleasures and having fun whenever possible."',
      type: 'likert',
      icon: Heart,
      category: 'values',
      value_type: 'hedonism'
    },
    {
      id: 'value_stimulation',
      text: '"I love excitement, novelty, and challenging myself with new experiences."',
      type: 'likert',
      icon: Compass,
      category: 'values',
      value_type: 'stimulation'
    },
    {
      id: 'value_self_direction',
      text: '"Independence and the freedom to make my own choices are essential to me."',
      type: 'likert',
      icon: Target,
      category: 'values',
      value_type: 'self_direction'
    },
    {
      id: 'value_universalism',
      text: '"I care deeply about social justice, equality, and protecting the environment."',
      type: 'likert',
      icon: Heart,
      category: 'values',
      value_type: 'universalism'
    },
    {
      id: 'value_benevolence',
      text: '"The wellbeing of my family and close friends is my top priority."',
      type: 'likert',
      icon: Heart,
      category: 'values',
      value_type: 'benevolence'
    },
    {
      id: 'value_tradition',
      text: '"Respecting family traditions and cultural customs is important to me."',
      type: 'likert',
      icon: Shield,
      category: 'values',
      value_type: 'tradition'
    },
    {
      id: 'value_conformity',
      text: '"I believe in following social rules and avoiding actions that might upset others."',
      type: 'likert',
      icon: User,
      category: 'values',
      value_type: 'conformity'
    },
    {
      id: 'value_security',
      text: '"Safety, stability, and avoiding risks are very important to me."',
      type: 'likert',
      icon: Shield,
      category: 'values',
      value_type: 'security'
    },
    
    // Relationship Goals
    {
      id: 'relationship_type',
      text: "What kind of relationship are you looking for?",
      type: 'choice',
      options: ['Serious long-term relationship/marriage', 'Dating to see where it goes', 'Casual dating', 'Friends first, then see what develops'],
      icon: Heart,
      category: 'relationship'
    },
    {
      id: 'ideal_date',
      text: "Describe your ideal first date in a few words:",
      type: 'text',
      placeholder: 'Coffee and conversation, hiking adventure, cooking together...',
      icon: Coffee,
      category: 'relationship'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessage = (type, text, options = null) => {
    setMessages(prev => [...prev, {
      type,
      text,
      options,
      timestamp: new Date()
    }]);
  };

  const updateSchwartzScores = (valueType, score) => {
    if (valueType) {
      setSchwartzScores(prev => ({
        ...prev,
        [valueType]: score
      }));
    }
  };

  const simulateTyping = (callback, delay = 1500) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const handleUserResponse = (response) => {
    // Add user message
    addMessage('user', response);
    
    // Update profile
    const question = questions[currentQuestion];
    setUserProfile(prev => ({
      ...prev,
      [question.id]: response
    }));

    // Update Schwartz values if this is a Likert scale question
    if (question.type === 'likert' && question.value_type) {
      const score = parseInt(response.split(' ')[0]) || 0; // Extract number from "1 - Strongly Disagree"
      updateSchwartzScores(question.value_type, score);
    }

    // Process next question or finish
    simulateTyping(() => {
      if (currentQuestion < questions.length - 1) {
        askNextQuestion();
      } else {
        finishInterview();
      }
    });
  };

  const askNextQuestion = () => {
    const nextIndex = currentQuestion + 1;
    setCurrentQuestion(nextIndex);
    const question = questions[nextIndex];
    
    if (question.type === 'choice') {
      addMessage('bot', question.text, question.options);
    } else if (question.type === 'likert') {
      const likertOptions = [
        '1 - Strongly Disagree',
        '2 - Disagree', 
        '3 - Neutral',
        '4 - Agree',
        '5 - Strongly Agree'
      ];
      addMessage('bot', question.text, likertOptions);
    } else if (question.type === 'confirmation') {
      addMessage('bot', question.text, ['Ready!']);
    } else if (question.type === 'multiple') {
      addMessage('bot', question.text + "\n\nSuggestions: " + question.suggestions.join(', '), null);
    } else {
      addMessage('bot', question.text);
    }
  };

  const getTopValues = () => {
    return Object.entries(schwartzScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([value, score]) => ({ 
        value: value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        score 
      }));
  };

  const finishInterview = async () => {
    const topValues = getTopValues();
    
    // Prepare complete profile data for database
    const profileData = {
      name: userProfile.name,
      age: parseInt(userProfile.age),
      location: userProfile.location,
      gender_identity: userProfile.gender_identity,
      seeking_gender: userProfile.seeking_gender,
      race_ethnicity: userProfile.race_ethnicity,
      height: userProfile.height,
      fitness_level: userProfile.fitness_level,
      interests: userProfile.interests,
      weekend_activities: userProfile.weekend_activities,
      relationship_type: userProfile.relationship_type,
      ideal_date: userProfile.ideal_date,
      power_score: schwartzScores.power,
      achievement_score: schwartzScores.achievement,
      hedonism_score: schwartzScores.hedonism,
      stimulation_score: schwartzScores.stimulation,
      self_direction_score: schwartzScores.self_direction,
      universalism_score: schwartzScores.universalism,
      benevolence_score: schwartzScores.benevolence,
      tradition_score: schwartzScores.tradition,
      conformity_score: schwartzScores.conformity,
      security_score: schwartzScores.security,
      top_values: topValues.map(v => v.value).join(', '),
      created_at: new Date().toISOString()
    };
    
    addMessage('bot', "Perfect! 🌟 I've got a comprehensive picture of who you are and what you're looking for. Let me save your profile...");
    
    // Save to database
    const saved = await saveToDatabase(profileData);
    
    if (saved) {
      addMessage('bot', "✅ Your profile has been saved successfully! I'm now analyzing our database to find your ideal matches...");
    } else {
      addMessage('bot', "⚠️ There was an issue saving your profile. Don't worry - I still have all your information and can help you with matches!");
    }
    
    // Show summary
    setTimeout(() => {      
      const summary = `🎯 **Your Complete Profile:**\n\n👤 ${userProfile.name}, ${userProfile.age}, ${userProfile.location}\n🔍 Looking for: ${userProfile.seeking_gender}\n💪 Fitness: ${userProfile.fitness_level}\n🎨 Interests: ${userProfile.interests}\n💕 Relationship goal: ${userProfile.relationship_type}\n\n📊 **Your Top Values:**\n${topValues.map(v => `• ${v.value} (${v.score}/5)`).join('\n')}\n\nReady to find amazing matches who align with your values and lifestyle! 🚀`;
      
      addMessage('bot', summary);
    }, 2000);
  };

  const handleSubmit = () => {
    if (currentInput.trim() && currentQuestion < questions.length) {
      handleUserResponse(currentInput);
      setCurrentInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleOptionClick = (option) => {
    handleUserResponse(option);
  };

  const startInterview = () => {
    simulateTyping(() => {
      const question = questions[0];
      addMessage('bot', question.text);
    });
  };

  const IconComponent = questions[currentQuestion]?.icon || Heart;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">AI Dating Concierge</h1>
            <p className="text-sm text-gray-500">Comprehensive compatibility matching</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white' 
                : 'bg-white text-gray-800 shadow-sm border border-purple-100'
            }`}>
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              {message.options && (
                <div className="mt-3 space-y-2">
                  {message.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => handleOptionClick(option)}
                      className="block w-full text-left p-3 text-xs bg-gradient-to-r from-indigo-50 to-pink-50 hover:from-indigo-100 hover:to-pink-100 rounded-lg border border-purple-200 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border border-purple-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {messages.length === 1 && (
        <div className="p-4 bg-white border-t border-purple-100">
          <button
            onClick={startInterview}
            className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Start my profile! 💫
          </button>
        </div>
      )}

      {messages.length > 1 && currentQuestion < questions.length && (
        <div className="p-4 bg-white border-t border-purple-100">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <IconComponent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                type={questions[currentQuestion]?.type === 'number' ? 'number' : 'text'}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={questions[currentQuestion]?.placeholder || "Type your answer..."}
                className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                autoFocus
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!currentInput.trim()}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white p-3 rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {currentQuestion >= questions.length && (
        <div className="p-4 bg-white border-t border-purple-100">
          <div className="text-center text-gray-600">
            <Heart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm">Complete profile created! Finding your perfect matches... 💫</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatingConcierge;
