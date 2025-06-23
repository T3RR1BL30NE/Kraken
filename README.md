# Coding Bot Desktop

A powerful desktop application that interfaces with local AI models (Mistral7b, Starcoder2, Codellama) to assist with coding projects and development tasks.

## Features

- 🤖 **Multiple AI Models**: Switch between Mistral7b, StarCoder2, and CodeLlama
- 📁 **Project Integration**: Load and browse project files directly
- 💬 **Interactive Chat**: Natural conversation interface for coding assistance
- ⚡ **Quick Actions**: Pre-built prompts for common development tasks
- 🎨 **Modern UI**: Clean, dark-themed interface optimized for developers
- 💾 **Chat History**: Persistent conversation history
- 📝 **Code Highlighting**: Syntax highlighting for code snippets

## Quick Actions

- **Create Component**: Generate new React/Vue components
- **Add Tests**: Create unit tests for existing code
- **Refactor Code**: Improve code structure and maintainability
- **Add Documentation**: Generate comprehensive documentation
- **Optimize Performance**: Analyze and improve code performance

## Getting Started

### Prerequisites

- Node.js 18+ installed
- One or more local AI models running:
  - Mistral 7B
  - StarCoder2
  - CodeLlama

### Installation

1. Clone or download this project
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run in development mode:
```bash
npm run electron-dev
```

This will start both the Vite dev server and Electron application.

### Building

Build for production:
```bash
npm run build-electron
```

## Usage

1. **Select a Model**: Choose your preferred AI model from the dropdown
2. **Load Project**: Click "Select Project Folder" to browse your codebase
3. **Start Chatting**: Ask questions, request code generation, or use quick actions
4. **File Integration**: Click on files in the explorer to view their contents

## Model Integration

Currently, the app includes simulated responses for demonstration. To integrate with your actual local models, you'll need to:

1. Set up API endpoints for your models
2. Update the `callLocalModel` method in `src/app.js`
3. Configure the appropriate API calls for each model

Example integration:
```javascript
async callLocalModel(message) {
  const response = await fetch(`http://localhost:8000/api/${this.selectedModel}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: message, context: this.chatHistory })
  });
  return await response.json();
}
```

## Customization

- **Add Models**: Extend the model selector and response handlers
- **Custom Actions**: Add new quick actions in the sidebar
- **Themes**: Modify the CSS for different color schemes
- **File Types**: Extend file explorer to handle more file types

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the application.

## License

MIT License - see LICENSE file for details.