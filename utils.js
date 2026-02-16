// utils.js - UPDATED VERSION
// Wake words tagad tiek apstrādāti tieši recognition.js

class ResponseManager {
    constructor() {
        console.log('🎯 ResponseManager initialized');
        
        // Wake words tagad nāk no kadrils-data.json un tiek apstrādāti recognition.js
        // Šis saraksts ir tikai referenence
        this.wakeWords = ['aivar', 'ada', 'dj', 'adi'];
    }

    isWakeWord(text) {
        const result = this.wakeWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
        console.log(`🔍 isWakeWord("${text}"):`, result);
        return result;
    }

    // ✅ LABOT: Saucam speechManager priekš wake words
    findResponse(text) {
        console.log('🔍 ResponseManager.findResponse() called with:', text);
        
        // Ja ir wake word - izmantojam speechManager
        if (this.isWakeWord(text)) {
            console.log('🎙️ Wake word detected, calling speechManager');
            
            if (window.speechManager) {
                const wakeWord = text.toLowerCase().trim();
                const response = window.speechManager.getRandomWakeWordResponse(wakeWord);
                console.log('📥 Response from speechManager:', response);
                return response;
            } else {
                console.warn('⚠️ speechManager not found!');
            }
        }
        
        // Citām komandām - pārsūtām uz audioManager
        if (window.audioManager) {
            console.log('📣 Forwarding to audioManager.handleCommand()');
            const response = window.audioManager.handleCommand(text);
            console.log('📥 Response from audioManager:', response);
            return response;
        } else {
            console.warn('⚠️ window.audioManager not found!');
        }
        
        return null;
    }
}

class VideoManager {
    constructor() {
        console.log('🎬 VideoManager initialized');
        this.mainVideo = document.getElementById('mainVideo');
        
        if (!this.mainVideo) {
            console.warn('⚠️ mainVideo element not found in DOM');
        } else {
            console.log('✅ mainVideo element found');
        }
    }

    playVideo(path) {
        console.log('▶️ VideoManager.playVideo() called with path:', path);
        
        if (!this.mainVideo) {
            console.error('❌ Video element nav atrasts');
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Video elements nav atrasts');
            }
            return;
        }

        try {
            this.mainVideo.className = 'default-video video-fit-contain';
            
            this.mainVideo.src = path;
            this.mainVideo.load();
            this.mainVideo.play()
                .then(() => {
                    console.log('✅ Video atskaņošana sākta:', path);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog('Video atskaņošana sākta');
                    }
                    
                    this.mainVideo.style.display = 'block';
                    this.mainVideo.style.opacity = '1';
                    this.mainVideo.style.visibility = 'visible';
                })
                .catch(error => {
                    console.error('❌ Kļūda atskaņojot video:', error);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog(`Kļūda: ${error.message}`);
                    }
                    
                    const playVideoOnClick = () => {
                        this.mainVideo.play()
                            .then(() => {
                                console.log('✅ Video atskaņošana sākta pēc interakcijas');
                                this.mainVideo.style.display = 'block';
                            })
                            .catch(e => console.error('❌ Atkārtota kļūda ar video:', e));
                        document.removeEventListener('click', playVideoOnClick);
                    };
                    
                    document.addEventListener('click', playVideoOnClick);
                });
        } catch (error) {
            console.error('❌ Kļūda atskaņojot video:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda: ${error.message}`);
            }
        }
    }

    stopVideo() {
        console.log('⏹️ VideoManager.stopVideo() called');
        
        if (this.mainVideo) {
            try {
                this.mainVideo.pause();
                this.mainVideo.currentTime = 0;
                console.log('✅ Video apturēts');
                if (window.uiManager) {
                    window.uiManager.updateSystemLog('Video apturēts');
                }
                
                if (window.audioManager) {
                    window.audioManager.handleVideoVisibility(false);
                } else {
                    this.mainVideo.style.display = 'none';
                    const backgroundVideo = document.getElementById('backgroundVideo');
                    if (backgroundVideo) backgroundVideo.style.display = 'block';
                }
            } catch (error) {
                console.error('❌ Kļūda apturot video:', error);
                if (window.uiManager) {
                    window.uiManager.updateSystemLog(`Kļūda apturot video: ${error.message}`);
                }
            }
        }
    }
}

console.log('✅ utils.js loaded');

export const responseManager = new ResponseManager();
export const videoManager = new VideoManager();

console.log('✅ Managers exported');
