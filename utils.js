// utils.js
class ResponseManager {
    constructor() {
        this.wakeWords = ['aivar', 'ada', 'dj', 'adi'];
        this.greetings = [
            'Esmu šeit!',
            'Klausos!',
            'Jā?',
            'Ko varu palīdzēt?',
            'Esmu gatavs!',
            'Klausos!'
        ];
    }

    isWakeWord(text) {
        return this.wakeWords.some(word => 
            text.toLowerCase().includes(word.toLowerCase())
        );
    }

    getRandomGreeting() {
        return this.greetings[Math.floor(Math.random() * this.greetings.length)];
    }

    findResponse(text) {
        console.log('Meklēju atbildi uz: ' + text);
        
        // Ja tas ir wake word
        if (text === 'wake_word') {
            // Izmantojam jaunos response pārus
            if (this.responses && this.responses.wake_word && this.responses.wake_word.pairs) {
                const pairs = this.responses.wake_word.pairs;
                const randomIndex = Math.floor(Math.random() * pairs.length);
                const selectedPair = pairs[randomIndex];
                
                // Noņemts audio atskaņošanas izsaukums, lai novērstu dubultu atskaņošanu
                // Audio tiks atskaņots no ui.js
                
                return selectedPair.text;
            }
            return this.getRandomGreeting();
        }

        // Meklējam atbilstošo komandu audio menedžerī
        if (window.audioManager) {
            return window.audioManager.handleCommand(text);
        }
        
        return null;
    }
}

class VideoManager {
    constructor() {
        this.mainVideo = document.getElementById('mainVideo');
    }

    playVideo(path) {
        if (!this.mainVideo) {
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Video elements nav atrasts');
            }
            return;
        }

        try {
            // SVARĪGI: Vienmēr lietojam vienu un to pašu klasi, lai saglabātu proporcijas
            this.mainVideo.className = 'default-video video-fit-contain';
            
            this.mainVideo.src = path;
            this.mainVideo.load();
            this.mainVideo.play()
                .then(() => {
                    console.log('Video atskaņošana sākta', path);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog('Video atskaņošana sākta');
                    }
                    
                    // Pārliecināmies, ka video ir redzams
                    this.mainVideo.style.display = 'block';
                    this.mainVideo.style.opacity = '1';
                    this.mainVideo.style.visibility = 'visible';
                })
                .catch(error => {
                    console.error('Kļūda atskaņojot video:', error);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog(`Kļūda: ${error.message}`);
                    }
                    
                    // Mēģinām atskaņot pēc lietotāja interakcijas
                    const playVideoOnClick = () => {
                        this.mainVideo.play()
                            .then(() => {
                                console.log('Video atskaņošana sākta pēc interakcijas');
                                this.mainVideo.style.display = 'block';
                            })
                            .catch(e => console.error('Atkārtota kļūda ar video:', e));
                        document.removeEventListener('click', playVideoOnClick);
                    };
                    
                    document.addEventListener('click', playVideoOnClick);
                });
        } catch (error) {
            console.error('Kļūda atskaņojot video:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda: ${error.message}`);
            }
        }
    }

    stopVideo() {
        if (this.mainVideo) {
            try {
                this.mainVideo.pause();
                this.mainVideo.currentTime = 0;
                console.log('Video apturēts');
                if (window.uiManager) {
                    window.uiManager.updateSystemLog('Video apturēts');
                }
                
                // Paslēpjam video un rādam fona video
                if (window.audioManager) {
                    window.audioManager.handleVideoVisibility(false);
                } else {
                    this.mainVideo.style.display = 'none';
                    const backgroundVideo = document.getElementById('backgroundVideo');
                    if (backgroundVideo) backgroundVideo.style.display = 'block';
                }
            } catch (error) {
                console.error('Kļūda apturot video:', error);
                if (window.uiManager) {
                    window.uiManager.updateSystemLog(`Kļūda apturot video: ${error.message}`);
                }
            }
        }
    }
}

export const responseManager = new ResponseManager();
export const videoManager = new VideoManager();