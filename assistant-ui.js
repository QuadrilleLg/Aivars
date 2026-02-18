// assistant-ui.js - Asistenta vizuālais interfeiss
// Floating button + speech bubble

class AssistantUI {
    constructor() {
        console.log('🎨 AssistantUI constructor started');
        
        this.container = null;
        this.avatar = null;
        this.speechBubble = null;
        this.micIcon = null;
        this.statusIndicator = null;
        
        this.currentState = 'off'; // 'off', 'listening', 'active'
        this.currentMessage = null;
        this.hideTimer = null; // ⬅️ JAUNS! Auto-hide timer
        
        this.init();
    }

    init() {
        // Pārbauda vai voice asistents ir atļauts šajā pārlūkā
        // kadriluBrowser tiek uzstādīts ui-enhancements.js (kas ielādējas pirmais)
        const browser = window.kadriluBrowser;
        if (browser && browser.blockVoice) {
            console.log('ℹ️ AssistantUI: voice nav atļauts šajā pārlūkā — avatar netiek veidots');
            return;
        }

        // Izveidojam galveno konteineri
        this.createContainer();
        this.createAvatar();
        this.createSpeechBubble();
        this.attachEventListeners();
        
        console.log('✅ AssistantUI initialized');
    }

    createContainer() {
        // Galvenais floating konteiners apakšā pa labi
        this.container = document.createElement('div');
        this.container.id = 'assistantContainer';
        this.container.className = 'assistant-container';
        
        document.body.appendChild(this.container);
        console.log('✅ Assistant container created');
    }

    createAvatar() {
        // Avatar button (aplītis)
        this.avatar = document.createElement('div');
        this.avatar.id = 'assistantAvatar';
        this.avatar.className = 'assistant-avatar';
        
        // Status indicator (krāsainais aplis)
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = 'status-indicator';
        
        // Mikrofona ikona
        this.micIcon = document.createElement('div');
        this.micIcon.className = 'mic-icon';
        this.micIcon.innerHTML = '🎤';
        
        // Profila bilde - AR IMG TAG
        const avatarImgContainer = document.createElement('div');
        avatarImgContainer.className = 'avatar-image';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = 'avatar.png'; // ⬅️ AVATAR BILDE
        avatarImg.alt = 'Assistant';
        avatarImg.style.width = '100%';
        avatarImg.style.height = '100%';
        avatarImg.style.objectFit = 'cover';
        avatarImg.style.borderRadius = '50%';
        
        avatarImgContainer.appendChild(avatarImg);
        
        this.avatar.appendChild(avatarImgContainer);
        this.avatar.appendChild(this.micIcon);
        this.avatar.appendChild(this.statusIndicator);
        
        this.container.appendChild(this.avatar);
        console.log('✅ Avatar created');
    }

    createSpeechBubble() {
        // Speech bubble (logs)
        this.speechBubble = document.createElement('div');
        this.speechBubble.id = 'assistantSpeechBubble';
        this.speechBubble.className = 'speech-bubble hidden';
        
        // Bubble saturs
        const bubbleContent = document.createElement('div');
        bubbleContent.className = 'bubble-content';
        
        // Avatar mini ikona - AR BILDI
        const miniAvatar = document.createElement('div');
        miniAvatar.className = 'bubble-avatar';
        
        const avatarImg = document.createElement('img');
        avatarImg.src = 'avatar.png'; // ⬅️ Assistant avatar
        avatarImg.alt = 'Assistant';
        miniAvatar.appendChild(avatarImg);
        
        // Ziņojuma teksts
        const messageText = document.createElement('div');
        messageText.className = 'bubble-message';
        messageText.id = 'bubbleMessage';
        
        bubbleContent.appendChild(miniAvatar);
        bubbleContent.appendChild(messageText);
        this.speechBubble.appendChild(bubbleContent);
        
        // Pievienojam konteineram (PIRMS avatāra, lai būtu virs)
        this.container.insertBefore(this.speechBubble, this.avatar);
        console.log('✅ Speech bubble created');
    }

    attachEventListeners() {
        // Klikšķis uz avatāra = toggle mikrofonu
        this.avatar.addEventListener('click', () => {
            console.log('🖱️ Avatar clicked');
            if (window.recognitionManager) {
                window.recognitionManager.toggleListening();
            } else {
                console.error('❌ recognitionManager not found!');
            }
        });
    }

    // ========================================
    // STATE MANAGEMENT
    // ========================================

