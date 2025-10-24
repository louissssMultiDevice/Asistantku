// Doetoez API Service
class DoetoezAPI {
    constructor() {
        this.baseURL = 'https://asistantku.privhandi.my.id/api';
        this.apiKey = localStorage.getItem('doetoez_api_key');
        this.init();
    }

    init() {
        // Check for existing API key
        if (!this.apiKey) {
            this.apiKey = this.generateAPIKey();
            localStorage.setItem('doetoez_api_key', this.apiKey);
        }
    }

    generateAPIKey() {
        return 'doetoez_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now().toString(36);
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Doetoez-Version': '1.0.0'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Chat Completion API
    async chatCompletion(messages, options = {}) {
        const payload = {
            model: options.model || 'doetoez-gpt-4',
            messages,
            stream: options.stream || false,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000,
            memory: options.memory !== false // Default true
        };

        return this.request('/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Image Generation API
    async generateImage(prompt, options = {}) {
        const payload = {
            prompt,
            model: options.model || 'doetoez-dalle-3',
            size: options.size || '1024x1024',
            quality: options.quality || 'standard',
            style: options.style || 'vivid'
        };

        return this.request('/v1/images/generations', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Text-to-Speech API
    async textToSpeech(text, options = {}) {
        const payload = {
            text,
            voice: options.voice || 'id-ID-Ardi-Neural',
            speed: options.speed || 1.0,
            pitch: options.pitch || 1.0
        };

        return this.request('/v1/tts/generate', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Memory Management API
    async saveMemory(key, data) {
        const payload = {
            key,
            data,
            expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        };

        return this.request('/v1/memory/save', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    async getMemory(key) {
        return this.request(`/v1/memory/get?key=${encodeURIComponent(key)}`);
    }

    async deleteMemory(key) {
        return this.request('/v1/memory/delete', {
            method: 'DELETE',
            body: JSON.stringify({ key })
        });
    }

    // ChatGPT Proxy API
    async chatGPT(messages, options = {}) {
        const payload = {
            model: options.model || 'gpt-4',
            messages,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000
        };

        return this.request('/v1/proxy/chatgpt', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Gemini Proxy API
    async gemini(prompt, options = {}) {
        const payload = {
            model: options.model || 'gemini-pro',
            prompt,
            temperature: options.temperature || 0.7,
            max_tokens: options.max_tokens || 1000
        };

        return this.request('/v1/proxy/gemini', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // User Management API
    async getUserProfile() {
        return this.request('/v1/user/profile');
    }

    async updateUserProfile(profileData) {
        return this.request('/v1/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getUsageStats() {
        return this.request('/v1/user/usage');
    }

    // Conversation Management API
    async getConversations(limit = 50, offset = 0) {
        return this.request(`/v1/conversations?limit=${limit}&offset=${offset}`);
    }

    async getConversation(id) {
        return this.request(`/v1/conversations/${id}`);
    }

    async deleteConversation(id) {
        return this.request(`/v1/conversations/${id}`, {
            method: 'DELETE'
        });
    }

    // File Upload API
    async uploadFile(file, purpose = 'assistant') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('purpose', purpose);

        return this.request('/v1/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: formData
        });
    }

    // Utility methods for offline simulation
    simulateAPIResponse(data, delay = 1000) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data,
                    timestamp: new Date().toISOString()
                });
            }, delay);
        });
    }

    // Mock implementations for development
    async mockChatCompletion(messages) {
        const response = {
            id: 'chat_' + Date.now(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: 'doetoez-gpt-4',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: this.generateMockResponse(messages)
                    },
                    finish_reason: 'stop'
                }
            ],
            usage: {
                prompt_tokens: 50,
                completion_tokens: 100,
                total_tokens: 150
            }
        };

        return this.simulateAPIResponse(response);
    }

    generateMockResponse(messages) {
        const lastMessage = messages[messages.length - 1];
        const content = lastMessage.content.toLowerCase();

        if (content.includes('hallo') || content.includes('hai')) {
            return "Halo! Saya Doetoez, asisten AI Anda. Senang bertemu dengan Anda! Ada yang bisa saya bantu hari ini?";
        } else if (content.includes('ngoding') || content.includes('code')) {
            return "Saya bisa membantu Anda dengan pemrograman! Bahasa apa yang Anda gunakan? JavaScript, Python, Java, atau yang lain?";
        } else if (content.includes('gambar') || content.includes('image')) {
            return "Saya bisa membuat gambar untuk Anda! Coba jelaskan gambar seperti apa yang Anda inginkan.";
        } else if (content.includes('curhat') || content.includes('masalah')) {
            return "Saya di sini untuk mendengarkan. Ceritakan apa yang sedang Anda alami...";
        } else {
            const responses = [
                "Menarik sekali! Bisa Anda jelaskan lebih detail?",
                "Terima kasih sudah berbagi. Berdasarkan pemahaman saya...",
                "Pertanyaan yang bagus! Mari kita eksplorasi ini bersama-sama.",
                "Saya mengerti apa yang Anda tanyakan. Berikut pandangan saya...",
                "Wow, topik yang menarik! Saya punya beberapa ide yang mungkin berguna."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    async mockGenerateImage(prompt) {
        const response = {
            id: 'img_' + Date.now(),
            object: 'image',
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
                    revised_prompt: prompt + " (generated image)"
                }
            ]
        };

        return this.simulateAPIResponse(response, 2000);
    }
}

// Initialize API service
window.doetoezAPI = new DoetoezAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DoetoezAPI;
}