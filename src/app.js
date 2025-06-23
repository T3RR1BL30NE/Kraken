import { marked } from 'marked';
import hljs from 'highlight.js';

class CodingBot {
  constructor() {
    this.currentProject = null;
    this.selectedModel = 'mistral7b';
    this.chatHistory = [];
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupMarkdown();
    this.loadChatHistory();
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
      this.addMessage('system', `Switched to ${e.target.value}`);
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

    // Attach file
    document.getElementById('attach-file').addEventListener('click', () => {
      this.attachFile();
    });
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
    // This would be replaced with actual API calls to your local models
    // For now, we'll simulate responses based on the selected model
    
    const responses = {
      mistral7b: this.getMistralResponse(message),
      starcoder2: this.getStarCoderResponse(message),
      codellama: this.getCodeLlamaResponse(message)
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    return responses[this.selectedModel] || "I'm here to help with your coding needs!";
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
      'optimize-performance': 'Optimize this code for better performance'
    };

    const message = actions[action];
    if (message) {
      document.getElementById('chat-input').value = message;
    }
  }

  addMessage(type, content) {
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

    // Save to history
    this.chatHistory.push({ type, content, timestamp: Date.now() });
    this.saveChatHistory();
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
    document.getElementById('chat-messages').innerHTML = '';
    this.chatHistory = [];
    this.saveChatHistory();
    
    // Add welcome message back
    this.addMessage('bot', `# 👋 Welcome back!

I'm ready to help with your coding projects. What would you like to work on?`);
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new CodingBot();
});