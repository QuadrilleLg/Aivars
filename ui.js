// ui.js
class UIManager {
    constructor() {
        this.setupTabSwitching();
        this.setupEventListeners();
        this.startClock();
        
        // Pievienot dejas parakstu datus ar fragmentu atbalstu
        this.danceCaptions = {
            'berliņu': {
                'pilnā': [
                    { time: 0, text: "Dejas sākums - gatavojamies" },
                    { time: 30, text: "Dārziņš - visi veido apli" },
                    { time: 63, text: "Pāru maiņa - vīrieši pagriezieties pa kreisi" },
                    { time: 95, text: "Kreisās rokas maiņa - griežamies pa labi" },
                    { time: 130, text: "Lielais dārziņš - vienotas kustības" }
                ],
                'dārziņš': [
                    { time: 0, text: "Dārziņa sākums - nostājamies aplī" },
                    { time: 15, text: "Visi virzās pa kreisi" }
                ],
                'sākums': [
                    { time: 0, text: "Berliņa sākums - puiši paceļ kreiso roku" },
                    { time: 10, text: "Meitas virza labo kāju" }
                ],
                'vidus': [
                    { time: 0, text: "Vidus daļa - pāri sastājas viens pret otru" },
                    { time: 12, text: "Visi griežas kopā" }
                ],
                'otra puse': [
                    { time: 0, text: "Otrā daļa - partnera maiņa" },
                    { time: 15, text: "Partneri sastājas aplī" }
                ],
                'beigas': [
                    { time: 0, text: "Dejas nobeigums - lielais dārziņš" },
                    { time: 10, text: "Visi sadevušies rokās virza soli pa kreisi" }
                ]
            },
            'bērzgali': {
                'pilnā': [
                    { time: 0, text: "Pirmā daļa - nostāties četrstūrī" },
                    { time: 25, text: "Otrā daļa - pāri sastājas viens aiz otra" },
                    { time: 50, text: "Trešā daļa - kustības pa apli" },
                    { time: 75, text: "Ceturtā daļa - visi sastājas aplī" },
                    { time: 100, text: "Piektā daļa - pāru maiņa" }
                ],
                'pirmais gabals': [
                    { time: 0, text: "Pirmā gabala sākums - nostāšanās" },
                    { time: 10, text: "Kreisās rokas maiņa" }
                ],
                'otrais gabals': [
                    { time: 0, text: "Otrā gabala sākums - grieziens pa labi" },
                    { time: 12, text: "Partnera maiņa" }
                ],
                'trešais gabals': [
                    { time: 0, text: "Trešā gabala sākums - visi aplī" },
                    { time: 10, text: "Meitas virzās uz iekšu" }
                ]
            },
            'flamingo': {
                'pilnā': [
                    { time: 0, text: "Sākums - gatavojamies" },
                    { time: 20, text: "Pirmā daļa - solis sānis" },
                    { time: 40, text: "Otrā daļa - pagriežamies" },
                    { time: 60, text: "Piedziedājums - visi kopā" }
                ],
                'sākums': [
                    { time: 0, text: "Flamingo sākums - nostāšanās" },
                    { time: 10, text: "Pirmie soļi" }
                ],
                'vidus': [
                    { time: 0, text: "Flamingo vidus - ritmiski soļi" },
                    { time: 15, text: "Pagrieziens ar plaukstām" }
                ],
                'beigas': [
                    { time: 0, text: "Flamingo beigas - noslēdzošie soļi" },
                    { time: 10, text: "Palēcieni vietā" }
                ]
            }
        };
        
        // Pievienot intervāla mainīgo
        this.captionInterval = null;
        
        // Pievienojam pārbaudi video elementiem
        this.ensureVideoElements();
        
        // Pievienot dejas paraksta elementu
        setTimeout(() => this.setupDanceCaptionPanel(), 500);
    }
    
    // Metode video elementu redzamības nodrošināšanai
    ensureVideoElements() {
        // Pārbaudām, vai video elementi ir redzami
        setTimeout(() => {
            // Pārbaudām video konteiner elementu
            const videoContainer = document.querySelector('.video-container');
            if (videoContainer) {
                videoContainer.style.display = 'flex';
                videoContainer.style.visibility = 'visible';
                videoContainer.style.zIndex = '1';
                console.log('Video konteiners redzams');
            }
            
            // Pārbaudām galveno video elementu
            const mainVideo = document.getElementById('mainVideo');
            if (mainVideo) {
                mainVideo.style.display = 'block';
                mainVideo.style.visibility = 'visible';
                mainVideo.style.zIndex = '50';
                console.log('Galvenais video elements redzams');
            }
            
            // Pārbaudām fona video elementu
            const backgroundVideo = document.getElementById('backgroundVideo');
            if (backgroundVideo) {
                backgroundVideo.style.display = 'block';
                backgroundVideo.style.visibility = 'visible';
                backgroundVideo.style.zIndex = '1';
                console.log('Fona video elements redzams');
                
                // Mēģinām atskaņot fona video
                if (backgroundVideo.paused) {
                    backgroundVideo.play()
                        .then(() => console.log('Fona video atskaņošana sākta'))
                        .catch(error => console.warn('Kļūda atskaņojot fona video:', error));
                }
            }
        }, 1000);
    }