    setState(state) {
        console.log(`🎨 setState: ${this.currentState} → ${state}`);
        this.currentState = state;
        
        // Noņemam visas vecās klases
        this.avatar.classList.remove('state-off', 'state-listening', 'state-active');
        this.statusIndicator.classList.remove('pulse');
        
        switch(state) {
            case 'off':
                this.avatar.classList.add('state-off');
                this.micIcon.innerHTML = '🎤';
                break;
                
            case 'listening':
                this.avatar.classList.add('state-listening');
                this.statusIndicator.classList.add('pulse');
                this.micIcon.innerHTML = '🎙️';
                break;
                
            case 'active':
                this.avatar.classList.add('state-active');
                this.statusIndicator.classList.add('pulse');
                this.micIcon.innerHTML = '🎵';
                break;
        }
    }

    // ========================================
    // SPEECH BUBBLE MANAGEMENT
    // ========================================

    showMessage(text, type = 'info') {
        console.log(`💬 showMessage: "${text}" (type: ${type})`);
        
        // Ja ir vecais ziņojums, paslēpjam to
        if (!this.speechBubble.classList.contains('hidden')) {
            this.hideMessage();
            // Mazs delay pirms jaunā ziņojuma
            setTimeout(() => {
                this._displayMessage(text, type);
            }, 300);
        } else {
            this._displayMessage(text, type);
        }
        
        this.currentMessage = { text, type };
    }

    _displayMessage(text, type) {
        const messageEl = document.getElementById('bubbleMessage');
        if (!messageEl) return;
        
        // Atceļam iepriekšējo timer
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        // Iestatām ziņojumu
        messageEl.textContent = text;
        
        // Pievienojam type klasi
        this.speechBubble.classList.remove('type-greeting', 'type-song', 'type-control', 'type-info');
        this.speechBubble.classList.add(`type-${type}`);
        
        // Parādām ar animāciju
        this.speechBubble.classList.remove('hidden');
        
        // Typing animācija (optional)
        this.speechBubble.classList.add('typing');
        setTimeout(() => {
            this.speechBubble.classList.remove('typing');
        }, 300);
        
        // ✅ AUTO-HIDE pēc 5 sekundēm
        this.hideTimer = setTimeout(() => {
            this.hideMessage();
        }, 5000); // ⬅️ 5 sekundes
    }

    hideMessage() {
        console.log('💬 hideMessage called');
        
        // Atceļam timer, ja ir aktīvs
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        
        if (!this.speechBubble.classList.contains('hidden')) {
            // Fade out animācija
            this.speechBubble.classList.add('fade-out');
            
            setTimeout(() => {
                this.speechBubble.classList.add('hidden');
                this.speechBubble.classList.remove('fade-out');
                this.currentMessage = null;
            }, 300);
        }
    }

    // ========================================
    // HELPER METHODS
    // ========================================

    pulse() {
        // Īss pulse efekts (piemēram, pēc komandas)
        this.avatar.classList.add('pulse-once');
        setTimeout(() => {
            this.avatar.classList.remove('pulse-once');
        }, 600);
    }

    getCurrentMessage() {
        return this.currentMessage;
    }

    isMessageVisible() {
        return !this.speechBubble.classList.contains('hidden');
    }

    // ========================================
    // AVATAR IMAGE UPDATE
    // ========================================

    setAvatarImage(imagePath) {
        const avatarImg = this.avatar.querySelector('.avatar-image');
        if (avatarImg) {
            avatarImg.style.backgroundImage = `url(${imagePath})`;
            avatarImg.innerHTML = ''; // Noņemam emoji
            console.log(`✅ Avatar image set: ${imagePath}`);
        }
    }

    // ========================================
    // USER COMMAND BUBBLE
    // ========================================

    showUserCommand(text) {
        console.log(`👤 showUserCommand: "${text}"`);
        
        // Izveidojam user bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'user-bubble';
        
        // User bubble saturs
        const userContent = document.createElement('div');
        userContent.className = 'user-bubble-content';
        
        // User avatar - AR BILDI
        const userAvatar = document.createElement('div');
        userAvatar.className = 'user-bubble-avatar';
        
        const userImg = document.createElement('img');
        userImg.src = 'user.png'; // ⬅️ User avatar
        userImg.alt = 'User';
        userAvatar.appendChild(userImg);
        
        // User komandas teksts
        const userMessage = document.createElement('div');
        userMessage.className = 'user-bubble-message';
        userMessage.textContent = text;
        
        userContent.appendChild(userAvatar);
        userContent.appendChild(userMessage);
        userBubble.appendChild(userContent);
        
        // Pievienojam konteineram
        this.container.insertBefore(userBubble, this.speechBubble);
        
        // Parādām ar animāciju
        setTimeout(() => {
            userBubble.classList.remove('hidden');
        }, 50);
        
        // Auto-hide pēc 3 sekundēm
        setTimeout(() => {
            userBubble.classList.add('fade-out');
            setTimeout(() => {
                userBubble.remove();
            }, 400);
        }, 3000);
    }
}

// Eksportējam
export const assistantUI = new AssistantUI();

// Globāli pieejams (debugging)
window.assistantUI = assistantUI;

console.log('✅ assistant-ui.js loaded');