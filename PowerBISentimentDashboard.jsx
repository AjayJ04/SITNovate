import React, { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown, Minus, RefreshCw } from "lucide-react";

// Replace the Card import with a simple div for now
const Card = ({ children, className }) => (
  <div className={`p-4 rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const PowerBISentimentDashboard = () => {
  const colors = {
    positive: '#01B8AA',
    negative: '#FD625E',
    neutral: '#F2C80F',
    background: '#F6F6F6',
    cardBg: '#FFFFFF',
    text: '#252423',
    grid: '#E1E1E1',
    blue: '#3E79BB',
    purple: '#8562B5',
    teal: '#41A5AB',
    accent: '#738AC1'
  };

  const COLORS = [colors.positive, colors.blue, colors.purple, colors.teal, colors.accent];

  // Product categories for review generation
  const productCategories = [
    "smartphone", "laptop", "headphones", "smartwatch", "camera", 
    "tablet", "speaker", "monitor", "keyboard", "mouse",
    "backpack", "shoes", "shirt", "jeans", "dress"
  ];

  // Aspects to comment on
  const aspects = {
    positive: {
      quality: ["excellent quality", "well-made", "premium feel", "durable construction", "high-quality materials"],
      performance: ["works flawlessly", "incredible performance", "exceeds expectations", "runs smoothly", "powerful"],
      design: ["beautiful design", "sleek appearance", "stylish look", "elegant design", "modern aesthetic"],
      value: ["great value for money", "worth every penny", "excellent price-to-quality ratio", "affordable luxury", "reasonable price"],
      service: ["excellent customer service", "prompt delivery", "helpful support team", "easy return process", "attentive staff"]
    },
    negative: {
      quality: ["poor quality", "cheaply made", "flimsy construction", "low-grade materials", "defective"],
      performance: ["slow performance", "frequent glitches", "unreliable", "below expectations", "stops working randomly"],
      design: ["ugly design", "outdated look", "bulky", "uncomfortable to use", "poorly designed"],
      value: ["overpriced", "not worth the money", "expensive for what you get", "poor value", "waste of money"],
      service: ["terrible customer service", "slow shipping", "unhelpful support", "difficult return process", "unresponsive team"]
    },
    neutral: {
      quality: ["average quality", "standard materials", "as expected", "nothing special", "adequate build"],
      performance: ["works as described", "meets basic needs", "standard performance", "functions adequately", "does the job"],
      design: ["standard design", "functional look", "conventional style", "practical design", "simple appearance"],
      value: ["fair price", "reasonable cost", "standard market price", "average value", "acceptable pricing"],
      service: ["standard service", "normal delivery time", "basic customer support", "typical return policy", "average response time"]
    }
  };

  // Recent reviews state
  const [recentReviews, setRecentReviews] = useState([]);
  const [reviewExplanations, setReviewExplanations] = useState([]);
  
  const [sentimentData, setSentimentData] = useState([
    { date: '2024-01', positive: 65, negative: 20, neutral: 15 },
    { date: '2024-02', positive: 70, negative: 15, neutral: 15 },
    { date: '2024-03', positive: 60, negative: 25, neutral: 15 },
    { date: '2024-04', positive: 72, negative: 18, neutral: 10 },
    { date: '2024-05', positive: 68, negative: 22, neutral: 10 }
  ]);

  const [keywordData, setKeywordData] = useState([
    { word: 'quality', count: 120 },
    { word: 'delivery', count: 90 },
    { word: 'price', count: 80 },
    { word: 'service', count: 70 },
    { word: 'style', count: 60 }
  ]);

  const [lastUpdateTime, setLastUpdateTime] = useState(new Date().toLocaleTimeString());
  const [isLoading, setIsLoading] = useState(false);
  const [previousSentiment, setPreviousSentiment] = useState({ positive: 65, negative: 20, neutral: 15 });
  const [sentimentChangeRate, setSentimentChangeRate] = useState({ positive: 0, negative: 0, neutral: 0 });
  const [historicalSentiment, setHistoricalSentiment] = useState(
    Array(24).fill(0).map((_, i) => ({
      hour: i,
      positive: 50 + Math.floor(Math.random() * 30),
      volume: 100 + Math.floor(Math.random() * 200)
    }))
  );
  
  // AI-powered review generator
  const generateReview = (sentimentBias = null) => {
    // Determine sentiment type if not specified
    const sentimentType = sentimentBias || 
                          (Math.random() < 0.6 ? "positive" : 
                           Math.random() < 0.7 ? "negative" : "neutral");
    
    // Select random product category
    const category = productCategories[Math.floor(Math.random() * productCategories.length)];
    
    // Select aspects to mention (between 1-3 aspects)
    const aspectCount = Math.floor(Math.random() * 3) + 1;
    const aspectsToUse = Object.keys(aspects[sentimentType]);
    const selectedAspects = [];
    
    // Ensure unique aspects
    while (selectedAspects.length < aspectCount && aspectsToUse.length > 0) {
      const randomIndex = Math.floor(Math.random() * aspectsToUse.length);
      const aspect = aspectsToUse.splice(randomIndex, 1)[0];
      const phrase = aspects[sentimentType][aspect][Math.floor(Math.random() * aspects[sentimentType][aspect].length)];
      selectedAspects.push({ aspect, phrase });
    }
    
    // Build review
    let review = "";
    const productNames = {
      smartphone: ["iPhone", "Galaxy", "Pixel", "OnePlus", "Xiaomi"],
      laptop: ["MacBook", "ThinkPad", "XPS", "Spectre", "Zenbook"],
      headphones: ["AirPods", "Sony WH-1000XM", "Bose QC", "Sennheiser", "Beats"],
      smartwatch: ["Apple Watch", "Galaxy Watch", "Fitbit", "Garmin", "Amazfit"],
      camera: ["Canon EOS", "Sony Alpha", "Nikon Z", "Fujifilm X", "Panasonic Lumix"],
      tablet: ["iPad", "Galaxy Tab", "Surface", "Fire HD", "Lenovo Tab"],
      speaker: ["Sonos", "Bose", "JBL", "UE Boom", "Marshall"],
      monitor: ["Dell Ultrasharp", "LG UltraGear", "Samsung Odyssey", "ASUS ProArt", "BenQ"],
      keyboard: ["Logitech MX", "Corsair K", "Razer", "Keychron", "SteelSeries"],
      mouse: ["Logitech G", "Razer", "SteelSeries", "Corsair", "Glorious"],
      backpack: ["North Face", "Osprey", "Herschel", "Fjallraven", "Timbuk2"],
      shoes: ["Nike Air", "Adidas Ultra", "New Balance", "ASICS", "Brooks"],
      shirt: ["Uniqlo", "H&M", "Gap", "J.Crew", "Everlane"],
      jeans: ["Levi's", "Wrangler", "Calvin Klein", "American Eagle", "Diesel"],
      dress: ["Zara", "H&M", "Forever 21", "ASOS", "Anthropologie"]
    };
    
    const brand = productNames[category][Math.floor(Math.random() * productNames[category].length)];
    const productName = `${brand} ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    
    // Opening statements
    const positiveOpeners = [
      `I recently purchased the ${productName} and I'm extremely happy with it.`,
      `Just got my new ${productName} and I couldn't be more satisfied.`,
      `After using the ${productName} for a week, I'm very impressed.`,
      `The ${productName} is one of the best purchases I've made this year.`,
      `I've been using my ${productName} for a month now and love it!`
    ];
    
    const negativeOpeners = [
      `I regret buying the ${productName}.`,
      `The ${productName} was a disappointment from day one.`,
      `I cannot recommend the ${productName} to anyone.`,
      `Save your money and avoid the ${productName}.`,
      `After trying the ${productName}, I immediately wanted to return it.`
    ];
    
    const neutralOpeners = [
      `I've been using the ${productName} for a few days now.`,
      `The ${productName} is pretty much what I expected.`,
      `My experience with the ${productName} has been okay so far.`,
      `The ${productName} is a standard option in this category.`,
      `I received the ${productName} last week and have some thoughts.`
    ];
    
    // Select appropriate opener
    if (sentimentType === "positive") {
      review = positiveOpeners[Math.floor(Math.random() * positiveOpeners.length)];
    } else if (sentimentType === "negative") {
      review = negativeOpeners[Math.floor(Math.random() * negativeOpeners.length)];
    } else {
      review = neutralOpeners[Math.floor(Math.random() * neutralOpeners.length)];
    }
    
    // Add aspect comments
    for (let i = 0; i < selectedAspects.length; i++) {
      const { aspect, phrase } = selectedAspects[i];
      
      const connectors = [
        ` The ${aspect} is ${phrase}.`,
        ` I ${sentimentType === "positive" ? "love" : sentimentType === "negative" ? "dislike" : "notice"} that the ${aspect} is ${phrase}.`,
        ` In terms of ${aspect}, it's ${phrase}.`,
        ` It features ${phrase} ${aspect}.`,
        ` One thing to note is the ${phrase} ${aspect}.`
      ];
      
      review += connectors[Math.floor(Math.random() * connectors.length)];
    }
    
    // Add conclusion
    const positiveClosers = [
      " Highly recommended!",
      " Would definitely buy again!",
      " Five stars from me!",
      " Couldn't ask for better!",
      " Very satisfied with my purchase."
    ];
    
    const negativeClosers = [
      " Would not recommend.",
      " Save your money for something better.",
      " Very disappointed overall.",
      " Returning it as soon as possible.",
      " Complete waste of money."
    ];
    
    const neutralClosers = [
      " It serves its purpose.",
      " Overall, it's okay for the price.",
      " It's a decent option if you need something basic.",
      " Neither impressed nor disappointed.",
      " It's suitable for some users."
    ];
    
    if (sentimentType === "positive") {
      review += positiveClosers[Math.floor(Math.random() * positiveClosers.length)];
    } else if (sentimentType === "negative") {
      review += negativeClosers[Math.floor(Math.random() * negativeClosers.length)];
    } else {
      review += neutralClosers[Math.floor(Math.random() * neutralClosers.length)];
    }
    
    return {
      text: review,
      sentiment: sentimentType,
      product: productName,
      aspects: selectedAspects
    };
  };
  
  // AI-powered sentiment analysis
  const analyzeSentiment = (review) => {
    // Sentiment indicators to look for
    const indicators = {
      positive: [
        "love", "great", "excellent", "amazing", "fantastic", "perfect", "best",
        "happy", "satisfied", "impressive", "wonderful", "recommend", "worth",
        "flawless", "exceeded", "premium", "incredible", "beautiful", "sleek",
        "outstanding", "awesome", "helpful", "five stars", "highly recommended"
      ],
      negative: [
        "disappointed", "terrible", "awful", "poor", "bad", "waste", "regret",
        "avoid", "cheap", "frustrating", "broken", "defective", "refund", "return",
        "overpriced", "uncomfortable", "difficult", "slow", "ugly", "useless",
        "wouldn't recommend", "cheaply made", "glitches", "unreliable", "horrible"
      ],
      neutral: [
        "okay", "decent", "standard", "average", "expected", "fine", "fair",
        "basic", "moderate", "acceptable", "reasonable", "adequate", "typical",
        "conventional", "middle", "neither", "ordinary", "simple", "functional",
        "serves its purpose", "middle of the road", "three stars", "as described"
      ]
    };
    
    // Convert to lowercase for case-insensitive matching
    const lowercaseReview = review.toLowerCase();
    
    // Count indicator matches
    let scores = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
    
    // Score each sentiment category
    Object.keys(indicators).forEach(sentiment => {
      indicators[sentiment].forEach(indicator => {
        if (lowercaseReview.includes(indicator)) {
          scores[sentiment]++;
        }
      });
    });
    
    // Find detected terms for explanation
    const detectedTerms = {
      positive: [],
      negative: [],
      neutral: []
    };
    
    Object.keys(indicators).forEach(sentiment => {
      indicators[sentiment].forEach(indicator => {
        if (lowercaseReview.includes(indicator)) {
          detectedTerms[sentiment].push(indicator);
        }
      });
    });
    
    // Determine dominant sentiment
    let dominantSentiment;
    if (scores.positive > scores.negative && scores.positive > scores.neutral) {
      dominantSentiment = "positive";
    } else if (scores.negative > scores.positive && scores.negative > scores.neutral) {
      dominantSentiment = "negative";
    } else if (scores.neutral > scores.positive && scores.neutral > scores.negative) {
      dominantSentiment = "neutral";
    } else if (scores.positive === scores.negative && scores.positive > scores.neutral) {
      // Mixed but more emotional than neutral
      dominantSentiment = Math.random() < 0.5 ? "positive" : "negative";
    } else {
      // Default to neutral in ambiguous cases
      dominantSentiment = "neutral";
    }
    
    return {
      sentiment: dominantSentiment,
      scores: scores,
      detectedTerms: detectedTerms
    };
  };

  // Extract keywords from text
  const extractKeywords = (reviews) => {
    // Potential keywords to track
    const keywordsToTrack = [
      "quality", "delivery", "price", "service", "design", 
      "performance", "value", "shipping", "customer service",
      "comfort", "durability", "features", "functionality", "warranty", "packaging"
    ];
    
    const keywordCounts = {};
    
    keywordsToTrack.forEach(keyword => {
      keywordCounts[keyword] = 0;
    });
    
    reviews.forEach(review => {
      const lowercaseReview = review.text.toLowerCase();
      keywordsToTrack.forEach(keyword => {
        if (lowercaseReview.includes(keyword)) {
          keywordCounts[keyword]++;
        }
      });
    });
    
    // Convert to array and sort by frequency
    return Object.entries(keywordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const generateSentimentData = () => {
    // Generate a set of reviews with a realistic distribution
    // Target distribution: ~60% positive, ~30% negative, ~10% neutral
    const generatedReviews = [];
    const reviewCount = 10;
    
    for (let i = 0; i < reviewCount; i++) {
      // Slight bias toward positive reviews to mimic real-world distribution
      const sentimentBias = i < 6 ? "positive" : i < 9 ? "negative" : "neutral";
      generatedReviews.push(generateReview(sentimentBias));
    }
    
    // Save recent reviews for display
    setRecentReviews(generatedReviews);
    
    // Analyze sentiment of each review
    const analyzedReviews = generatedReviews.map(review => {
      const analysis = analyzeSentiment(review.text);
      return {
        ...review,
        analysis
      };
    });
    
    // Save sentiment explanations
    setReviewExplanations(analyzedReviews);
    
    // Count sentiments
    let positive = 0;
    let negative = 0;
    let neutral = 0;
    
    analyzedReviews.forEach(review => {
      if (review.analysis.sentiment === "positive") positive++;
      else if (review.analysis.sentiment === "negative") negative++;
      else neutral++;
    });
    
    // Calculate percentages
    const total = analyzedReviews.length;
    const positivePercent = Math.round((positive / total) * 100);
    const negativePercent = Math.round((negative / total) * 100);
    const neutralPercent = 100 - positivePercent - negativePercent;
    
    const currentDate = new Date();
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    return { date: dateStr, positive: positivePercent, negative: negativePercent, neutral: neutralPercent };
  };

  const calculateChange = (current, previous) => ({
    positive: current.positive - previous.positive,
    negative: current.negative - previous.negative,
    neutral: current.neutral - previous.neutral
  });

  const updateHourlyData = () => {
    const currentHour = new Date().getHours();
    // Generate reviews for this hour with realistic distribution
    const hourlyReviews = [];
    for (let i = 0; i < 8; i++) {
      hourlyReviews.push(generateReview());
    }
    
    // Analyze sentiment
    let positive = 0;
    hourlyReviews.forEach(review => {
      const analysis = analyzeSentiment(review.text);
      if (analysis.sentiment === "positive") positive++;
    });
    
    const newPositive = Math.round((positive / hourlyReviews.length) * 100);
    const newVolume = 80 + Math.floor(Math.random() * 120); // Simulate varying review volume
    
    return historicalSentiment.map(item => 
      item.hour === currentHour 
        ? { ...item, positive: newPositive, volume: newVolume }
        : item
    );
  };

  const handleRefresh = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const latestSentiment = generateSentimentData();
      setSentimentData(prev => [...prev.slice(-5), latestSentiment]);
      setKeywordData(extractKeywords(recentReviews));
      setHistoricalSentiment(updateHourlyData());
      setPreviousSentiment(sentimentData[sentimentData.length - 1]);
      setSentimentChangeRate(calculateChange(latestSentiment, sentimentData[sentimentData.length - 1]));
      setLastUpdateTime(new Date().toLocaleTimeString());
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(handleRefresh, 2500);
    return () => clearInterval(interval);
  }, [sentimentData, recentReviews]);

  const getCurrentSentimentForPie = () => {
    const current = sentimentData[sentimentData.length - 1];
    return [
      { name: 'Positive', value: current.positive },
      { name: 'Negative', value: current.negative },
      { name: 'Neutral', value: current.neutral }
    ];
  };

  const renderChangeIndicator = (value) => {
    if (value > 0) return <ArrowUp size={16} className="text-green-600" />;
    if (value < 0) return <ArrowDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-500" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-gray-50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Sentiment Analysis Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated: {lastUpdateTime}</span>
          <button 
            onClick={handleRefresh} 
            disabled={isLoading}
            className="flex items-center space-x-1 px-3 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['positive', 'negative', 'neutral'].map((type) => (
          <Card key={type} className="p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold capitalize" style={{ color: colors[type] }}>
                {type} Sentiment
              </h3>
              <div className="flex items-center space-x-1">
                {renderChangeIndicator(sentimentChangeRate[type])}
                <span className={`${
                  sentimentChangeRate[type] > 0 
                    ? 'text-green-600' 
                    : sentimentChangeRate[type] < 0 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }`}>
                  {Math.abs(sentimentChangeRate[type])}%
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold">{sentimentData[sentimentData.length - 1]?.[type]}%</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Latest Reviews with Sentiment Analysis</h2>
          <div className="space-y-4">
            {reviewExplanations.slice(0, 3).map((review, index) => (
              <div key={index} className="border-b pb-4">
                <div className="flex items-start">
                  <div 
                    className="w-3 h-3 mt-1.5 mr-2 rounded-full" 
                    style={{ backgroundColor: colors[review.analysis.sentiment] }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{review.product}</p>
                    <p className="my-1">{review.text}</p>
                    <div className="bg-gray-100 p-2 rounded mt-2">
                      <p className="text-xs font-medium">Sentiment Analysis:</p>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div>
                          <p className="text-xs text-green-700">Positive indicators:</p>
                          <p className="text-xs">{review.analysis.detectedTerms.positive.slice(0, 3).join(", ") || "None detected"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-red-700">Negative indicators:</p>
                          <p className="text-xs">{review.analysis.detectedTerms.negative.slice(0, 3).join(", ") || "None detected"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-yellow-700">Neutral indicators:</p>
                          <p className="text-xs">{review.analysis.detectedTerms.neutral.slice(0, 3).join(", ") || "None detected"}</p>
                        </div>
                      </div>
                      <p className="text-xs mt-2">
                        <span className="font-medium">Classification reasoning: </span>
                        {review.analysis.scores.positive > 0 || review.analysis.scores.negative > 0 || review.analysis.scores.neutral > 0 ? 
                          `Found ${review.analysis.scores.positive} positive, ${review.analysis.scores.negative} negative, and ${review.analysis.scores.neutral} neutral indicators.` : 
                          "Insufficient sentiment indicators found, classified based on context."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sentiment Distribution</h2>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={getCurrentSentimentForPie()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {getCurrentSentimentForPie().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? colors.positive : index === 1 ? colors.negative : colors.neutral} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col space-y-2 mt-4 md:mt-0">
              {['Positive', 'Negative', 'Neutral'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4" 
                    style={{ backgroundColor: colors[type.toLowerCase()] }} 
                  />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sentiment Trends</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="positive" 
                stroke={colors.positive} 
                fill={colors.positive} 
                fillOpacity={0.6} 
              />
              <Area 
                type="monotone" 
                dataKey="negative" 
                stroke={colors.negative} 
                fill={colors.negative} 
                fillOpacity={0.6} 
              />
              <Area 
                type="monotone" 
                dataKey="neutral" 
                stroke={colors.neutral} 
                fill={colors.neutral} 
                fillOpacity={0.6} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Keyword Analysis</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={keywordData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="word" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="count" name="Frequency">
                {keywordData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">24-Hour Sentiment & Volume</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={historicalSentiment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="positive" 
                stroke={colors.positive} 
                name="Positive Rate"
                strokeWidth={2}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="volume" 
                stroke={colors.blue} 
                name="Message Volume"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default PowerBISentimentDashboard;