    // Metode dejas paraksta paneļa izveidei
    setupDanceCaptionPanel() {
        // Pārbaudām, vai elements jau eksistē
        if (document.getElementById('danceCaptionPanel')) {
            console.log('Dejas paraksta panelis jau eksistē');
            return;
        }
        
        // Atrodam video container elementu
        const videoContainer = document.querySelector('.video-container');
        if (!videoContainer) {
            console.error('Video konteiners nav atrasts!');
            return;
        }
        
        // SVARĪGI: Pārliecināmies, ka video konteineris ir redzams
        videoContainer.style.display = 'flex';
        videoContainer.style.visibility = 'visible';
        
        // Izveidojam dejas paraksta paneli
        const captionPanel = document.createElement('div');
        captionPanel.id = 'danceCaptionPanel';
        captionPanel.className = 'dance-caption-panel';
        captionPanel.innerHTML = `
            <div id="danceCaption" class="dance-caption">Gaidu dejas izvēli...</div>
            <div id="captionTime" class="caption-time">00:00</div>
        `;
        
        // Ievietojam paneli PĒC video konteinera
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            // Pievienojam kā jaunu elementu konteinera iekšienē, NEVIS aizstājot esošos
            mainContainer.insertBefore(captionPanel, videoContainer.nextSibling);
            console.log('Dejas paraksta panelis pievienots');
        } else {
            console.error('Main container nav atrasts!');
        }
        
