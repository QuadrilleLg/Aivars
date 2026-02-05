// assistant-speech.js - Random atbilžu un ziņojumu formatēšana

class SpeechManager {
    constructor() {
        console.log('🗣️ SpeechManager constructor started');
    }

    // ========================================
    // WAKE WORD RANDOM RESPONSE
    // ========================================

    getRandomWakeWordResponse(wakeWord) {
        console.log(`🎲 getRandomWakeWordResponse: ${wakeWord}`);
        
        if (!window.audioManager || !window.audioManager.wakeWords) {
            console.error('❌ audioManager.wakeWords not found!');
            return null;
        }
        
        const wakeWordData = window.audioManager.wakeWords[wakeWord];
        
        if (!wakeWordData) {
            console.warn(`⚠️ Wake word "${wakeWord}" not found in data`);
            return null;
        }
        
        // Ja ir pairs array (jauna struktūra)
        if (wakeWordData.pairs && Array.isArray(wakeWordData.pairs)) {
            const randomIndex = Math.floor(Math.random() * wakeWordData.pairs.length);
            const selectedPair = wakeWordData.pairs[randomIndex];
            
            console.log(`✅ Selected pair #${randomIndex}:`, selectedPair);
            return selectedPair; // { audio: "...", text: "..." }
        }
        
        // Ja ir vecā struktūra (tikai audio path string)
        if (typeof wakeWordData === 'string') {
            console.log('⚠️ Old structure detected (audio path only)');
            return {
                audio: wakeWordData,
                text: this._getDefaultWakeWordText(wakeWord)
            };
        }
        
        // Ja ir objekts ar audio bet bez pairs
        if (wakeWordData.audio) {
            return {
                audio: wakeWordData.audio,
                text: wakeWordData.text || this._getDefaultWakeWordText(wakeWord)
            };
        }
        
        console.error('❌ Invalid wake word data structure');
        return null;
    }

    _getDefaultWakeWordText(wakeWord) {
        const defaults = {
            'aivar': 'Klausos!',
            'ada': 'Esmu šeit!',
            'dj': 'DJ gatavs!',
            'adi': 'Klausos uzmanīgi!'
        };
        
        return defaults[wakeWord] || 'Klausos!';
    }

    // ========================================
    // MESSAGE FORMATTING
    // ========================================

    formatSongMessage(songName, fragmentName = null) {
        console.log(`🎵 formatSongMessage: ${songName}, fragment: ${fragmentName}`);
        
        let message = `🎵 Atskaņoju: ${songName}`;
        
        if (fragmentName && fragmentName !== 'pilnā') {
            // Formatējam fragmenta nosaukumu
            const formattedFragment = this._formatFragmentName(fragmentName);
            message += `\n📍 Fragments: ${formattedFragment}`;
        }
        
        return message;
    }

    _formatFragmentName(fragmentName) {
        // Pārveidojam "pirmais_gabals" → "Pirmais gabals"
        return fragmentName
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    formatControlMessage(action) {
        console.log(`⏯️ formatControlMessage: ${action}`);
        
        const messages = {
            'stop': '⏹️ Mūzika apturēta',
            'pause': '⏸️ Mūzika nopauzēta',
            'resume': '▶️ Turpinu atskaņošanu'
        };
        
        return messages[action] || `✅ ${action}`;
    }

    formatVideoMessage(videoTitle) {
        console.log(`🎬 formatVideoMessage: ${videoTitle}`);
        return `🎬 Rādu video: ${videoTitle}`;
    }

    formatErrorMessage(error) {
        console.log(`❌ formatErrorMessage: ${error}`);
        return `⚠️ ${error}`;
    }

    formatWaitingMessage() {
        return '🎧 Klausos wake word...';
    }

    formatActiveMessage() {
        return '✅ Aktivizēts! Komandējiet dziesmu.';
    }

    // ========================================
    // TYPING ANIMATION HELPER
    // ========================================

    // Ja vēlies typing efektu (nav obligāti)
    async typeMessage(text, elementId, speed = 30) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text.charAt(i);
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }

    // ========================================
    // RANDOM VARIATIONS (BONUS)
    // ========================================

    getRandomListeningMessage() {
        const messages = [
            '🎧 Klausos wake word...',
            '👂 Gaidu aktivizāciju...',
            '🎤 Mikrofons aktīvs...'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }

    getRandomActiveMessage() {
        const messages = [
            '✅ Aktivizēts! Ko vēlaties?',
            '✅ Klausos komandas!',
            '✅ Esmu uzmanībā!'
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// Eksportējam
export const speechManager = new SpeechManager();

// Globāli pieejams (debugging)
window.speechManager = speechManager;

console.log('✅ assistant-speech.js loaded');
