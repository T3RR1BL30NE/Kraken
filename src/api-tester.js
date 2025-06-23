// API Discovery Tool - helps find the correct API format for your local models

export class APITester {
  constructor() {
    this.commonEndpoints = [
      // Ollama
      { name: 'Ollama', url: 'http://localhost:11434/api/generate', format: 'ollama' },
      { name: 'Ollama Alt', url: 'http://localhost:11434/v1/chat/completions', format: 'openai' },
      
      // text-generation-webui
      { name: 'Text-Gen WebUI', url: 'http://localhost:7860/api/v1/generate', format: 'textgen' },
      { name: 'Text-Gen WebUI Chat', url: 'http://localhost:7860/v1/chat/completions', format: 'openai' },
      
      // LM Studio
      { name: 'LM Studio', url: 'http://localhost:1234/v1/chat/completions', format: 'openai' },
      
      // vLLM
      { name: 'vLLM', url: 'http://localhost:8000/v1/completions', format: 'openai' },
      { name: 'vLLM Chat', url: 'http://localhost:8000/v1/chat/completions', format: 'openai' },
      
      // LocalAI
      { name: 'LocalAI', url: 'http://localhost:8080/v1/chat/completions', format: 'openai' },
      
      // Custom ports (common alternatives)
      { name: 'Custom 5000', url: 'http://localhost:5000/api/generate', format: 'ollama' },
      { name: 'Custom 8001', url: 'http://localhost:8001/v1/chat/completions', format: 'openai' },
    ];
  }

  // Test different API formats
  async testEndpoint(endpoint, format) {
    const testPayloads = {
      ollama: {
        model: 'mistral',
        prompt: 'Hello, respond with just "OK" if you can hear me.',
        stream: false,
        options: { max_tokens: 10 }
      },
      openai: {
        model: 'mistral',
        messages: [{ role: 'user', content: 'Hello, respond with just "OK" if you can hear me.' }],
        max_tokens: 10,
        temperature: 0.1
      },
      textgen: {
        prompt: 'Hello, respond with just "OK" if you can hear me.',
        max_new_tokens: 10,
        temperature: 0.1
      }
    };

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayloads[format]),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          endpoint: endpoint,
          response: data,
          format: format
        };
      } else {
        return {
          success: false,
          endpoint: endpoint,
          error: `HTTP ${response.status}: ${response.statusText}`,
          format: format
        };
      }
    } catch (error) {
      return {
        success: false,
        endpoint: endpoint,
        error: error.message,
        format: format
      };
    }
  }

  // Discover working endpoints
  async discoverAPIs() {
    console.log('🔍 Discovering local AI APIs...');
    const results = [];

    for (const endpoint of this.commonEndpoints) {
      console.log(`Testing ${endpoint.name} at ${endpoint.url}...`);
      const result = await this.testEndpoint(endpoint, endpoint.format);
      results.push(result);
      
      if (result.success) {
        console.log(`✅ ${endpoint.name} is working!`);
      } else {
        console.log(`❌ ${endpoint.name} failed: ${result.error}`);
      }
    }

    return results.filter(r => r.success);
  }

  // Generate config based on discovered APIs
  generateConfig(workingAPIs) {
    const config = {};
    
    workingAPIs.forEach((api, index) => {
      const modelKey = `model${index + 1}`;
      config[modelKey] = {
        name: api.endpoint.name,
        endpoint: api.endpoint.url,
        format: api.format,
        description: `Discovered ${api.endpoint.name}`,
        options: {
          temperature: 0.7,
          max_tokens: 2048,
          top_p: 0.9
        }
      };
    });

    return config;
  }
}