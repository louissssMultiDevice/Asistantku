// Doetoez Chat Application
class DoetoezChat {
    constructor() {
        this.currentConversation = null;
        this.messages = [];
        this.isRecording = false;
        this.speechSynthesis = window.speechSynthesis;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadConversations();
        this.updateCurrentTime();
        
        // Initialize memory system
        this.initMemorySystem();
    }

    bindEvents() {
        // Send message
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Voice recording
        document.getElementById('voiceButton').addEventListener('click', () => this.toggleVoiceRecording());

        // New chat
        document.querySelector('.btn-new-chat').addEventListener('click', () => this.startNewChat());

        // Input actions
        document.querySelectorAll('.input-action').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleInputAction(e.target));
        });

        // Conversation items
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', () => this.loadConversation(item));
        });
    }

    async initMemorySystem() {
        // Initialize IndexedDB for memory storage
        this.db = await this.openDatabase();
        await this.createMemoryStore();
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('DoetoezMemory', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('conversations')) {
                    const store = db.createObjectStore('conversations', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('userId', 'userId', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('memories')) {
                    const store = db.createObjectStore('memories', { keyPath: 'id' });
                    store.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }

    async createMemoryStore() {
        // Create memory store if it doesn't exist
        if (!this.db.objectStoreNames.contains('memories')) {
            const transaction = this.db.transaction(['memories'], 'readwrite');
            const store = transaction.objectStore('memories');
            // Store will be created in upgrade needed
        }
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate API call to Doetoez
            const response = await this.simulateAIResponse(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response, 'assistant');
            
            // Save to memory
            await this.saveToMemory(message, response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Maaf, terjadi kesalahan. Silakan coba lagi.', 'assistant');
            console.error('Error:', error);
        }
    }

    async simulateAIResponse(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Simple response logic based on message content
        if (message.toLowerCase().includes('hallo') || message.toLowerCase().includes('hai')) {
            return "Halo! Saya Doetoez, asisten AI Anda. Senang bertemu dengan Anda! Ada yang bisa saya bantu hari ini?";
        } else if (message.toLowerCase().includes('ngoding') || message.toLowerCase().includes('code')) {
            return "Saya bisa membantu Anda dengan pemrograman! Bahasa apa yang Anda gunakan? Saya familiar dengan JavaScript, Python, Java, C++, dan banyak lagi. Ceritakan lebih detail tentang masalah coding Anda!";
        } else if (message.toLowerCase().includes('gambar') || message.toLowerCase().includes('image')) {
            return "Saya bisa membuat gambar untuk Anda! Coba jelaskan gambar seperti apa yang Anda inginkan. Misalnya: 'buatkan gambar landscape gunung dengan sunset' atau 'illustrasi astronaut di luar angkasa'.";
        } else if (message.toLowerCase().includes('curhat') || message.toLowerCase().includes('masalah')) {
            return "Saya di sini untuk mendengarkan. Ceritakan apa yang sedang Anda alami, dan saya akan berusaha memberikan perspektif yang membantu. Kadang sekadar bercerita bisa membuat perasaan menjadi lebih ringan.";
        } else {
            const responses = [
                "Menarik sekali! Bisa Anda jelaskan lebih detail? Saya ingin memahami dengan baik sebelum memberikan respons.",
                "Terima kasih sudah berbagi. Berdasarkan pemahaman saya, mungkin ini bisa membantu...",
                "Pertanyaan yang bagus! Mari kita eksplorasi ini bersama-sama.",
                "Saya mengerti apa yang Anda tanyakan. Berikut adalah pandangan saya tentang hal tersebut...",
                "Wow, topik yang menarik! Saya punya beberapa ide yang mungkin berguna untuk Anda.",
                "Sebagai AI dengan memori persisten, saya ingat percakapan kita sebelumnya. Berdasarkan konteks itu...",
                "Saya senang Anda bertanya tentang ini. Ini adalah area yang sangat menarik untuk didiskusikan."
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    addMessage(content, role) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        
        messageElement.className = `message ${role}`;
        if (role === 'assistant' && this.messages.length === 0) {
            messageElement.classList.add('welcome');
        }

        const timestamp = new Date().toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-meta">
                    <span>${timestamp}</span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to messages array
        this.messages.push({ role, content, timestamp });

        // Play sound effect
        this.playSound(role === 'user' ? 'send' : 'receive');
    }

    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingElement = document.createElement('div');
        
        typingElement.className = 'message assistant typing';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        this.typingElement = typingElement;
    }

    hideTypingIndicator() {
        if (this.typingElement) {
            this.typingElement.remove();
            this.typingElement = null;
        }
    }

    async saveToMemory(userMessage, aiResponse) {
        if (!this.db) return;

        const transaction = this.db.transaction(['conversations'], 'readwrite');
        const store = transaction.objectStore('conversations');
        
        const memory = {
            userId: this.getUserId(),
            userMessage,
            aiResponse,
            timestamp: new Date().toISOString(),
            conversationId: this.currentConversation?.id || 'default'
        };

        store.add(memory);
    }

    getUserId() {
        // In a real app, this would come from authentication
        return localStorage.getItem('doetoez_user_id') || 'guest';
    }

    playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'send') {
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        } else {
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        }

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    toggleVoiceRecording() {
        const voiceButton = document.getElementById('voiceButton');
        
        if (!this.isRecording) {
            // Start recording
            this.isRecording = true;
            voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
            voiceButton.style.color = 'var(--danger)';
            
            // Simulate voice recording
            this.simulateVoiceInput();
        } else {
            // Stop recording
            this.isRecording = false;
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            voiceButton.style.color = '';
        }
    }

    simulateVoiceInput() {
        if (this.isRecording) {
            setTimeout(() => {
                if (this.isRecording) {
                    const voiceMessages = [
                        "Halo Doetoez, bisa bantu saya membuat component React?",
                        "Bagaimana cara membuat API dengan Express.js?",
                        "Bisa jelaskan tentang machine learning?",
                        "Saya sedang stress dengan pekerjaan, bisa curhat?",
                        "Buatkan gambar landscape gunung dengan danau"
                    ];
                    
                    const randomMessage = voiceMessages[Math.floor(Math.random() * voiceMessages.length)];
                    document.getElementById('chatInput').value = randomMessage;
                    
                    // Auto stop recording
                    this.toggleVoiceRecording();
                }
            }, 2000);
        }
    }

    toggleInputAction(button) {
        button.classList.toggle('active');
        
        const mode = button.dataset.mode;
        switch (mode) {
            case 'code':
                this.toggleCodeMode(button.classList.contains('active'));
                break;
            case 'image':
                this.toggleImageMode(button.classList.contains('active'));
                break;
            case 'voice':
                this.toggleVoiceMode(button.classList.contains('active'));
                break;
            case 'memory':
                this.toggleMemoryMode(button.classList.contains('active'));
                break;
        }
    }

    toggleCodeMode(active) {
        if (active) {
            this.addMessage("Mode ngoding diaktifkan! Saya siap membantu dengan pemrograman. Bahasa apa yang Anda gunakan?", "assistant");
        }
    }

    toggleImageMode(active) {
        if (active) {
            this.addMessage("Mode pembuat gambar diaktifkan! Jelaskan gambar yang ingin Anda buat.", "assistant");
        }
    }

    toggleVoiceMode(active) {
        if (active) {
            this.addMessage("Text-to-Speech diaktifkan! Sekarang saya akan membacakan respons saya.", "assistant");
            this.speak("Text to Speech telah diaktifkan. Saya akan membacakan respons saya mulai sekarang.");
        }
    }

    toggleMemoryMode(active) {
        const status = active ? "Aktif" : "Nonaktif";
        this.addMessage(`Mode memori ${status.toLowerCase()}. ${active ? 
            "Saya akan mengingat percakapan kita!" : 
            "Percakapan tidak akan disimpan dalam memori."}`, "assistant");
    }

    speak(text) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        this.speechSynthesis.speak(utterance);
    }

    startNewChat() {
        if (this.messages.length > 1) { // More than just welcome message
            if (confirm('Mulai percakapan baru? Percakapan saat ini akan disimpan.')) {
                this.messages = [];
                document.getElementById('chatMessages').innerHTML = `
                    <div class="message assistant welcome">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <div class="message-text">
                                <h3>Percakapan Baru Dimulai! 🎉</h3>
                                <p>Apa yang ingin kita bahas kali ini?</p>
                            </div>
                            <div class="message-meta">
                                <span>Hari ini, <span id="currentTime"></span></span>
                            </div>
                        </div>
                    </div>
                `;
                this.updateCurrentTime();
            }
        }
    }

    loadConversation(conversationElement) {
        // Remove active class from all conversations
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked conversation
        conversationElement.classList.add('active');
        
        // Simulate loading conversation
        this.addMessage(`Memuat percakapan: "${conversationElement.querySelector('.conversation-title').textContent}"`, 'assistant');
    }

    loadConversations() {
        // In a real app, this would load from IndexedDB
        console.log('Loading conversations from memory...');
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const timeElements = document.querySelectorAll('#currentTime');
        timeElements.forEach(element => {
            element.textContent = timeString;
        });
    }
}

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.doetoezChat = new DoetoezChat();
});

// Add some utility functions
function formatCode(code) {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}