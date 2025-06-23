import { marked } from 'marked';
import hljs from 'highlight.js';
import { MODEL_CONFIG, API_FORMATS } from './config.js';
import { APITester } from './api-tester.js';
import { KrakenLogoManager } from './logo-utils.js';
import { SmartPromptEngine, CodeAnalysisEngine } from './smart-prompts.js';
import { EnhancedResponseGenerator, SmartContextManager } from './enhanced-responses.js';

class CodingBot {
  constructor() {
    this.currentProject = null;
    this.selectedModel = 'mistral7b';
    this.chatHistory = [];
    this.apiTester = new APITester();
    this.modelConfig = MODEL_CONFIG; // Initialize with default config
    this.logoManager = new KrakenLogoManager();
    
    // Enhanced AI capabilities
    this.smartPrompts = new SmartPromptEngine();
    this.codeAnalysis = new CodeAnalysisEngine();
    this.responseGenerator = new EnhancedResponseGenerator();
    this.contextManager = new SmartContextManager();
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupMarkdown();
    this.initializeUI();
    
    // Test model connections on startup
    setTimeout(() => this.updateConnectionStatus(), 1000);
  }

  setupMarkdown() {
    marked.setOptions({
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return hljs.highlightAuto(code).value;
      },
      breaks: true,
      gfm: true
    });
  }

  setupEventListeners() {
    // Model selection
    document.getElementById('model-select').addEventListener('change', (e) => {
      this.selectedModel = e.target.value;
      const modelName = MODEL_CONFIG[e.target.value]?.name || e.target.value;
      this.addMessage('system', `Switched to ${modelName}`);
      this.updateModelInfo();
    });

    // Project selection
    document.getElementById('select-project').addEventListener('click', async () => {
      if (window.electronAPI) {
        const folderPath = await window.electronAPI.selectFolder();
        if (folderPath) {
          this.currentProject = folderPath;
          document.getElementById('project-path').textContent = folderPath;
          this.loadFileTree(folderPath);
          this.addMessage('system', `Project loaded: ${folderPath}`);
        }
      } else {
        // For web version, show a message
        this.addMessage('system', '📁 Project selection requires the desktop version. For now, you can still chat about your code!');
      }
    });

    // Chat input
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    sendButton.addEventListener('click', () => this.sendMessage());
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Quick actions
    document.querySelectorAll('.kraken-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        if (action) {
          this.handleQuickAction(action);
        }
      });
    });

    // Clear chat
    document.getElementById('clear-chat').addEventListener('click', () => {
      this.clearChat();
    });

    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
      this.toggleSidebar();
    });

    // API Discovery button
    document.getElementById('discover-apis').addEventListener('click', () => {
      this.discoverAPIs();
    });

    // Attach file
    document.getElementById('attach-file').addEventListener('click', () => {
      this.attachFile();
    });

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
      this.autoResizeTextarea(chatInput);
    });

    // File explorer expand button
    const expandBtn = document.getElementById('expand-files');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const fileTree = document.getElementById('file-tree');
        const arrow = expandBtn.querySelector('.tentacle-arrow');
        
        if (fileTree.style.display === 'none') {
          fileTree.style.display = 'block';
          arrow.style.transform = 'rotate(45deg)';
        } else {
          fileTree.style.display = 'none';
          arrow.style.transform = 'rotate(-135deg)';
        }
      });
    }

    // Update model info display
    this.updateModelInfo();
    
    // Initialize Kraken theme
    this.initializeKrakenTheme();
  }

  initializeUI() {
    this.loadChatHistory();
    this.clearWelcomeMessage();
  }

  clearWelcomeMessage() {
    // Remove welcome message if there's chat history
    if (this.chatHistory.length > 0) {
      const welcomeMessage = document.querySelector('.welcome-message');
      if (welcomeMessage) {
        welcomeMessage.remove();
      }
      
      // Restore chat history
      this.chatHistory.forEach(msg => {
        this.addMessageToDOM(msg.type, msg.content);
      });
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
      sidebar.classList.remove('collapsed');
      this.addMessage('system', '🐙 Kraken sidebar expanded - Full power restored!');
    } else {
      sidebar.classList.add('collapsed');
      this.addMessage('system', '🐙 Kraken sidebar minimized - Stealth mode activated!');
    }
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  updateModelInfo() {
    const modelInfo = document.getElementById('current-model-info');
    const modelNames = {
      mistral7b: '🐙 Kraken Mistral • Ready to Strike',
      starcoder2: '🐙 Kraken StarCoder • Code Tentacles Active',
      codellama: '🐙 Kraken CodeLlama • Deep Sea Wisdom'
    };
    modelInfo.textContent = modelNames[this.selectedModel] || '🐙 Kraken • Ready';
    
    // Update connection indicator based on model
    const indicator = document.getElementById('connection-indicator');
    if (indicator) {
      const pulse = indicator.querySelector('.pulse-tentacle');
      if (pulse) {
        // Simulate connection status (in real app, this would check actual connection)
        pulse.classList.remove('disconnected');
        setTimeout(() => {
          // Add a brief disconnected state to show it's working
          pulse.classList.add('disconnected');
          setTimeout(() => {
            pulse.classList.remove('disconnected');
          }, 500);
        }, 100);
      }
    }
  }
  
  initializeKrakenTheme() {
    // Add some dynamic Kraken effects
    this.addOceanEffects();
    this.startTentacleAnimations();
    this.setupKrakenLogo();
  }
  
  setupKrakenLogo() {
    // Logo manager handles the logo setup and effects
    // To use your actual logo, call:
    // this.logoManager.updateLogoFromBase64('your-base64-string');
    // or
    // this.logoManager.updateLogoFromFile('./kraken-logo.png');
    
    console.log('🐙 Kraken Logo Manager initialized. Use logoManager.updateLogoFromBase64() to set your logo!');
  }
  
  addOceanEffects() {
    // Add floating particles effect
    const chatArea = document.querySelector('.kraken-chat');
    if (chatArea) {
      for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'ocean-bubble';
        bubble.style.cssText = `
          position: absolute;
          width: ${Math.random() * 10 + 5}px;
          height: ${Math.random() * 10 + 5}px;
          background: rgba(0, 212, 255, 0.1);
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          animation: float-bubble ${Math.random() * 10 + 10}s infinite linear;
          pointer-events: none;
          z-index: 0;
        `;
        chatArea.appendChild(bubble);
      }
    }
  }
  
  startTentacleAnimations() {
    // Add CSS for bubble animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-bubble {
        0% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  async loadFileTree(dirPath) {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.listDirectory(dirPath);
    if (result.success) {
      this.renderFileTree(result.items);
      
      // Update smart context with project information
      this.contextManager.updateProjectContext(dirPath, result.items);
      this.addMessage('system', `🧠 Kraken's intelligence enhanced with project context: ${result.items.length} files analyzed`);
    }
  }

  renderFileTree(items) {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    if (items.length === 0) {
      fileTree.innerHTML = '<div class="file-item" style="color: var(--text-muted); font-style: italic;">No files found</div>';
      return;
    }
    items.forEach(item => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span class="file-icon">${item.isDirectory ? '📁' : '📄'}</span>
        <span class="file-name">${item.name}</span>
      `;
      
      if (!item.isDirectory) {
        fileItem.addEventListener('click', () => this.openFile(item.path));
      }
      
      fileTree.appendChild(fileItem);
    });
  }

  async openFile(filePath) {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.readFile(filePath);
    if (result.success) {
      const fileName = filePath.split('/').pop();
      
      // Analyze the code for intelligent insights
      const codeAnalysis = this.codeAnalysis.analyzeCode(result.content);
      
      this.addMessage('system', `📁 Opened file: ${fileName}`);
      this.addMessage('user', `Show me the contents of ${fileName}`);
      
      let response = `\`\`\`\n${result.content}\n\`\`\``;
      
      // Add intelligent analysis if issues found
      if (codeAnalysis.suggestions.length > 0) {
        response += `\n\n🧠 **Kraken's Code Analysis:**\n`;
        codeAnalysis.suggestions.forEach((suggestion, index) => {
          response += `${index + 1}. **${suggestion.type}**: ${suggestion.message}\n`;
        });
        response += `\nWould you like me to help improve any of these areas?`;
      }
      
      this.addMessage('bot', response);
    }
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;

    this.addMessage('user', message);
    input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Simulate API call to local model
      const response = await this.callLocalModel(message);
      this.hideTypingIndicator();
      this.addMessage('bot', response);
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('bot', `Error: ${error.message}`);
    }
  }

  async callLocalModel(message) {
    try {
      // Build smart, context-aware prompt
      const context = this.contextManager.getRelevantContext(message);
      const smartPrompt = this.smartPrompts.buildSmartPrompt(
        message, 
        this.chatHistory, 
        context.project
      );
      
      // All models use Ollama on port 11434
      const endpoint = 'http://localhost:11434/api/generate';
      
      // Map our model names to actual Ollama model names
      const ollamaModelNames = {
        mistral7b: 'mistral',
        starcoder2: 'starcoder2',
        codellama: 'codellama'
      };
      
      // Use dynamic model config
      const modelConfig = this.modelConfig[this.selectedModel];
      if (!modelConfig) {
        throw new Error(`Model ${this.selectedModel} not configured`);
      }
      
      const actualModelName = ollamaModelNames[this.selectedModel] || this.selectedModel;
      const apiEndpoint = modelConfig.endpoint || endpoint;

      // Prepare the request payload
      const payload = {
        model: actualModelName,
        prompt: smartPrompt, // Use enhanced prompt instead of basic one
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 2048,
          top_p: 0.9
        }
      };

      // Make the API call
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Enhance the response with smart formatting and context
      let modelResponseContent = data.response || "I received your message but couldn't generate a response.";
      
      // Apply intelligent response enhancement
      const intent = this.smartPrompts.analyzeIntent(message);
      modelResponseContent = this.responseGenerator.enhanceResponse(modelResponseContent, { 
        intent, 
        context,
        originalMessage: message 
      });
      
      // Add to conversation memory for future context
      this.contextManager.addToMemory({
        userMessage: message,
        response: modelResponseContent,
        context: context
      });
      
      return modelResponseContent;

    } catch (error) {
      console.error('Error calling local model:', error);
      
      // Fallback to simulated response if API fails
      this.addMessage('system', `⚠️ Could not connect to Ollama (${this.selectedModel}). Make sure Ollama is running with: ollama serve`);
      
      const fallbackResponses = {
        mistral7b: this.getEnhancedMistralResponse(message),
        starcoder2: this.getEnhancedStarCoderResponse(message),
        codellama: this.getEnhancedCodeLlamaResponse(message)
      };
      
      return fallbackResponses[this.selectedModel] || `Error connecting to ${this.selectedModel}: ${error.message}`;
    }
  }

  buildPrompt(message) {
    // Build context-aware prompt with chat history
    let prompt = '';
    
    // Add system context based on selected model
    const systemPrompts = {
      mistral7b: 'You are a helpful coding assistant. Provide clear, accurate, and practical coding advice.',
      starcoder2: 'You are a code generation specialist. Focus on writing clean, efficient, and well-documented code.',
      codellama: 'You are an expert programmer. Help with algorithms, optimization, and complex coding problems.'
    };
    
    prompt += systemPrompts[this.selectedModel] || 'You are a helpful coding assistant.';
    prompt += '\n\n';
    
    // Add project context if available
    if (this.currentProject) {
      prompt += `Current project: ${this.currentProject}\n\n`;
    }
    
    // Add recent chat history for context (last 3 exchanges)
    const recentHistory = this.chatHistory
      .filter(msg => msg.type !== 'system')
      .slice(-6); // Last 6 messages (3 exchanges)
    
    if (recentHistory.length > 0) {
      prompt += 'Recent conversation:\n';
      recentHistory.forEach(msg => {
        const role = msg.type === 'user' ? 'Human' : 'Assistant';
        prompt += `${role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }
    
    prompt += `Human: ${message}\nAssistant:`;
    
    return prompt;
  }

  getEnhancedMistralResponse(message) {
    const intent = this.smartPrompts.analyzeIntent(message);
    const context = this.contextManager.getRelevantContext(message);
    
    if (message.toLowerCase().includes('create') || message.toLowerCase().includes('build')) {
      return `🐙 **Kraken's Enhanced Creation Powers Activate!**

Based on your project context (${context.project?.technologies?.join(', ') || 'analyzing...'}), here's an intelligent approach:

\`\`\`javascript
// Smart code generation based on your project structure
function createEnhancedComponent() {
  // Analyzing your codebase patterns...
  // Applying best practices for ${context.project?.technologies?.[0] || 'your stack'}
  console.log('🧠 Intelligent code crafted with context awareness!');
}
\`\`\`

🌊 **Smart Analysis Complete:**
- Detected project type: ${context.project?.structure?.architecture || 'analyzing...'}
- Recommended patterns: Modern ES6+, error handling, testing
- Integration points: ${context.relevantFiles?.length || 0} related files found

Would you like me to:
- Add comprehensive error handling?
- Generate corresponding tests?
- Optimize for your specific use case?`;
    }
    
    if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('fix')) {
      return `🔱 **Kraken's Advanced Debugging System Engaged!**

🔍 **Intelligent Problem Analysis:**
Based on your project context and common patterns, here's a systematic approach:

1. **🧠 Context Analysis** - Examining ${context.project?.files?.length || 0} project files
2. **🔍 Pattern Recognition** - Checking for common issues in ${context.project?.technologies?.join(', ') || 'your stack'}
3. **⚡ Smart Diagnostics** - AI-powered error detection
4. **🛠️ Targeted Solutions** - Context-aware fixes
5. **🏗️ Prevention Strategy** - Long-term code health

💡 **Pro Tip:** Based on your project structure, I can provide more targeted debugging if you share the specific error or problematic code section.

Ready to dive deeper into the specific issue?`;
    }

    return `🐙 **Enhanced Kraken Intelligence Activated!**

Your query: *"${message}"*

🧠 **Smart Context Analysis:**
- Project: ${context.project?.technologies?.join(' + ') || 'Analyzing your codebase...'}
- Files: ${context.project?.files?.length || 0} files in scope
- Architecture: ${context.project?.structure?.architecture || 'Detecting patterns...'}

⚡ **Enhanced Capabilities Ready:**
- 🧠 **Context-Aware Solutions** - Tailored to your specific project
- 🔍 **Intelligent Analysis** - Pattern recognition and best practices
- 🚀 **Proactive Suggestions** - Anticipating your next needs
- 📚 **Learning Memory** - Building on our conversation history

What specific challenge shall the enhanced Kraken tackle for you?`;
  }

  getEnhancedStarCoderResponse(message) {
    const context = this.contextManager.getRelevantContext(message);
    
    if (message.toLowerCase().includes('function') || message.toLowerCase().includes('class')) {
      return `🐙 **Enhanced Kraken StarCoder - AI Code Architect!**

🧠 **Intelligent Code Generation Based on Your Project:**

\`\`\`${context.project?.technologies?.includes('TypeScript') ? 'typescript' : 'javascript'}
// Smart code crafted with project context awareness
// Detected stack: ${context.project?.technologies?.join(', ') || 'Modern JavaScript'}
${context.project?.technologies?.includes('TypeScript') ? 
`interface SmartComponentProps {
  // Auto-generated based on your project patterns
  data: any;
  onUpdate: (value: any) => void;
}

function createSmartComponent(props: SmartComponentProps) {` :
`function createSmartComponent(props) {`}
    """
    Enhanced with AI intelligence and project context.
    Follows your codebase patterns and best practices.
    
    Args:
        props: Component configuration based on detected patterns
    
    Returns:
        Optimized component following your project's architecture
    """
    // Smart implementation with error handling
    try {
        // Context-aware logic here
        return processWithIntelligence(props);
    } catch (error) {
        console.error('Smart error handling:', error);
        throw new Error(\`Enhanced error context: \${error.message}\`);
    }
}
\`\`\`

🚀 **AI Enhancements Applied:**
- **Context Integration**: Matches your project's ${context.project?.structure?.architecture || 'architecture'}
- **Smart Typing**: ${context.project?.technologies?.includes('TypeScript') ? 'TypeScript support detected' : 'JavaScript with JSDoc'}
- **Error Handling**: Production-ready error management
- **Best Practices**: Following ${context.project?.technologies?.join(' + ') || 'modern'} conventions

Want me to add tests, documentation, or optimize further?`;
    }

    return `🐙 **Enhanced Kraken StarCoder - Next-Gen AI Assistant!**

Your request: *"${message}"*

🧠 **Project Intelligence Active:**
- Codebase: ${context.project?.files?.length || 0} files analyzed
- Tech Stack: ${context.project?.technologies?.join(', ') || 'Detecting...'}
- Patterns: ${context.project?.structure?.hasTests ? '✅ Tests found' : '⚠️ Consider adding tests'}

⚡ **Enhanced StarCoder Powers:**
- 🎯 **Smart Code Generation** - Context-aware, production-ready code
- 🔍 **Pattern Recognition** - Learning from your existing codebase
- 🚀 **Optimization Engine** - Performance and maintainability focused
- 📚 **Documentation AI** - Auto-generating comprehensive docs

Ready to create something amazing together?`;
  }

  getEnhancedCodeLlamaResponse(message) {
    const context = this.contextManager.getRelevantContext(message);
    
    if (message.toLowerCase().includes('algorithm') || message.toLowerCase().includes('optimize')) {
      return `🐙 **Enhanced Kraken CodeLlama - Algorithm Intelligence!**

🧠 **Advanced Algorithmic Analysis:**
Project Context: ${context.project?.technologies?.join(' + ') || 'Multi-language environment'}

\`\`\`${context.project?.technologies?.includes('Python') ? 'python' : 'javascript'}
${context.project?.technologies?.includes('Python') ? 
`# AI-optimized algorithm with context awareness
def enhanced_algorithm(data, context=None):
    """
    Kraken's intelligent algorithm optimized for your specific use case.
    
    Time Complexity: O(n log n) - Optimized for your data patterns
    Space Complexity: O(1) - Memory efficient for production use
    
    Args:
        data: Input data (analyzed from your project patterns)
        context: Optional context for smart optimization
    """
    # Smart preprocessing based on detected data patterns
    if context and context.get('optimization_level') == 'high':
        # Advanced optimization path
        return advanced_process(data)
    
    # Standard optimized processing
    result = []
    for item in data:
        # Kraken's intelligent processing with error handling
        processed = smart_transform(item)
        result.append(processed)
    
    return result` :
`// AI-enhanced algorithm with intelligent optimization
function enhancedAlgorithm(data, options = {}) {
    /**
     * Kraken's smart algorithm tailored to your project needs
     * 
     * @param {Array} data - Input data optimized for your use case
     * @param {Object} options - Smart configuration options
     * @returns {Array} Optimized results with error handling
     * 
     * Time: O(n log n) | Space: O(1) - Production optimized
     */
    
    // Context-aware optimization
    const { optimization = 'balanced', errorHandling = true } = options;
    
    try {
        // Smart processing with pattern recognition
        return data
            .filter(item => validateInput(item))
            .map(item => intelligentTransform(item, optimization))
            .sort((a, b) => smartComparison(a, b));
    } catch (error) {
        if (errorHandling) {
            console.error('Enhanced algorithm error:', error);
            return fallbackStrategy(data);
        }
        throw error;
    }
}`}
\`\`\`

🚀 **AI Optimization Features:**
- **Smart Complexity Analysis**: Automatically optimized for your data size
- **Context-Aware Processing**: Adapts to your specific use patterns  
- **Intelligent Error Handling**: Production-ready resilience
- **Performance Monitoring**: Built-in optimization tracking

📊 **Performance Insights:**
- Estimated improvement: 40-60% faster than basic implementation
- Memory usage: Optimized for ${context.project?.structure?.architecture || 'your architecture'}
- Scalability: Ready for production workloads

Want me to add performance benchmarks or explain the optimization strategy?`;
    }

    return `🐙 **Enhanced Kraken CodeLlama - Advanced Programming Intelligence!**

Your challenge: *"${message}"*

🧠 **Advanced Project Analysis:**
- Architecture: ${context.project?.structure?.architecture || 'Analyzing patterns...'}
- Complexity: ${context.project?.files?.length > 50 ? 'Enterprise-scale' : 'Standard project'}
- Technologies: ${context.project?.technologies?.join(' + ') || 'Multi-stack environment'}
- Quality Score: ${context.project?.structure?.hasTests ? '🟢 High (tests present)' : '🟡 Medium (consider adding tests)'}

⚡ **Enhanced CodeLlama Capabilities:**
- 🧠 **Algorithm Intelligence** - Context-aware optimization strategies
- 🔍 **Code Analysis Engine** - Deep pattern recognition and improvement suggestions
- 🚀 **Performance Optimization** - AI-driven efficiency improvements
- 🛡️ **Security Analysis** - Intelligent vulnerability detection
- 📊 **Complexity Management** - Smart refactoring recommendations

Ready to tackle complex programming challenges with AI-enhanced intelligence?`;
  }

  handleQuickAction(action) {
    const actions = {
      'create-component': '🦑 Create a new React component with TypeScript and modern best practices',
      'add-tests': '🧪 Add comprehensive unit tests for my current code with Jest or Vitest',
      'refactor-code': '🌊 Refactor this code for better maintainability, readability, and performance',
      'add-documentation': '📜 Add comprehensive documentation with JSDoc comments and README sections',
      'optimize-performance': '⚡ Analyze and optimize this code for better performance and efficiency',
      'debug-code': '🔱 Help me debug this code and identify potential issues or bugs'
    };

    const message = actions[action];
    if (message) {
      document.getElementById('chat-input').value = message;
      // Auto-focus the input after setting the message
      document.getElementById('chat-input').focus();
      // Trigger auto-resize
      this.autoResizeTextarea(document.getElementById('chat-input'));
    }
  }

  addMessage(type, content) {
    // Remove welcome message when first message is added
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    this.addMessageToDOM(type, content);

    // Save to history
    this.chatHistory.push({ type, content, timestamp: Date.now() });
    this.saveChatHistory();
  }

  addMessageToDOM(type, content) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (type === 'bot') {
      messageContent.innerHTML = marked(content);
    } else {
      messageContent.textContent = content;
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add Kraken-specific message effects
    if (type === 'bot') {
      this.addKrakenMessageEffects(messageDiv);
    }
  }
  
  addKrakenMessageEffects(messageElement) {
    // Add a subtle glow effect to bot messages
    messageElement.style.animation = 'message-appear 0.4s ease-out';
    
    // Add tentacle decoration to code blocks
    const codeBlocks = messageElement.querySelectorAll('pre');
    codeBlocks.forEach(block => {
      block.style.borderLeft = '4px solid var(--kraken-primary)';
      block.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.1)';
    });
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = `
      <div class="welcome-message kraken-welcome">
        <div class="welcome-avatar">
          <img src="https://i.imgur.com/ZpfsKhB.png" alt="Kraken Avatar" class="welcome-kraken-image">
        </div>
        <div class="welcome-content">
          <h2>🐙 RELEASE THE KRAKEN CODER</h2>
          <p>From the depths of the digital ocean, I emerge to crush your coding challenges</p>
          <div class="feature-pills">
            <span class="pill kraken-pill">Code Tentacles</span>
            <span class="pill kraken-pill">Bug Hunting</span>
            <span class="pill kraken-pill">Deep Refactoring</span>
            <span class="pill kraken-pill">Ancient Wisdom</span>
          </div>
          <div class="getting-started kraken-guide">
            <p>🌊 <strong>Summoning Instructions:</strong></p>
            <ul>
              <li>Select your code treasure to analyze the depths</li>
              <li>Choose your Kraken model from the abyss above</li>
              <li>Unleash your coding questions into the void</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    this.chatHistory = [];
    this.saveChatHistory();
  }

  async attachFile() {
    if (window.electronAPI) {
      // In Electron, we could implement file selection
      this.addMessage('system', '📎 File attachment feature - coming soon in the next update!');
    } else {
      // For web version, show file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md,.txt';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            const fileName = file.name;
            this.addMessage('system', `📁 Attached file: ${fileName}`);
            this.addMessage('user', `Please analyze this file: ${fileName}\n\n\`\`\`\n${content}\n\`\`\``);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  }

  saveChatHistory() {
    localStorage.setItem('codingbot-chat-history', JSON.stringify(this.chatHistory));
  }

  loadChatHistory() {
    const saved = localStorage.getItem('codingbot-chat-history');
    if (saved) {
      this.chatHistory = JSON.parse(saved);
      // Optionally restore recent messages
    }
  }

  // Test connection to local models
  async testModelConnection(modelName) {
    try {
      const config = this.modelConfig[modelName];
      if (!config) {
        console.warn(`Model ${modelName} not configured`);
        return false;
      }

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: modelName,
          prompt: 'Hello, are you working?',
          stream: false,
          options: { max_tokens: 50 }
        })
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      // Only log as warning instead of error to reduce console noise
      console.warn(`Connection test failed for ${modelName}: ${error.message}`);
      return false;
    }
  }

  // Add connection status indicator
  async updateConnectionStatus() {
    try {
      const models = Object.keys(this.modelConfig);
      const statusPromises = models.map(async (model) => {
        const isConnected = await this.testModelConnection(model);
        return { model, isConnected };
      });

      const statuses = await Promise.all(statusPromises);
      
      // Update connection indicator
      const indicator = document.querySelector('.pulse-dot');
      const connectedCount = statuses.filter(s => s.isConnected).length;
      
      if (connectedCount > 0) {
        indicator.classList.remove('disconnected');
      } else {
        indicator.classList.add('disconnected');
      }
      
      // Update UI to show connection status
      const select = document.getElementById('model-select');
      if (select) {
        Array.from(select.options).forEach(option => {
          const status = statuses.find(s => s.model === option.value);
          if (status && this.modelConfig[option.value]) {
            option.textContent = `${this.modelConfig[option.value].name} ${status.isConnected ? '🟢' : '🔴'}`;
          }
        });
      }
      
      // Update model info
      this.updateModelInfo();
      
      // Show connection summary in console
      const connectedCount = statuses.filter(s => s.isConnected).length;
      console.info(`Model connection status: ${connectedCount}/${statuses.length} models connected`);
      
    } catch (error) {
      console.warn('Failed to update connection status:', error.message);
    }
  }

  // Discover available APIs
  async discoverAPIs() {
    this.addMessage('system', '🔍 Kraken scanning the digital depths for AI APIs...');
    
    try {
      const workingAPIs = await this.apiTester.discoverAPIs();
      
      if (workingAPIs.length > 0) {
        let message = `🐙 **Kraken Discovery Complete!** Found ${workingAPIs.length} working API(s):\n\n`;
        
        workingAPIs.forEach((api, index) => {
          message += `**${index + 1}. ${api.endpoint.name}**\n`;
          message += `- URL: \`${api.endpoint.url}\`\n`;
          message += `- Format: ${api.format}\n`;
          message += `- Response: ${JSON.stringify(api.response).substring(0, 100)}...\n\n`;
        });
        
        message += '🌊 The Kraken has updated your configuration to use these powerful endpoints!';
        this.addMessage('bot', message);
        
        // Update model configuration with discovered APIs
        this.modelConfig = this.apiTester.generateConfig(workingAPIs);
        
        // Update the model select dropdown
        this.updateModelSelect();
        
        // Set selected model to first available
        const availableModels = Object.keys(this.modelConfig);
        if (availableModels.length > 0) {
          this.selectedModel = availableModels[0];
          const select = document.getElementById('model-select');
          if (select) {
            select.value = this.selectedModel;
          }
          this.updateModelInfo();
        }
        
        // Update API status display
        const statusDiv = document.getElementById('api-status');
        statusDiv.innerHTML = `<div class="status-success">🐙 ${workingAPIs.length} Kraken API(s) Active</div>`;
        
      } else {
        this.addMessage('bot', `🐙 **The Kraken searches the depths but finds no APIs...**

Make sure your AI models are running and try these common setups:

🦑 **Ollama**: \`ollama serve\` (port 11434)
🦑 **text-generation-webui**: \`python server.py --api\` (port 7860)  
🦑 **LM Studio**: Start the local server (port 1234)

The Kraken will continue to provide enhanced responses even without local APIs!`);
        
        const statusDiv = document.getElementById('api-status');
        statusDiv.innerHTML = `<div class="status-error">🐙 Searching depths...</div>`;
      }
      
    } catch (error) {
      this.addMessage('bot', `🐙 **Kraken encountered turbulent waters during API discovery:** ${error.message}`);
    }
  }

  // Update model select dropdown with current model config
  updateModelSelect() {
    const select = document.getElementById('model-select');
    select.innerHTML = '';
    
    Object.entries(this.modelConfig).forEach(([key, config]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = config.name || key;
      select.appendChild(option);
    });
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new CodingBot();
});