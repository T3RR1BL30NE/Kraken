import { marked } from 'marked';
import hljs from 'highlight.js';
import { MODEL_CONFIG, API_FORMATS } from './config.js';
import { APITester } from './api-tester.js';

class CodingBot {
  constructor() {
    this.currentProject = null;
    this.selectedModel = 'mistral7b';
    this.chatHistory = [];
    this.apiTester = new APITester();
    this.modelConfig = MODEL_CONFIG; // Initialize with default config
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
    });

    // Quick actions
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
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
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('input', () => {
      this.autoResizeTextarea(chatInput);
    });

    // Update model info display
    this.updateModelInfo();
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
    sidebar.classList.toggle('collapsed');
  }

  autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }

  updateModelInfo() {
    const modelInfo = document.getElementById('current-model-info');
    const modelName = MODEL_CONFIG[this.selectedModel]?.name || this.selectedModel;
    modelInfo.textContent = `${modelName} • Ready`;
  }

  async loadFileTree(dirPath) {
    if (!window.electronAPI) return;
    
    const result = await window.electronAPI.listDirectory(dirPath);
    if (result.success) {
      this.renderFileTree(result.items);
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
      this.addMessage('system', `Opened file: ${fileName}`);
      this.addMessage('user', `Show me the contents of ${fileName}`);
      this.addMessage('bot', `\`\`\`\n${result.content}\n\`\`\``);
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
        prompt: this.buildPrompt(message),
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
      
      // Ollama returns the response in the 'response' field
      return data.response || "I received your message but couldn't generate a response.";

    } catch (error) {
      console.error('Error calling local model:', error);
      
      // Fallback to simulated response if API fails
      this.addMessage('system', `⚠️ Could not connect to Ollama (${this.selectedModel}). Make sure Ollama is running with: ollama serve`);
      
      const fallbackResponses = {
        mistral7b: this.getMistralResponse(message),
        starcoder2: this.getStarCoderResponse(message),
        codellama: this.getCodeLlamaResponse(message)
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

  getMistralResponse(message) {
    if (message.toLowerCase().includes('create') || message.toLowerCase().includes('build')) {
      return `I'll help you create that! Here's a basic structure:

\`\`\`javascript
// Example implementation
function createProject() {
  // Your code here
  console.log('Project created successfully!');
}
\`\`\`

Would you like me to elaborate on any specific part?`;
    }
    
    if (message.toLowerCase().includes('debug') || message.toLowerCase().includes('fix')) {
      return `Let me help you debug that issue. Here are some common debugging steps:

1. **Check the console** for error messages
2. **Add logging** to trace execution flow
3. **Verify inputs** and data types
4. **Test edge cases**

Could you share the specific code that's causing issues?`;
    }

    return `I understand you want help with: "${message}"

As Mistral 7B, I can assist with:
- Code generation and explanation
- Debugging and troubleshooting
- Architecture and design patterns
- Best practices and optimization

What specific aspect would you like me to focus on?`;
  }

  getStarCoderResponse(message) {
    if (message.toLowerCase().includes('function') || message.toLowerCase().includes('class')) {
      return `Here's a well-structured implementation:

\`\`\`python
def example_function(param1, param2):
    """
    Example function with proper documentation.
    
    Args:
        param1: Description of parameter 1
        param2: Description of parameter 2
    
    Returns:
        Description of return value
    """
    # Implementation here
    return param1 + param2

# Usage example
result = example_function("Hello", " World")
print(result)
\`\`\`

This follows best practices for code structure and documentation.`;
    }

    return `As StarCoder2, I specialize in code generation and completion. 

For your request: "${message}"

I can help with:
- Writing clean, efficient code
- Code completion and suggestions
- Following coding standards
- Multi-language support

What programming language and specific functionality do you need?`;
  }

  getCodeLlamaResponse(message) {
    if (message.toLowerCase().includes('algorithm') || message.toLowerCase().includes('optimize')) {
      return `Here's an optimized approach:

\`\`\`python
def optimized_solution(data):
    # Time complexity: O(n)
    # Space complexity: O(1)
    
    result = []
    for item in data:
        # Efficient processing
        processed = process_item(item)
        result.append(processed)
    
    return result

def process_item(item):
    # Optimized item processing
    return item * 2  # Example operation
\`\`\`

This solution is optimized for both time and space complexity.`;
    }

    return `As CodeLlama, I'm focused on code understanding and generation.

For: "${message}"

I can help with:
- Algorithm implementation
- Code optimization
- Complex problem solving
- Performance analysis

What specific coding challenge can I help you solve?`;
  }

  handleQuickAction(action) {
    const actions = {
      'create-component': 'Create a new React component with TypeScript',
      'add-tests': 'Add unit tests for the current code',
      'refactor-code': 'Refactor this code for better maintainability',
      'add-documentation': 'Add comprehensive documentation',
      'optimize-performance': 'Optimize this code for better performance',
      'debug-code': 'Help me debug this code and find potential issues'
    };

    const message = actions[action];
    if (message) {
      document.getElementById('chat-input').value = message;
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
      <div class="welcome-message">
        <div class="welcome-avatar">
          <div class="avatar-gradient">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 18l6-6-6-6"/>
              <path d="M8 6l-6 6 6 6"/>
            </svg>
          </div>
        </div>
        <div class="welcome-content">
          <h2>Welcome back to CodeBot AI</h2>
          <p>Ready to help with your next coding challenge</p>
          <div class="feature-pills">
            <span class="pill">Code Generation</span>
            <span class="pill">Debugging</span>
            <span class="pill">Refactoring</span>
            <span class="pill">Documentation</span>
          </div>
        </div>
      </div>
    `;
    
    this.chatHistory = [];
    this.saveChatHistory();
  }

  async attachFile() {
    // This would open a file dialog and attach the file content to the chat
    this.addMessage('system', 'File attachment feature - coming soon!');
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
    this.addMessage('system', '🔍 Discovering local AI APIs...');
    
    try {
      const workingAPIs = await this.apiTester.discoverAPIs();
      
      if (workingAPIs.length > 0) {
        let message = `✅ Found ${workingAPIs.length} working API(s):\n\n`;
        
        workingAPIs.forEach((api, index) => {
          message += `**${index + 1}. ${api.endpoint.name}**\n`;
          message += `- URL: \`${api.endpoint.url}\`\n`;
          message += `- Format: ${api.format}\n`;
          message += `- Response: ${JSON.stringify(api.response).substring(0, 100)}...\n\n`;
        });
        
        message += 'I can update your configuration to use these endpoints. Would you like me to do that?';
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
        statusDiv.innerHTML = `<div class="status-success">Found ${workingAPIs.length} API(s)</div>`;
        
      } else {
        this.addMessage('bot', `❌ No working APIs found. Make sure your AI models are running and try these common setups:

**Ollama**: \`ollama serve\` (port 11434)
**text-generation-webui**: \`python server.py --api\` (port 7860)
**LM Studio**: Start the local server (port 1234)

Check the console for detailed error messages.`);
        
        const statusDiv = document.getElementById('api-status');
        statusDiv.innerHTML = `<div class="status-error">No APIs found</div>`;
      }
      
    } catch (error) {
      this.addMessage('bot', `Error during API discovery: ${error.message}`);
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