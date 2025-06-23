// Configuration for local AI models
export const MODEL_CONFIG = {
  mistral7b: {
    name: 'Mistral 7B',
    endpoint: 'http://localhost:11434/api/generate',
    description: 'General purpose coding assistant',
    options: {
      temperature: 0.7,
      num_predict: 2048,
      top_p: 0.9
    }
  },
  starcoder2: {
    name: 'StarCoder2',
    endpoint: 'http://localhost:11434/api/generate',
    description: 'Code generation specialist',
    options: {
      temperature: 0.3,
      num_predict: 4096,
      top_p: 0.95
    }
  },
  codellama: {
    name: 'CodeLlama',
    endpoint: 'http://localhost:11434/api/generate',
    description: 'Advanced programming assistant',
    options: {
      temperature: 0.5,
      num_predict: 4096,
      top_p: 0.9
    }
  }
};

// Alternative API formats for different model servers
export const API_FORMATS = {
  // Ollama format
  ollama: {
    requestFormat: (model, prompt, options) => ({
      model: model,
      prompt: prompt,
      stream: false,
      options: options
    }),
    responseParser: (data) => data.response
  },
  
  // OpenAI-compatible format
  openai: {
    requestFormat: (model, prompt, options) => ({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options.temperature,
      max_tokens: options.max_tokens,
      top_p: options.top_p
    }),
    responseParser: (data) => data.choices[0].message.content
  },
  
  // Text generation format
  textgen: {
    requestFormat: (model, prompt, options) => ({
      prompt: prompt,
      max_new_tokens: options.max_tokens,
      temperature: options.temperature,
      top_p: options.top_p,
      do_sample: true
    }),
    responseParser: (data) => data.results[0].text
  }
};