// recognition.js - UPDATED VERSION
// Mikrofons sākas IZSLĒGTS
// Toggle ar mic button
// Wake word režīmā klausās TIKAI wake words + kontroles

class RecognitionManager {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.isWakeWordActivated = false;  // Vai wake word ir teikts
        this.currentDevice = null;
        this.devices = [];
        this.isRestartPending = false;
        
        this.commands = {
            wakeWords: ['aivar', 'ada', 'dj', 'adi'],
            dances: [
                'bērzgale','bērzgali', 'berliņš', 'berliņu','kvadrāts', 'kvadrātu', 'rikava',
                'rikavu', 'krusta kazāks',
                'ciganovskis', 'ciganovski','lancejots', 'balabaska', 'rusiņš', 'liriskā',
                'narečenka', 'narečenka remikss', 'family jig', 'džīga', 'žīga', 'rusiņu', 'padespaņs', 'spainis',
                'bada spains', 'sarkano', 'sarkanais', 'flamingo', 'uz upīti', 'uz upi'
            ],
            parts: [
                // Vispārīgās daļas
                'sākums', 'otrais sākums',
                'vidus', 'beigas',
                'solo', 'maiņa',

                // Dārziņi
                'dārziņš', 'pirmais dārziņš', 'otrais dārziņš', 'trešais dārziņš',
                'meitu dārziņš', 'puišu dārziņš', 'lielais dārziņš',
                'pirmie mazie dārziņi', 'otrie mazie dārziņi', 'mazie dārziņi',

                // Numerētās daļas
                'pirmais', 'otrais', 'trešais', 'ceturtais', 'piektais', 'sestais',
                'pirmā daļa', '3','3gabals', '3 gabals', '4', '4gabals', '5gabals', '5 gabals', 

                // Specifiskās daļas
                'vārtiņi', 'vārtiņi otrie',
                'puiši', 'puiši pirmais', 'puiši otrie',
                'vija', 'vija pirmā', 'vija otrā',
                'valsis', 'valsis otrais',
                'dzirnavas', 'puišu dzirnavas', 'meitu dzirnavas',
                'meitas', 'meitas vidū',
                'do za do','pirmais gabals','otrais gabals','trešais gabals','ceturtais gabals',
                'piektais gabals','sestais gabals',

                // Rikavas dejas daļas
                'domāšanas gabals', 'dancošanas gabals',
                'spārdīšanas gabals', 'kumeļa gabals', 'cīruļa gabals',

                // Specifiskās kustības
                'pirmais gājiens', 'otrais gājiens',
                'pa trim', 'stiķis',
                'diognāles pirmās', 'diognāles otrās',
                'piedziedājums'
            ],
            controls: ['stop', 'beidz', 'apstāties', 'pauze', 'turpini', 'atsākt']
        };

        this.setupSpeechRecognition();
        this.initializeAudioDevices();
        
