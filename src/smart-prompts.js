// Smart Prompt Engineering System
// Enhances AI responses with better context and reasoning

export class SmartPromptEngine {
  constructor() {
    this.conversationContext = [];
    this.codeContext = new Map();
    this.projectAnalysis = null;
    this.userPreferences = {
      language: 'javascript',
      framework: 'react',
      style: 'modern',
      verbosity: 'detailed'
    };
  }

  // Build context-aware prompts
  buildSmartPrompt(userMessage, chatHistory, projectContext) {
    const systemPrompt = this.getSystemPrompt();
    const contextPrompt = this.buildContextPrompt(projectContext);
    const historyPrompt = this.buildHistoryPrompt(chatHistory);
    const enhancedUserPrompt = this.enhanceUserMessage(userMessage);
    
    return `${systemPrompt}\n\n${contextPrompt}\n\n${historyPrompt}\n\n${enhancedUserPrompt}`;
  }

  getSystemPrompt() {
    return `You are Kraken Coder, an advanced AI programming assistant with deep expertise in:

CORE CAPABILITIES:
- Code analysis, generation, and optimization
- Architecture design and best practices
- Debugging and problem-solving
- Performance optimization
- Security analysis
- Code review and refactoring

INTELLIGENCE FEATURES:
- Context-aware responses based on project structure
- Multi-step reasoning for complex problems
- Pattern recognition in code issues
- Proactive suggestions for improvements
- Learning from conversation history

RESPONSE STYLE:
- Provide detailed explanations with reasoning
- Include multiple solution approaches when applicable
- Anticipate follow-up questions and address them
- Use examples and code snippets effectively
- Maintain the Kraken theme while being professional

ANALYSIS APPROACH:
1. Understand the full context before responding
2. Break down complex problems into steps
3. Consider edge cases and potential issues
4. Provide both immediate solutions and long-term improvements
5. Explain the "why" behind recommendations`;
  }

  buildContextPrompt(projectContext) {
    if (!projectContext) return '';

    let prompt = 'PROJECT CONTEXT:\n';
    
    if (projectContext.structure) {
      prompt += `Project Structure: ${JSON.stringify(projectContext.structure, null, 2)}\n`;
    }
    
    if (projectContext.technologies) {
      prompt += `Technologies: ${projectContext.technologies.join(', ')}\n`;
    }
    
    if (projectContext.currentFile) {
      prompt += `Current File: ${projectContext.currentFile}\n`;
    }
    
    if (projectContext.recentChanges) {
      prompt += `Recent Changes: ${projectContext.recentChanges}\n`;
    }

    return prompt;
  }

