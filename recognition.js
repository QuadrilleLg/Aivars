// recognition.js
class RecognitionManager {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.isWakeWordActivated = false;
        this.currentDevice = null;
        this.devices = [];
        this.isRestartPending = false; // Jauns flags, lai izsekotu restartus
        this.lastActiveSong = null; // ⬅️ ATCERAS AKTĪVO DZIESMU!
        
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
    }


    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
        
        if (!SpeechRecognition) {
            console.error('Pārlūks neatbalsta runas atpazīšanu');
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
        this.recognition.continuous = false;  // Mainām uz false ātrākai reakcijai
        this.recognition.interimResults = true;  // Ieslēdzam interim rezultātus
        this.recognition.maxAlternatives = 3;
                
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            
            // Apstrādājam interim rezultātus kontroles komandām
            if (!result.isFinal) {
                const text = result[0].transcript.toLowerCase();
                console.log('Interim rezultāts:', text);
                
                // Ātrā kontroles komandu pārbaude
                if (this.commands.controls.some(cmd => text.includes(cmd))) {
                    if (window.uiManager) {
                        window.uiManager.updateChatLog(`Jūs: ${text}`);
                    }
                    
                    if (window.audioManager) {
                        const response = window.audioManager.handleCommand(text);
                        if (response && window.uiManager) {
                            window.uiManager.handleResponse(response);
                            this.stopRecognition();
                            this.restartRecognition(); // Restartējam klausīšanos
                        }
                    }
                    return;
                }
                return;
            }

            // Apstrādājam galīgos rezultātus
            const alternatives = Array.from(result).map(r => r.transcript.toLowerCase());
            console.log('Galīgie rezultāti:', alternatives);
            
            // Meklējam labāko atbilstību
            const bestMatch = this.findBestMatch(alternatives);
            if (!bestMatch) {
                console.log('Nav atrasta atbilstoša komanda');
                return;
            }

            const text = bestMatch;
            console.log('Izmantotā komanda:', text);

            // Pārbaudam wake word
            if (!this.isWakeWordActivated) {
                const isWakeWord = this.commands.wakeWords.some(word => text.includes(word));
                if (isWakeWord) {
                    this.isWakeWordActivated = true;
                    if (window.uiManager) {
                        window.uiManager.updateStatusText('Aktivizēts - klausos...');
                        window.uiManager.updateChatLog(`Jūs: ${text}`);
                    }
                    
                    if (window.responseManager) {
                        const response = window.responseManager.findResponse('wake_word');
                        if (response && window.uiManager) {
                            window.uiManager.handleResponse(response);
                        }
                    }
                }
                this.stopRecognition();
                this.restartRecognition();
                return;
            }

            // Apstrādājam pārējās komandas
            if (window.uiManager) {
                window.uiManager.updateChatLog(`Jūs: ${text}`);
            }
            
            if (window.audioManager) {
                // ✅ Pārbaudam vai ir fragmenta komanda
                const isFragmentCommand = this.commands.parts.some(part => text.includes(part));
                
                if (isFragmentCommand && this.lastActiveSong) {
                    // ✅ Ja fragments + atceras dziesmu → pievieno dziesmu
                    const fullCommand = `${this.lastActiveSong} ${text}`;
                    console.log(`🎵 Fragmenta komanda ar atmiņu: "${fullCommand}"`);
                    const response = window.audioManager.handleCommand(fullCommand);
                    
                    if (response && window.uiManager) {
                        this.isWakeWordActivated = false;
                        window.uiManager.updateStatusText('Gaidu aktivizāciju...');
                        window.uiManager.handleResponse(response);
                    }
                } else {
                    // ✅ Parasta komanda
                    const response = window.audioManager.handleCommand(text);
                    
                    // ✅ Ja bija dziesmas komanda, atceras to
                    const isDanceCommand = this.commands.dances.some(dance => text.includes(dance));
                    if (isDanceCommand) {
                        this.lastActiveSong = text;
                        console.log(`💾 Atceros dziesmu: "${this.lastActiveSong}"`);
                    }
                    
                    if (response && window.uiManager) {
                        this.isWakeWordActivated = false;
                        window.uiManager.updateStatusText('Gaidu aktivizāciju...');
                        window.uiManager.handleResponse(response);
                    }
                }
            }
            
            this.stopRecognition();
            this.restartRecognition();
        };

        this.recognition.onerror = (event) => {
            console.error('Runas atpazīšanas kļūda:', event.error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Runas atpazīšanas kļūda: ${event.error}`);
                if (event.error === 'not-allowed') {
                    window.uiManager.updateSystemLog('Pārlūkam nav piekļuves mikrofonam. Lūdzu, atļaujiet piekļuvi.');
                }
            }
            
            // Ja klausīšanās beidzas ar kļūdu, mēģinām restartēt
            this.stopRecognition();
            this.restartRecognition();
        };

        this.recognition.onend = () => {
            // Ja klausīšanās beidzas, bet vēl joprojām ir aktīva, restartējam
            if (this.isListening && !this.isRestartPending) {
                this.restartRecognition();
            }
        };
    }

    // Jauna metode klausīšanās apturēšanai
    stopRecognition() {
        if (this.recognition) {
            try {
                this.recognition.abort();
            } catch (error) {
                console.error('Kļūda apturot atpazīšanu:', error);
            }
        }
    }

    // Jauna metode klausīšanās restartēšanai
    restartRecognition() {
        // Ja jau ir ieplānots restarts, neveicam neko
        if (this.isRestartPending) {
            return;
        }
        
        if (this.isListening) {
            this.isRestartPending = true;
            
            setTimeout(() => {
                this.isRestartPending = false;
                
                try {
                    // Pārliecināmies, ka iepriekšējā sesija ir beigusies
                    if (this.recognition) {
                        try {
                            this.recognition.abort();
                        } catch (e) {
                            // Ignorējam kļūdas, kas var rasties, ja sesija jau beigusies
                        }
                        
                        // Īsa pauze pirms restartēšanas
                        setTimeout(() => {
                            try {
                                this.recognition.start();
                                console.log("Runas atpazīšana restartēta");
                                if (window.uiManager) {
                                    window.uiManager.updateSystemLog("Runas atpazīšana restartēta");
                                }
                            } catch (error) {
                                console.error('Kļūda sākot atpazīšanu:', error);
                                if (window.uiManager) {
                                    window.uiManager.updateSystemLog(`Kļūda sākot atpazīšanu: ${error.message}`);
                                }
                                
                                // Mēģinām atkārtoti izveidot atpazīšanas objektu
                                this.setupSpeechRecognition();
                                
                                // Mēģinām atkārtoti sākt
                                try {
                                    this.recognition.start();
                                } catch (secondError) {
                                    console.error('Atkārtota kļūda sākot atpazīšanu:', secondError);
                                    if (window.uiManager) {
                                        window.uiManager.updateSystemLog(`Neizdevās restartēt atpazīšanu: ${secondError.message}`);
                                    }
                                }
                            }
                        }, 200);
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
        // Visas iespējamās komandas
        const allCommands = [
            ...this.commands.wakeWords,
            ...this.commands.dances,
            ...this.commands.parts,
            ...this.commands.controls
        ];

        // Meklējam precīzu atbilstību
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
            
            console.log('Pieejamās audio ierīces:', this.devices);
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Atrastās audio ierīces: ' + 
                    this.devices.map(d => d.label || 'Ierīce ' + d.deviceId).join(', '));
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
            console.error('Kļūda iegūstot audio ierīces:', error);
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
            console.error('Kļūda mainot audio ierīci:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Kļūda mainot audio ierīci: ' + error.message);
            }
        }
    }

    async startListening() {
        try {
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
            
            // Ja atpazīšana jau ir aktīva, vispirms to apturamb
            this.stopRecognition();
            
            this.isListening = true;
            const micBtn = document.querySelector('.mic-btn');
            if (micBtn) {
                micBtn.classList.add('active');
            }
            
            // ✅ ĪSĀ INSTRUKCIJA!
            if (window.uiManager) {
                window.uiManager.updateStatusText('🎤 Klausos wake word...');
            }
            
            // ✅ Parādīt instrukciju assistantUI
            if (window.assistantUI) {
                window.assistantUI.setState('listening');
                window.assistantUI.showMessage('Sakiet "Aivar"!\nNosauciet dziesmu', 'info');
            }
            
            try {
                this.recognition.start();
                console.log("Runas atpazīšana sākta");
                if (window.uiManager) {
                    window.uiManager.updateSystemLog("Runas atpazīšana sākta");
                }
            } catch (error) {
                console.error('Kļūda sākot atpazīšanu:', error);
                if (window.uiManager) {
                    window.uiManager.updateSystemLog(`Kļūda sākot atpazīšanu: ${error.message}`);
                }
                
                // Mēģinām atkārtoti izveidot atpazīšanas objektu
                this.setupSpeechRecognition();
                
                // Mēģinām atkārtoti sākt
                try {
                    this.recognition.start();
                } catch (secondError) {
                    console.error('Atkārtota kļūda sākot atpazīšanu:', secondError);
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog(`Neizdevās sākt atpazīšanu: ${secondError.message}`);
                    }
                }
            }

        } catch (error) {
            console.error('Mikrofonam nav piekļuves:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Mikrofonam nav piekļuves: ${error.message}`);
            }
        }
    }

    stopListening() {
        if (!this.recognition) return;
        
        this.isListening = false;
        const micBtn = document.querySelector('.mic-btn');
        if (micBtn) {
            micBtn.classList.remove('active');
        }
        
        if (window.uiManager) {
            window.uiManager.updateStatusText('Gaidīšanas režīmā');
        }
        
        this.stopRecognition();
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    getIsListening() {
        return this.isListening;
    }
}

export const recognitionManager = new RecognitionManager();