        console.log('🎤 RecognitionManager initialized (mic is OFF by default)');
    }

    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        
        if (!SpeechRecognition) {
            console.error('❌ Pārlūks neatbalsta runas atpazīšanu');
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Pārlūks neatbalsta runas atpazīšanu');
            }
            return;
        }

        // Izveidojam gramatiku ar visām komandām
        const grammar = '#JSGF V1.0; grammar commands; public <command> = ' + 
            [...this.commands.wakeWords, ...this.commands.dances, 
             ...this.commands.parts, ...this.commands.controls].join(' | ') + ' ;';

        this.recognition = new SpeechRecognition();
        const speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);

        this.recognition.grammars = speechRecognitionList;
        this.recognition.lang = 'lv-LV';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
                
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            
            // ✅ INTERIM results - ātra reakcija uz kontroles komandām
            if (!result.isFinal) {
                const text = result[0].transcript.toLowerCase();
                console.log('🎧 Interim:', text);
                
                // Kontroles komandas vienmēr strādā (gan gaidīšanas, gan aktīvā režīmā)
                if (this.commands.controls.some(cmd => text.includes(cmd))) {
                    console.log('⚡ Control command detected:', text);
                    
                    if (window.uiManager) {
                        window.uiManager.updateChatLog(`Jūs: ${text}`);
                    }
                    
                    if (window.audioManager) {
                        const response = window.audioManager.handleCommand(text);
                        if (response && window.uiManager) {
                            window.uiManager.handleResponse(response);
                        }
                    }
                    
                    this.stopRecognition();
                    this.restartRecognition();
                    return;
                }
                return;
            }

            // ✅ FINAL results
            const alternatives = Array.from(result).map(r => r.transcript.toLowerCase());
            console.log('🎯 Final results:', alternatives);
            
            const bestMatch = this.findBestMatch(alternatives);
            if (!bestMatch) {
                console.log('⚠️ Nav atrasta atbilstoša komanda');
                this.stopRecognition();
                this.restartRecognition();
                return;
            }

            const text = bestMatch;
            console.log('✅ Best match:', text);

            // ========================================
            // GAIDĪŠANAS REŽĪMS (nav wake word)
            // ========================================
            if (!this.isWakeWordActivated) {
                console.log('🔍 Checking for wake word in text:', text);
                
                const isWakeWord = this.commands.wakeWords.some(word => text.includes(word));
                
                if (isWakeWord) {
                    console.log('🎉 WAKE WORD DETECTED!');
                    this.isWakeWordActivated = true;
                    
                    // ✅ UI UPDATE
                    if (window.assistantUI) {
                        window.assistantUI.setState('active');
                    }
                    
                    if (window.uiManager) {
                        window.uiManager.updateStatusText('✅ Aktivizēts - klausos komandas...');
                        window.uiManager.updateChatLog(`Jūs: ${text}`);
                    }
                    
                    // ✅ RANDOM WAKE WORD RESPONSE
                    let wakeWordKey = null;
                    for (const word of this.commands.wakeWords) {
                        if (text.includes(word)) {
                            wakeWordKey = word;
                            break;
                        }
                    }
                    
                    if (wakeWordKey && window.speechManager) {
                        const response = window.speechManager.getRandomWakeWordResponse(wakeWordKey);
                        
                        if (response) {
                            console.log('🎲 Random response:', response);
                            
                            // Atskaņo audio
                            if (response.audio && window.audioManager) {
                                window.audioManager.playFragment(response.audio);
                            }
                            
                            // Parāda text speech bubble
                            if (response.text && window.assistantUI) {
                                window.assistantUI.showMessage(response.text, 'greeting');
                            }
                            
                            if (window.uiManager) {
                                window.uiManager.updateChatLog(`Asistents: ${response.text}`);
                            }
                        }
                    }
                } else {
                    console.log('⚠️ Gaidīšanas režīmā - tikai wake words pieņemami');
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog('Sakiet aktivizācijas vārdu (piemēram, "Aivar")');
                    }
                }
                
                this.stopRecognition();
                this.restartRecognition();
                return;
            }

            // ========================================
            // AKTĪVAIS REŽĪMS (pēc wake word)
            // ========================================
            console.log('🎵 Active mode - processing command:', text);
            
            if (window.uiManager) {
                window.uiManager.updateChatLog(`Jūs: ${text}`);
            }
            
            if (window.audioManager) {
                const response = window.audioManager.handleCommand(text);
                
                if (response) {
                    console.log('📝 Response from audioManager:', response);
                    
                    // Pēc komandas apstrādes atgriežamies gaidīšanas režīmā
                    this.isWakeWordActivated = false;
                    
                    // ✅ UI UPDATE
                    if (window.assistantUI) {
                        window.assistantUI.setState('listening');
                        
                        // Formatējam ziņojumu
                        let messageType = 'info';
                        if (response.includes('Atskaņoju')) {
                            messageType = 'song';
                        } else if (response.includes('apturēt') || response.includes('nopauzēt') || response.includes('turpin')) {
                            messageType = 'control';
                        }
                        
                        window.assistantUI.showMessage(response, messageType);
                        window.assistantUI.pulse();
                    }
                    
                    if (window.uiManager) {
                        window.uiManager.updateStatusText('⏸️ Gaidu aktivizāciju...');
                        window.uiManager.handleResponse(response);
                    }
                } else {
                    console.log('⚠️ Nav atbildes no audioManager');
                }
            }
            
            this.stopRecognition();
            this.restartRecognition();
        };

        this.recognition.onerror = (event) => {
            console.error('❌ Runas atpazīšanas kļūda:', event.error);
            
            if (event.error === 'not-allowed') {
                console.error('🚫 Mikrofona piekļuve liegta!');
                if (window.uiManager) {
                    window.uiManager.updateSystemLog('⚠️ Mikrofona piekļuve liegta! Atļaujiet piekļuvi pārlūka iestatījumos.');
                    window.uiManager.updateStatusText('❌ Nav mikrofona piekļuves');
                }
                this.isListening = false;
                const micBtn = document.querySelector('.mic-btn');
                if (micBtn) micBtn.classList.remove('active');
                return;
            }
            
            if (event.error === 'no-speech') {
                console.log('🤫 Nav dzirdēts runātājs');
            }
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda: ${event.error}`);
            }
            
            // Restartējam pēc kļūdas
            this.stopRecognition();
            if (this.isListening) {
                this.restartRecognition();
            }
        };

        this.recognition.onend = () => {
            console.log('🔚 Recognition ended');
            // Ja klausīšanās beidzas, bet vēl joprojām ir aktīva, restartējam
            if (this.isListening && !this.isRestartPending) {
                this.restartRecognition();
            }
        };
        
        console.log('✅ Speech recognition setup complete');
    }

    stopRecognition() {
        if (this.recognition) {
            try {
                this.recognition.abort();
            } catch (error) {
                console.error('Kļūda apturot atpazīšanu:', error);
            }
        }
    }

    restartRecognition() {
        if (this.isRestartPending) {
            return;
        }
        
        if (this.isListening) {
            this.isRestartPending = true;
            
            setTimeout(() => {
                this.isRestartPending = false;
                
                try {
                    if (!this.recognition) {
                        this.setupSpeechRecognition();
                    }
                    
                    if (this.isListening && this.recognition) {
                        try {
                            this.recognition.start();
                            console.log('🔄 Recognition restarted');
                        } catch (startError) {
                            if (startError.message.includes('already started')) {
                                console.log('⚠️ Recognition jau darbojas');
                            } else {
                                console.error('Kļūda restartējot:', startError);
                                
                                // Mēģinām vēlreiz pēc 200ms
                                setTimeout(() => {
                                    if (this.isListening) {
                                        try {
                                            this.setupSpeechRecognition();
                                            this.recognition.start();
                                        } catch (secondError) {
                                            console.error('Neizdevās restartēt:', secondError);
                                            if (window.uiManager) {
                                                window.uiManager.updateSystemLog(`Neizdevās restartēt atpazīšanu: ${secondError.message}`);
                                            }
                                        }
                                    }
                                }, 200);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Kļūda restartējot atpazīšanu:', error);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog(`Kļūda restartējot atpazīšanu: ${error.message}`);
                    }
                }
            }, 300);
        }
    }

    findBestMatch(alternatives) {
        // Ja gaidīšanas režīmā, meklējam TIKAI wake words + kontroles
        if (!this.isWakeWordActivated) {
            const allowedCommands = [
                ...this.commands.wakeWords,
                ...this.commands.controls
            ];
            
            for (const alternative of alternatives) {
                for (const command of allowedCommands) {
                    if (alternative.includes(command)) {
                        return alternative;
                    }
                }
            }
            return null;
        }
        
        // Ja aktīvais režīms, meklējam VISAS komandas
        const allCommands = [
            ...this.commands.wakeWords,
            ...this.commands.dances,
            ...this.commands.parts,
            ...this.commands.controls
        ];

        for (const alternative of alternatives) {
            for (const command of allCommands) {
                if (alternative.includes(command)) {
                    return alternative;
                }
            }
        }

        return null;
    }

    async initializeAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'audioinput');
            
            console.log('🎙️ Pieejamās audio ierīces:', this.devices.length);
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Atrastās audio ierīces: ' + this.devices.length);
            }

            this.createDeviceSelector();

            navigator.mediaDevices.addEventListener('devicechange', async () => {
                const devices = await navigator.mediaDevices.enumerateDevices();
                this.devices = devices.filter(device => device.kind === 'audioinput');
                this.createDeviceSelector();
                if (window.uiManager) {
                    window.uiManager.updateSystemLog('Audio ierīču saraksts atjaunināts');
                }
            });

        } catch (error) {
            console.error('❌ Kļūda iegūstot audio ierīces:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Kļūda iegūstot audio ierīces: ' + error.message);
            }
        }
    }

    createDeviceSelector() {
        let select = document.getElementById('audioDeviceSelect');
        if (!select) {
            select = document.createElement('select');
            select.id = 'audioDeviceSelect';
            select.className = 'audio-device-select';
            const inputSection = document.querySelector('.input-section');
            if (inputSection) {
                inputSection.insertBefore(select, inputSection.firstChild);
            }
        }

        select.innerHTML = '';

        this.devices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Mikrofons ${device.deviceId.slice(0, 5)}`;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.switchAudioDevice(e.target.value);
        });
    }

    async switchAudioDevice(deviceId) {
        try {
            if (this.isListening) {
                this.stopListening();
            }

            await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: {exact: deviceId}
                }
            });

            this.currentDevice = deviceId;
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Audio ierīce nomainīta');
            }

            if (this.isListening) {
                await this.startListening();
            }

        } catch (error) {
            console.error('❌ Kļūda mainot audio ierīci:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Kļūda mainot audio ierīci: ' + error.message);
            }
        }
    }

    async startListening() {
        console.log('🎤 startListening() called');
        
        try {
            // Prasām mikrofona atļaujas
            if (this.currentDevice) {
                await navigator.mediaDevices.getUserMedia({
                    audio: {
                        deviceId: {exact: this.currentDevice}
                    }
                });
            } else {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            if (!this.recognition) {
                this.setupSpeechRecognition();
            }
            
            // Apturamšu veco, ja darbojas
            this.stopRecognition();
            
            this.isListening = true;
            this.isWakeWordActivated = false;  // ⬅️ SVARĪGI! Sākam gaidīšanas režīmā
            
            // ✅ UI UPDATE
            if (window.assistantUI) {
                window.assistantUI.setState('listening');
            }
            
            const micBtn = document.querySelector('.mic-btn');
            if (micBtn) {
                micBtn.classList.add('active');
            }
            
            if (window.uiManager) {
                window.uiManager.updateStatusText('🎧 Klausos wake word...');
                window.uiManager.updateSystemLog('🎤 Mikrofons aktivizēts - sakiet "Aivar"');
            }
            
            try {
                this.recognition.start();
                console.log('✅ Runas atpazīšana sākta');
            } catch (error) {
                console.error('❌ Kļūda sākot atpazīšanu:', error);
                
                if (error.message.includes('already started')) {
                    console.log('⚠️ Recognition jau darbojas');
                } else {
                    // Mēģinām atkārtoti
                    this.setupSpeechRecognition();
                    
                    try {
                        this.recognition.start();
                    } catch (secondError) {
                        console.error('❌ Atkārtota kļūda:', secondError);
                        if (window.uiManager) {
                            window.uiManager.updateSystemLog(`Neizdevās sākt atpazīšanu: ${secondError.message}`);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('❌ Mikrofonam nav piekļuves:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`⚠️ Mikrofonam nav piekļuves! Atļaujiet pārlūkā.`);
                window.uiManager.updateStatusText('❌ Nav mikrofona piekļuves');
            }
            
            this.isListening = false;
            const micBtn = document.querySelector('.mic-btn');
            if (micBtn) micBtn.classList.remove('active');
            
            // ✅ UI UPDATE
            if (window.assistantUI) {
                window.assistantUI.setState('off');
            }
        }
    }

    stopListening() {
        console.log('🛑 stopListening() called');
        
        if (!this.recognition) return;
        
        this.isListening = false;
        this.isWakeWordActivated = false;  // Reset wake word stāvoklis
        
        // ✅ UI UPDATE
        if (window.assistantUI) {
            window.assistantUI.setState('off');
            window.assistantUI.hideMessage();
        }
        
        const micBtn = document.querySelector('.mic-btn');
        if (micBtn) {
            micBtn.classList.remove('active');
        }
        
        if (window.uiManager) {
            window.uiManager.updateStatusText('⏸️ Mikrofons izslēgts');
            window.uiManager.updateSystemLog('🛑 Mikrofons deaktivizēts');
        }
        
        this.stopRecognition();
    }

    // ✅ TOGGLE funkcija - izsauc no UI
    toggleListening() {
        console.log('🔄 toggleListening() - current state:', this.isListening);
        
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    getIsListening() {
        return this.isListening;
    }
    
    getIsWakeWordActivated() {
        return this.isWakeWordActivated;
    }
}

export const recognitionManager = new RecognitionManager();

console.log('✅ recognition.js loaded - mikrofons sākas IZSLĒGTS');