  buildHistoryPrompt(chatHistory) {
    if (!chatHistory || chatHistory.length === 0) return '';

    // Get last 6 messages for context (3 exchanges)
    const recentHistory = chatHistory.slice(-6);
    let prompt = 'CONVERSATION CONTEXT:\n';
    
    recentHistory.forEach((msg, index) => {
      const role = msg.type === 'user' ? 'User' : 'Assistant';
      prompt += `${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
    });

    return prompt;
  }

  enhanceUserMessage(message) {
    // Analyze user intent and add context
    const intent = this.analyzeIntent(message);
    const complexity = this.assessComplexity(message);
    
    let enhancedPrompt = `USER REQUEST: ${message}\n\n`;
    enhancedPrompt += `DETECTED INTENT: ${intent}\n`;
    enhancedPrompt += `COMPLEXITY LEVEL: ${complexity}\n\n`;
    
    // Add specific instructions based on intent
    switch (intent) {
      case 'debug':
        enhancedPrompt += 'Please provide step-by-step debugging approach, common causes, and prevention strategies.\n';
        break;
      case 'optimize':
        enhancedPrompt += 'Analyze performance bottlenecks, suggest optimizations, and explain trade-offs.\n';
        break;
      case 'explain':
        enhancedPrompt += 'Provide comprehensive explanation with examples and use cases.\n';
        break;
      case 'generate':
        enhancedPrompt += 'Create well-documented, production-ready code with error handling.\n';
        break;
      case 'review':
        enhancedPrompt += 'Conduct thorough code review covering functionality, style, and best practices.\n';
        break;
    }

    return enhancedPrompt;
  }

  analyzeIntent(message) {
    const debugKeywords = ['debug', 'error', 'fix', 'broken', 'issue', 'problem', 'bug'];
    const optimizeKeywords = ['optimize', 'performance', 'faster', 'improve', 'efficient'];
    const explainKeywords = ['explain', 'how', 'why', 'what', 'understand', 'clarify'];
    const generateKeywords = ['create', 'generate', 'build', 'make', 'write', 'implement'];
    const reviewKeywords = ['review', 'check', 'analyze', 'evaluate', 'assess'];

    const lowerMessage = message.toLowerCase();

    if (debugKeywords.some(keyword => lowerMessage.includes(keyword))) return 'debug';
    if (optimizeKeywords.some(keyword => lowerMessage.includes(keyword))) return 'optimize';
    if (explainKeywords.some(keyword => lowerMessage.includes(keyword))) return 'explain';
    if (generateKeywords.some(keyword => lowerMessage.includes(keyword))) return 'generate';
    if (reviewKeywords.some(keyword => lowerMessage.includes(keyword))) return 'review';

    return 'general';
  }

  assessComplexity(message) {
    const complexIndicators = [
      'architecture', 'design pattern', 'scalability', 'microservices',
      'algorithm', 'optimization', 'security', 'performance',
      'database', 'api', 'integration', 'deployment'
    ];

    const lowerMessage = message.toLowerCase();
    const complexityScore = complexIndicators.filter(indicator => 
      lowerMessage.includes(indicator)
    ).length;

    if (complexityScore >= 3) return 'high';
    if (complexityScore >= 1) return 'medium';
    return 'low';
  }

  // Analyze project structure for better context
  analyzeProject(projectPath, fileTree) {
    const analysis = {
      type: 'unknown',
      technologies: [],
      structure: {},
      patterns: [],
      suggestions: []
    };

    if (!fileTree) return analysis;

    // Detect project type
    const files = fileTree.map(f => f.name.toLowerCase());
    
    if (files.includes('package.json')) {
      analysis.type = 'node';
      analysis.technologies.push('Node.js');
    }
    
    if (files.includes('index.html')) {
      analysis.technologies.push('HTML');
    }
    
    if (files.some(f => f.endsWith('.jsx') || f.endsWith('.tsx'))) {
      analysis.technologies.push('React');
    }
    
    if (files.some(f => f.endsWith('.vue'))) {
      analysis.technologies.push('Vue.js');
    }
    
    if (files.some(f => f.endsWith('.py'))) {
      analysis.technologies.push('Python');
    }

    // Analyze structure patterns
    if (files.includes('src')) {
      analysis.patterns.push('src-based-structure');
    }
    
    if (files.includes('components')) {
      analysis.patterns.push('component-architecture');
    }

    return analysis;
  }

  // Generate follow-up questions
  generateFollowUpQuestions(userMessage, response) {
    const questions = [];
    
    if (userMessage.toLowerCase().includes('error')) {
      questions.push("Would you like me to help you set up error handling for this?");
      questions.push("Should we add logging to track similar issues in the future?");
    }
    
    if (userMessage.toLowerCase().includes('optimize')) {
      questions.push("Would you like me to analyze other performance bottlenecks?");
      questions.push("Should we set up performance monitoring?");
    }
    
    if (userMessage.toLowerCase().includes('create') || userMessage.toLowerCase().includes('build')) {
      questions.push("Would you like me to add tests for this code?");
      questions.push("Should we add error handling and validation?");
    }

    return questions;
  }
}

// Code Analysis Engine
export class CodeAnalysisEngine {
  constructor() {
    this.patterns = new Map();
    this.antiPatterns = new Map();
    this.setupPatterns();
  }

  setupPatterns() {
    // Common code patterns and their improvements
    this.patterns.set('callback-hell', {
      detect: (code) => code.includes('function(') && code.split('function(').length > 3,
      suggestion: 'Consider using async/await or Promises to avoid callback hell'
    });

    this.patterns.set('magic-numbers', {
      detect: (code) => /\b\d{2,}\b/.test(code),
      suggestion: 'Consider extracting magic numbers into named constants'
    });

    this.patterns.set('long-functions', {
      detect: (code) => code.split('\n').length > 50,
      suggestion: 'Consider breaking this function into smaller, more focused functions'
    });
  }

  analyzeCode(code) {
    const issues = [];
    const suggestions = [];

    for (const [patternName, pattern] of this.patterns) {
      if (pattern.detect(code)) {
        suggestions.push({
          type: patternName,
          message: pattern.suggestion,
          severity: 'medium'
        });
      }
    }

    return { issues, suggestions };
  }

  generateImprovedCode(originalCode, analysis) {
    // This would contain logic to automatically improve code
    // based on detected patterns
    return originalCode; // Placeholder
  }
}