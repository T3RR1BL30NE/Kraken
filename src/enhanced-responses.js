// Enhanced Response Generation System
// Provides more intelligent and contextual responses

export class EnhancedResponseGenerator {
  constructor() {
    this.responseTemplates = new Map();
    this.setupTemplates();
  }

  setupTemplates() {
    this.responseTemplates.set('debug', {
      structure: [
        '🔍 **Problem Analysis**',
        '🛠️ **Solution Steps**', 
        '⚡ **Quick Fix**',
        '🏗️ **Long-term Prevention**',
        '📚 **Additional Resources**'
      ],
      tone: 'analytical'
    });

    this.responseTemplates.set('optimize', {
      structure: [
        '📊 **Performance Analysis**',
        '⚡ **Optimization Strategies**',
        '💡 **Implementation**',
        '📈 **Expected Improvements**',
        '⚠️ **Trade-offs to Consider**'
      ],
      tone: 'technical'
    });

    this.responseTemplates.set('explain', {
      structure: [
        '🎯 **Core Concept**',
        '🔧 **How It Works**',
        '💡 **Practical Examples**',
        '🌟 **Best Practices**',
        '🚀 **Next Steps**'
      ],
      tone: 'educational'
    });

    this.responseTemplates.set('generate', {
      structure: [
        '🏗️ **Implementation Plan**',
        '💻 **Code Solution**',
        '🧪 **Testing Approach**',
        '📝 **Documentation**',
        '🔄 **Potential Improvements**'
      ],
      tone: 'constructive'
    });
  }

  enhanceResponse(originalResponse, context) {
    const intent = context.intent || 'general';
    const template = this.responseTemplates.get(intent);
    
    if (!template) return originalResponse;

    // Add structure and enhanced formatting
    let enhancedResponse = this.addKrakenPersonality(originalResponse);
    enhancedResponse = this.addCodeExamples(enhancedResponse, context);
    enhancedResponse = this.addFollowUpSuggestions(enhancedResponse, context);

    return enhancedResponse;
  }

  addKrakenPersonality(response) {
    // Add Kraken-themed introductions based on content type
    if (response.includes('error') || response.includes('debug')) {
      return `🐙 **The Kraken's Debugging Tentacles Activate!**\n\n${response}`;
    }
    
    if (response.includes('optimize') || response.includes('performance')) {
      return `⚡ **Kraken's Lightning-Fast Optimization Powers!**\n\n${response}`;
    }
    
    if (response.includes('create') || response.includes('build')) {
      return `🏗️ **The Kraken Forges Code from the Digital Depths!**\n\n${response}`;
    }

    return `🐙 **Kraken's Ancient Wisdom Emerges:**\n\n${response}`;
  }

  addCodeExamples(response, context) {
    // This would analyze the response and add relevant code examples
    // For now, return as-is
    return response;
  }

  addFollowUpSuggestions(response, context) {
    const suggestions = [
      "\n\n🌊 **What's Next?**",
      "- Need help implementing this solution?",
      "- Want me to explain any part in more detail?", 
      "- Should we add error handling or tests?",
      "- Ready to tackle the next challenge?"
    ];

    return response + suggestions.join('\n');
  }
}

// Smart Context Manager
export class SmartContextManager {
  constructor() {
    this.projectContext = null;
    this.fileContexts = new Map();
    this.conversationMemory = [];
    this.userPatterns = new Map();
  }

  updateProjectContext(projectPath, fileTree) {
    this.projectContext = {
      path: projectPath,
      files: fileTree,
      lastUpdated: Date.now(),
      technologies: this.detectTechnologies(fileTree),
      structure: this.analyzeStructure(fileTree)
    };
  }

  detectTechnologies(fileTree) {
    const technologies = new Set();
    
    fileTree.forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const name = file.name.toLowerCase();
      
      // Detect by file extension
      switch (ext) {
        case 'js': case 'jsx': technologies.add('JavaScript'); break;
        case 'ts': case 'tsx': technologies.add('TypeScript'); break;
        case 'py': technologies.add('Python'); break;
        case 'java': technologies.add('Java'); break;
        case 'cpp': case 'cc': case 'cxx': technologies.add('C++'); break;
        case 'c': technologies.add('C'); break;
        case 'rs': technologies.add('Rust'); break;
        case 'go': technologies.add('Go'); break;
        case 'php': technologies.add('PHP'); break;
        case 'rb': technologies.add('Ruby'); break;
        case 'swift': technologies.add('Swift'); break;
        case 'kt': technologies.add('Kotlin'); break;
      }
      
      // Detect by filename
      if (name === 'package.json') technologies.add('Node.js');
      if (name === 'requirements.txt') technologies.add('Python');
      if (name === 'cargo.toml') technologies.add('Rust');
      if (name === 'go.mod') technologies.add('Go');
      if (name === 'pom.xml') technologies.add('Maven');
      if (name === 'build.gradle') technologies.add('Gradle');
    });

    return Array.from(technologies);
  }

  analyzeStructure(fileTree) {
    const structure = {
      hasTests: false,
      hasConfig: false,
      hasDocs: false,
      architecture: 'unknown'
    };

    const fileNames = fileTree.map(f => f.name.toLowerCase());
    
    structure.hasTests = fileNames.some(name => 
      name.includes('test') || name.includes('spec')
    );
    
    structure.hasConfig = fileNames.some(name =>
      name.includes('config') || name.includes('.env')
    );
    
    structure.hasDocs = fileNames.some(name =>
      name.includes('readme') || name.includes('doc')
    );

    // Detect architecture patterns
    if (fileNames.includes('src') && fileNames.includes('components')) {
      structure.architecture = 'component-based';
    } else if (fileNames.includes('controllers') && fileNames.includes('models')) {
      structure.architecture = 'mvc';
    }

    return structure;
  }

  getRelevantContext(userMessage) {
    return {
      project: this.projectContext,
      conversation: this.conversationMemory.slice(-5),
      userPatterns: this.getUserPatterns(),
      relevantFiles: this.findRelevantFiles(userMessage)
    };
  }

  findRelevantFiles(userMessage) {
    if (!this.projectContext) return [];
    
    const keywords = userMessage.toLowerCase().split(' ');
    const relevantFiles = [];
    
    this.projectContext.files.forEach(file => {
      const fileName = file.name.toLowerCase();
      if (keywords.some(keyword => fileName.includes(keyword))) {
        relevantFiles.push(file);
      }
    });

    return relevantFiles;
  }

  getUserPatterns() {
    // Analyze user's coding patterns and preferences
    return {
      preferredLanguage: this.getMostUsedLanguage(),
      complexity: this.getPreferredComplexity(),
      style: this.getPreferredStyle()
    };
  }

  getMostUsedLanguage() {
    // Analyze conversation history to determine preferred language
    return 'JavaScript'; // Placeholder
  }

  getPreferredComplexity() {
    // Analyze if user prefers simple or detailed explanations
    return 'detailed'; // Placeholder
  }

  getPreferredStyle() {
    // Analyze user's preferred coding style
    return 'modern'; // Placeholder
  }

  addToMemory(interaction) {
    this.conversationMemory.push({
      timestamp: Date.now(),
      userMessage: interaction.userMessage,
      response: interaction.response,
      context: interaction.context
    });

    // Keep only last 20 interactions
    if (this.conversationMemory.length > 20) {
      this.conversationMemory = this.conversationMemory.slice(-20);
    }
  }
}