        // Pievienojam CSS stilus
        const style = document.createElement('style');
        style.textContent = `
            .dance-caption-panel {
                margin: 15px auto;
                width: 80%;
                padding: 15px;
                background-color: rgba(18, 26, 24, 0.8);
                border: 1px solid #e6ff00;
                text-align: center;
                border-radius: 5px;
                z-index: 10;
            }
            
            .dance-caption {
                font-size: 20px;
                color: #e6ff00;
                margin-bottom: 8px;
                font-weight: bold;
                text-shadow: 0 0 8px rgba(230, 255, 0, 0.5);
            }
            
            .caption-time {
                font-size: 16px;
                color: #ffffff;
            }
            
            /* Nodrošinām, ka video elementiem ir pareizs z-index */
            .video-container {
                z-index: 1 !important;
                display: flex !important;
                visibility: visible !important;
            }
            
            #mainVideo {
                z-index: 50 !important;
            }
            
            #backgroundVideo {
                z-index: 1 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Vēlreiz pārbaudām video elementus
        this.ensureVideoElements();
    }
    
    setupEventListeners() {
        const micButton = document.querySelector('.mic-btn');
        if (micButton) {
            micButton.addEventListener('click', () => {
                // Pārbaudām, vai visi nepieciešamie komponenti ir inicializēti
                if (window.recognitionManager) {
                    this.activateAssistant();
                } else {
                    console.error('Recognition manager nav inicializēts!');
                    this.updateSystemLog('Kļūda: balss atpazīšanas sistēma nav inicializēta');
                }
            });
        }
        
        const stopButton = document.querySelector('.input-section span:nth-child(3)');
        if (stopButton) {
            stopButton.addEventListener('click', () => {
                if (window.audioManager) {
                    window.audioManager.stopPlayback();
                    this.handleResponse("Mūzikas atskaņošana ir apturēta");
                }
            });
        }
        
        const sendButton = document.querySelector('.input-section span:last-child');
        if (sendButton) {
            sendButton.addEventListener('click', this.handleSendButton.bind(this));
        }
        
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleTextInput(e.target.value);
                    e.target.value = '';
                }
            });
        }
    }

    activateAssistant() {
        // Pārbaudām, vai window.recognitionManager eksistē
        if (!window.recognitionManager) {
            console.error('Recognition manager nav inicializēts!');
            this.updateSystemLog('Kļūda: balss atpazīšanas sistēma nav inicializēta');
            return;
        }
        
        try {
            // Toggle listening state
            window.recognitionManager.toggleListening();
            
            // If assistant is now listening, mark it as activated
            if (window.recognitionManager.getIsListening()) {
                this.updateStatusText('Aktivizēts - klausos...');
                window.recognitionManager.isWakeWordActivated = true;
                
                // Play activation sound or response
                if (window.responseManager) {
                    const wakeResponse = window.responseManager.findResponse('wake_word');
                    if (wakeResponse) {
                        this.updateChatLog(`Asistents: ${wakeResponse}`);
                        
                        // Find and play activation audio if available
                        if (window.responseManager.responses && 
                            window.responseManager.responses.wake_word && 
                            window.responseManager.responses.wake_word.pairs) {
                            const pairs = window.responseManager.responses.wake_word.pairs;
                            const randomIndex = Math.floor(Math.random() * pairs.length);
                            const selectedPair = pairs[randomIndex];
                            window.audioManager.playParallel(selectedPair.audio, selectedPair.video);
                        }
                    }
                }
            } else {
                this.updateStatusText('Gaidīšanas režīmā');
                window.recognitionManager.isWakeWordActivated = false;
            }
        } catch (error) {
            console.error('Kļūda aktivizējot asistentu:', error);
            this.updateSystemLog(`Kļūda aktivizējot asistentu: ${error.message}`);
        }
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        const chatLog = document.getElementById('chatLog');
        const systemLog = document.getElementById('systemLog');

        tabs[0].addEventListener('click', () => {
            tabs[0].classList.add('active');
            tabs[1].classList.remove('active');
            chatLog.style.display = 'block';
            systemLog.style.display = 'none';
        });

        tabs[1].addEventListener('click', () => {
            tabs[1].classList.add('active');
            tabs[0].classList.remove('active');
            systemLog.style.display = 'block';
            chatLog.style.display = 'none';
        });
    }

    handleTextInput(text) {
        if (!text.trim()) return;
        
        console.log('Teksta ievade:', text);
        this.updateChatLog(`Jūs: ${text}`);
    
        // Wake word apstrāde
        if (window.responseManager && window.responseManager.responses && 
            window.responseManager.responses.wake_word && 
            window.responseManager.responses.wake_word.pairs) {
            
            const wakeWordPairs = window.responseManager.responses.wake_word.pairs;
            for (const pair of wakeWordPairs) {
                if (text.toLowerCase().includes(pair.text.toLowerCase())) {
                    this.updateChatLog(`Asistents: ${pair.text}`);
                    window.audioManager.playParallel(pair.audio, pair.video);
                    return;
                }
            }
        }
    
        // Pārējo komandu apstrāde
        if (window.audioManager) {
            const audioResponse = window.audioManager.handleCommand(text);
            if (audioResponse) {
                this.updateChatLog(`Asistents: ${audioResponse}`);
                
                // Identificējam dejas nosaukumu un fragmentu
                this.identifyDanceAndFragment(audioResponse);
            }
        }
    }
    
    // Metode dejas un fragmenta identificēšanai no atbildes teksta
    identifyDanceAndFragment(responseText) {
        // Pārbaudām visus kadriļu atslēgvārdus
        for (const kadrilKey in this.danceCaptions) {
            if (responseText.toLowerCase().includes(kadrilKey)) {
                // Atrasts kadriļa nosaukums, tagad meklējam fragmentu
                const fragmentKeys = Object.keys(this.danceCaptions[kadrilKey]);
                
                // Vispirms meklējam konkrētu fragmentu
                let foundFragment = false;
                for (const fragmentKey of fragmentKeys) {
                    if (fragmentKey !== 'pilnā' && responseText.toLowerCase().includes(fragmentKey)) {
                        this.startDanceCaptionUpdates(kadrilKey, fragmentKey);
                        foundFragment = true;
                        break;
                    }
                }
                
                // Ja fragments nav atrasts, izmantojam pilno
                if (!foundFragment) {
                    this.startDanceCaptionUpdates(kadrilKey, 'pilnā');
                }
                
                break;
            }
        }
    }

    handleSendButton() {
        const textInput = document.getElementById('textInput');
        this.handleTextInput(textInput.value);
        textInput.value = '';
    }

    updateChatLog(message) {
        const chatLog = document.getElementById('chatLog');
        const time = new Date().toLocaleTimeString();
        chatLog.innerHTML += `\n[${time}] ${message}`;
        chatLog.scrollTop = chatLog.scrollHeight;
    }

    updateSystemLog(message) {
        const systemLog = document.getElementById('systemLog');
        const time = new Date().toLocaleTimeString();
        systemLog.innerHTML += `\n[${time}] ${message}`;
        systemLog.scrollTop = systemLog.scrollHeight;
    }

    updateStatusText(text) {
        document.getElementById('statusText').textContent = text;
    }

    startClock() {
        setInterval(this.updateClock.bind(this), 1000);
        this.updateClock();
    }

    updateClock() {
        const now = new Date();
        const seconds = now.getSeconds();
        const minutes = now.getMinutes();
        const hours = now.getHours();

        const secondDegrees = ((seconds / 60) * 360);
        const minuteDegrees = ((minutes + seconds/60) / 60) * 360;
        const hourDegrees = ((hours % 12 + minutes/60) / 12) * 360;

        document.querySelector('.second-hand').style.transform = 
            `translateX(-50%) rotate(${secondDegrees}deg)`;
        document.querySelector('.minute-hand').style.transform = 
            `translateX(-50%) rotate(${minuteDegrees}deg)`;
        document.querySelector('.hour-hand').style.transform = 
            `translateX(-50%) rotate(${hourDegrees}deg)`;
    }

    // Metode dejas paraksta atjaunināšanai - atbalsta fragmentus
    startDanceCaptionUpdates(kadrilKey, fragmentKey = 'pilnā') {
        // Notīrām iepriekšējo intervālu, ja tāds ir
        if (this.captionInterval) {
            clearInterval(this.captionInterval);
            this.captionInterval = null;
        }
        
        // Pārbaudām, vai šai dejai ir paraksti konkrētajam fragmentam
        if (!this.danceCaptions[kadrilKey] || 
            !this.danceCaptions[kadrilKey][fragmentKey]) {
            
            // Mēģinām izmantot pilnās dejas parakstus, ja fragmentam nav
            if (this.danceCaptions[kadrilKey] && this.danceCaptions[kadrilKey]['pilnā']) {
                fragmentKey = 'pilnā';
            } else {
                this.updateDanceCaption(`Nav parakstu dejai ${kadrilKey}`, "");
                return;
            }
        }
        
        // Izvēlamies pareizos parakstus fragmentam
        const captions = this.danceCaptions[kadrilKey][fragmentKey];
        
        // Izveidojam jaunu intervālu
        this.captionInterval = setInterval(() => {
            if (!window.audioManager || !window.audioManager.mainAudio) return;
            
            const audio = window.audioManager.mainAudio;
            if (audio.paused) return;
            
            const currentTime = Math.floor(audio.currentTime);
            let activeCaption = captions[0];
            
            // Atrodam pašreizējo parakstu
            for (let i = 0; i < captions.length; i++) {
                if (currentTime >= captions[i].time) {
                    activeCaption = captions[i];
                } else {
                    break;
                }
            }
            
            // Formatējam laiku
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;
            const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Atjauninām parakstu
            this.updateDanceCaption(activeCaption.text, timeStr);
            
        }, 1000);
        
        // Piefiksējam kad audio beidzas
        if (window.audioManager && window.audioManager.mainAudio) {
            window.audioManager.mainAudio.onended = () => {
                if (this.captionInterval) {
                    clearInterval(this.captionInterval);
                    this.captionInterval = null;
                    this.updateDanceCaption("Deja beigusies", "");
                }
            };
        }
    }
    
    // Metode paraksta teksta atjaunināšanai
    updateDanceCaption(text, time) {
        const captionElement = document.getElementById('danceCaption');
        const timeElement = document.getElementById('captionTime');
        
        if (captionElement) captionElement.textContent = text;
        if (timeElement) timeElement.textContent = time;
    }

    async handleResponse(response) {
        console.log('Atbilde:', response);
        this.updateChatLog(`Asistents: ${response}`);

        // Identificējam dejas nosaukumu un fragmentu
        this.identifyDanceAndFragment(response);

        if (response === "Mūzikas atskaņošana ir apturēta") {
            window.audioManager.stopPlayback();
            if (this.captionInterval) {
                clearInterval(this.captionInterval);
                this.captionInterval = null;
                this.updateDanceCaption("Atskaņošana apturēta", "");
            }
            return;
        }
        if (response === "Mūzika nopauzēta") {
            window.audioManager.pausePlayback();
            return;
        }
        if (response.includes("Sagatavojamies")) {
            return;
        }
        // Pievienojam wake_word audio pārbaudi
        if (window.responseManager.responses && 
            window.responseManager.responses.wake_word && 
            this.isWakeWordResponse(response)) {
            
            if (window.responseManager.responses.wake_word.pairs) {
                const pairs = window.responseManager.responses.wake_word.pairs;
                for (const pair of pairs) {
                    if (pair.text === response) {
                        window.audioManager.playParallel(pair.audio, pair.video);
                        return;
                    }
                }
            }
            return;
        }

        if (window.responseManager.responses) {
            const videoPath = window.responseManager.responses.video_paths?.[response];
            if (videoPath) {
                window.videoManager.playVideo(videoPath);
            }

            const audioPath = window.responseManager.responses.music_paths?.[response];
            if (audioPath) {
                window.audioManager.playAudio(audioPath);
            }
        }
    }

    isWakeWordResponse(response) {
        return window.responseManager.responses.wake_word.pairs &&
            window.responseManager.responses.wake_word.pairs.some(pair => pair.text === response);
    }
}

export const uiManager = new UIManager();
