// audio.js - simplified version without video

class AudioManager {
    constructor() {
        this.currentKadril = null;
        this.mainAudio = document.getElementById('mainAudio');
        this._captionInterval = null;
        this.activeFragment = null;
        this.wasPlaying = false; // Jauns - atzīmē vai bija aktīva atskaņošana
        
        // Definējam vadības komandas
        this.controlCommands = {
            stop: ['stop', 'apstāties', 'beidz', 'beigt', 'pietiek', 'pārtrauc'],
            pause: ['pauze', 'pauzt', 'nopauzē', 'nopauzēt', 'pagaidi'],
            resume: ['turpini', 'turpināt', 'atsākt', 'atsāc']
        };
        
        // Definējam wake word audio atbildes
        this.wakeWords = {
            'aivar': [
                {
                    audio: 'MUSIC/voice_responses/patiuzmaniba.mp3',
                    text: 'Esmu pati uzmanība!'
                },
                {
                    audio: 'MUSIC/voice_responses/gatavsdarbam.mp3',
                    text: 'Gatavs darbam!'
                },
                {
                    audio: 'MUSIC/voice_responses/uzmanigiklausos.mp3',
                    text: 'Uzmanīgi klausos'
                },
                {
                    audio: 'MUSIC/voice_responses/kavarupalidzet.mp3',
                    text: 'Labdien!'
                }
            ],
            'aivariņ': {
                audio: 'AUDIO/responses/adi_response.mp3',
                text: 'Klausos!'
            },
            'palīdzi': {
                audio: 'MUSIC/voice_responses/greetings/palidze.mp3',
                text: 'Kā varu palīdzēt?'
            }
        };

        // Definējam trīs deju struktūru ar fragmentiem
        this.kadrils = {
            'flamingo': {
                name: 'Bermudu divstūris-flamingo',
                fragments: {
                    'sākums': {
                        audio: 'MUSIC/kadrilas/rusins/parts/sakums.mp3',
                        captions: [
                            { time: 0, text: "Flamingo sākuma daļa - stājamies vietās" },
                            { time: 10, text: "Pirmie soļi uz priekšu" }
                        ]
                    },
                    'vidus': {
                        audio: 'MUSIC/kadrilas/rusins/parts/vidus.mp3',
                        captions: [
                            { time: 0, text: "Flamingo vidus daļa - grieziens" },
                            { time: 15, text: "Pagrieziens ar plaukstām" }
                        ]
                    },
                    'beigas': {
                        audio: 'MUSIC/kadrilas/rusins/parts/beigas.mp3',
                        captions: [
                            { time: 0, text: "Flamingo beigu daļa - kustība atpakaļ" },
                            { time: 10, text: "Palēcieni vietā" }
                        ]
                    },
                    'pilnā': {
                        audio: 'MUSIC/bermudu_divsturis/flamingo.mp3',
                        captions: [
                            { time: 0, text: "Flamingo sākums - gatavojamies" },
                            { time: 20, text: "Pirmā daļa - solis sānis" },
                            { time: 40, text: "Otrā daļa - pagriežamies" },
                            { time: 60, text: "Piedziedājums - visi kopā" }
                        ]
                    }
                },
                keywords: ['flaminga', 'flamingo', 'flamingo']
            },
            'bērzgali': {
                name: 'Bērzgales kadriļa',
                fragments: {
                    'pirmais gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/pirmais.mp3',
                        captions: [
                            { time: 0, text: "Pirmā gabala sākums - nostāšanās" },
                            { time: 10, text: "Kreisās rokas maiņa" }
                        ]
                    },
                    'otrais gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/otrais.mp3',
                        captions: [
                            { time: 0, text: "Otrā gabala sākums - grieziens pa labi" },
                            { time: 12, text: "Partnera maiņa" }
                        ]
                    },
                    'trešais gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/trešais.mp3',
                        captions: [
                            { time: 0, text: "Trešā gabala sākums - visi aplī" },
                            { time: 10, text: "Meitas virzās uz iekšu" }
                        ]
                    },
                    '4 gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/ceturtais.mp3',
                        captions: [
                            { time: 0, text: "Ceturtā gabala sākums - mainām virzienus" },
                            { time: 12, text: "Pāru pagriešanās" }
                        ]
                    },
                    '5 gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/piektais.mp3',
                        captions: [
                            { time: 0, text: "Piektā gabala sākums - virzienu maiņa" },
                            { time: 10, text: "Ātrāka kustība" }
                        ]
                    },
                    'sestais gabals': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/parts/sestais.mp3',
                        captions: [
                            { time: 0, text: "Sestā gabala sākums - noslēgums" },
                            { time: 12, text: "Pēdējie soļi" }
                        ]
                    },
                    'pilnā': {
                        audio: 'MUSIC/kadrilas/berlins/berzgale/berzgalefull.mp3',
                        captions: [
                            { time: 0, text: "Dejas sākums - gatavojamies" },
                            { time: 30, text: "Dārziņš - visi veido apli" },
                            { time: 63, text: "Pāru maiņa - vīrieši pagriezieties pa kreisi" },
                            { time: 95, text: "Kreisās rokas maiņa - griežamies pa labi" },
                            { time: 130, text: "Lielais dārziņš - vienotas kustības" }
                        ]
                    }
                },
                keywords: ['bērzgale', 'bērzgali', 'bērzgales']
            },
            'ciganovski': {
                name: 'Kadriļa "Cigamovskis"',
                fragments: {
                    '---': {
                        audio: 'MUSIC/kadrilas/rusins/parts/sakums.mp3',
                        captions: [
                            { time: 0, text: "Flamingo sākuma daļa - stājamies vietās" },
                            { time: 10, text: "Pirmie soļi uz priekšu" }
                        ]
                    },
                    '---': {
                        audio: 'MUSIC/kadrilas/rusins/parts/vidus.mp3',
                        captions: [
                            { time: 0, text: "Flamingo vidus daļa - grieziens" },
                            { time: 15, text: "Pagrieziens ar plaukstām" }
                        ]
                    },
                    '---': {
                        audio: 'MUSIC/kadrilas/rusins/parts/beigas.mp3',
                        captions: [
                            { time: 0, text: "Flamingo beigu daļa - kustība atpakaļ" },
                            { time: 10, text: "Palēcieni vietā" }
                        ]
                    },
                    'pilnā': {
                        audio: 'MUSIC/kadrilas/berlins/ciganovskis/Ciganovskisfull.mp3',
                        captions: [
                            { time: 0, text: "dārziņš" },
                            { time: 17, text: "pāru maiņa" },
                            { time: 28, text: "pa trim" },
                            { time: 48, text: "valsis" },
                            { time: 65, text: "otrais dārziņš" },
                            { time: 83, text: "otrā pāru maiņa" },
                            { time: 101, text: "stiķis" },
                            { time: 118, text: "otrā pāru maiņa" },
                            { time: 137, text: "meitas uz vidu" },
                            { time: 138, text: "puišu sveicināšanās" },
                            { time: 157, text: "meiteņu sveicināšanās" },
                            { time: 172, text: "trešais valsis" },
                            { time: 189, text: "trešais dārziņš" }
                            
                        ]
                    }
                },
                keywords: ['ciganovskis', 'ciganovski', 'cigi']
            },
            'berliņu': {
                name: 'Brambergas Berliņš',
                fragments: {
                    'dārziņš': {
                        audio: 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                        captions: [
                            { time: 0, text: "Dārziņa sākums - nostājamies aplī" },
                            { time: 15, text: "Visi virzās pa kreisi" }
                        ]
                    },
                    'sākums': {
                        audio: 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                        captions: [
                            { time: 0, text: "Berliņa sākums - puiši paceļ kreiso roku" },
                            { time: 10, text: "Meitas virza labo kāju" }
                        ]
                    },
                    'vidus': {
                        audio: 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                        captions: [
                            { time: 0, text: "Vidus daļa - pāri sastājas viens pret otru" },
                            { time: 12, text: "Visi griežas kopā" }
                        ]
                    },
                    'otra puse': {
                        audio: 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                        captions: [
                            { time: 0, text: "Otrā daļa - partnera maiņa" },
                            { time: 15, text: "Partneri sastājas aplī" }
                        ]
                    },
                    'beigas': {
                        audio: 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                        captions: [
                            { time: 0, text: "Dejas nobeigums - lielais dārziņš" },
                            { time: 10, text: "Visi sadevušies rokās virza soli pa kreisi" }
                        ]
                    },
                    'pilnā': {
                        audio: 'MUSIC/kadrilas/berlins/berlinsfull.mp3',
                        captions: [
                            { time: 0, text: "Dejas sākums - gatavojamies" },
                            { time: 30, text: "Dārziņš - visi veido apli" },
                            { time: 63, text: "Pāru maiņa - vīrieši pagriezieties pa kreisi" },
                            { time: 95, text: "Kreisās rokas maiņa - griežamies pa labi" },
                            { time: 130, text: "Lielais dārziņš - vienotas kustības" }
                        ]
                    }
                },
                keywords: ['berliņš', 'berliņu', 'berliņa', 'brambergas']
            }
        };
        
        // Pārbaudam, vai audio elements eksistē
        if (!this.mainAudio) {
            console.error('KĻŪDA: mainAudio elements nav atrasts!');
        }
        
        // Inicializācija
        this.setupEventListeners();
        this.populateSongList();
        this.createCaptionsPanel();
    }
    
    // Izveido titru paneli
    createCaptionsPanel() {
        const fragmentsContainer = document.querySelector('.fragments-container');
        if (!fragmentsContainer) return;
        
        // Izveido titru paneli, ja tas vēl neeksistē
        if (!document.getElementById('captionsPanel')) {
            const captionsPanel = document.createElement('div');
            captionsPanel.id = 'captionsPanel';
            captionsPanel.className = 'captions-panel';
            captionsPanel.innerHTML = `
                <h3>Dejas norise</h3>
                <div id="currentCaption" class="current-caption">Izvēlieties dziesmu...</div>
            `;
            
            // Pievieno titru paneli pēc fragmentu saraksta
            fragmentsContainer.appendChild(captionsPanel);
            
            // Pievieno CSS stilus titru panelim
            const style = document.createElement('style');
            style.textContent = `
                .captions-panel {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid rgba(230, 255, 0, 0.3);
                }
                
                .current-caption {
                    background: rgba(18, 26, 24, 0.5);
                    border: 1px solid #e6ff00;
                    padding: 10px;
                    border-radius: 3px;
                    margin-top: 10px;
                    text-align: center;
                    font-size: 16px;
                    min-height: 24px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Metode titru atjaunināšanai
    updateCaption() {
        if (!this.mainAudio || !this.currentKadril || !this.activeFragment) return;
        
        const captionElement = document.getElementById('currentCaption');
        if (!captionElement) return;
        
        const kadril = this.kadrils[this.currentKadril];
        if (!kadril || !kadril.fragments[this.activeFragment]) {
            captionElement.textContent = "Nav pieejami dejas soļu apraksti";
            return;
        }
        
        // Iegūstam atbilstošos titrus konkrētajam fragmentam
        const fragmentCaptions = kadril.fragments[this.activeFragment].captions;
        if (!fragmentCaptions || fragmentCaptions.length === 0) {
            captionElement.textContent = "Nav pieejami dejas soļu apraksti";
            return;
        }
        
        const currentTime = Math.floor(this.mainAudio.currentTime);
        let activeCaption = fragmentCaptions[0].text;
        
        // Atrast pareizo parakstu, balstoties uz pašreizējo laiku
        for (let i = 0; i < fragmentCaptions.length; i++) {
            if (currentTime >= fragmentCaptions[i].time) {
                activeCaption = fragmentCaptions[i].text;
            } else {
                break;
            }
        }
        
        // Atjaunināt parakstu
        captionElement.textContent = activeCaption;
    }
    
    // Atskaņo asistenta audio, bet nemaina UI
    playAssistantAudio(audioPath) {
        // Izveidojam pagaidu audio elementu, lai neietekmētu galveno
        const tempAudio = new Audio(audioPath);
        tempAudio.play().catch(e => console.error("Kļūda atskaņojot asistenta audio:", e));
    }
    
    // Pārveidota metode, kas izmanto pagaidu audio skaņām, bet nemaina UI
    playParallel(audioPath, videoPath) {
        this.playAssistantAudio(audioPath);
    }
    
    // Jaunas metodes UI elementu izveidei
    setupEventListeners() {
        // Play/Pause pogas notikumu klausītājs
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (this.mainAudio.paused) {
                    this.resumePlayback();
                } else {
                    this.pausePlayback();
                }
            });
        }
        
        // Stop pogas notikumu klausītājs
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.stopPlayback();
            });
        }
        
        // Progress bar atjaunināšana
        if (this.mainAudio) {
            this.mainAudio.addEventListener('timeupdate', () => {
                this.updateProgressBar();
                this.updateCaption(); // Atjauninam titrus
            });
            
            // Atskaņošanas beigas
            this.mainAudio.addEventListener('ended', () => {
                this.onPlaybackEnded();
            });
        }
    }
    
    // Dziesmu saraksta aizpildīšana
    populateSongList() {
        const songListElement = document.getElementById('songList');
        if (!songListElement) return;
        
        songListElement.innerHTML = '';
        
        // Pievienojam katru kadriļu sarakstam
        for (const kadrilKey in this.kadrils) {
            const kadril = this.kadrils[kadrilKey];
            const listItem = document.createElement('li');
            listItem.textContent = kadril.name;
            listItem.dataset.kadril = kadrilKey;
            
            // Notikumu klausītājs, lai atskaņotu, kad uzklikšķina
            listItem.addEventListener('click', () => {
                this.playSong(kadrilKey, 'pilnā');
            });
            
            songListElement.appendChild(listItem);
        }
    }
    
    // Fragmentu saraksta atjaunināšana, kad izvēlēta dziesma
    updateFragmentsList(kadrilKey) {
        const fragmentsElement = document.getElementById('fragmentsList');
        if (!fragmentsElement) return;
        
        fragmentsElement.innerHTML = '';
        
        if (!kadrilKey || !this.kadrils[kadrilKey]) return;
        
        const fragments = this.kadrils[kadrilKey].fragments;
        
        // Pievienojam katru fragmentu
        for (const fragmentKey in fragments) {
            const fragmentBtn = document.createElement('button');
            fragmentBtn.className = 'fragment-btn';
            fragmentBtn.textContent = fragmentKey;
            fragmentBtn.dataset.fragment = fragmentKey;
            
            // Iezīmējam aktīvo fragmentu
            if (this.activeFragment === fragmentKey) {
                fragmentBtn.classList.add('active');
            }
            
            // Notikumu klausītājs, lai atskaņotu fragmentu
            fragmentBtn.addEventListener('click', () => {
                this.playSong(kadrilKey, fragmentKey);
            });
            
            fragmentsElement.appendChild(fragmentBtn);
        }
    }
    
    // Progress bar atjaunināšana
    updateProgressBar() {
        const progressBar = document.getElementById('progressBar');
        const songTimer = document.getElementById('songTimer');
        
        if (!progressBar || !songTimer || !this.mainAudio) return;
        
        const currentTime = this.mainAudio.currentTime;
        const duration = this.mainAudio.duration || 0;
        
        // Atjauninām progress bar
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Formatējam laiku
        const formatTime = (time) => {
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        // Atjauninām laika rādījumu
        songTimer.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    }
    
    // Atskaņošanas beigu apstrāde
    onPlaybackEnded() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '▶️';
        }
        
        // Notīrām titrus
        const captionElement = document.getElementById('currentCaption');
        if (captionElement) {
            captionElement.textContent = "Atskaņošana pabeigta";
        }
    }
    
    // Aktīvās dziesmas atjaunināšana UI
    updateActiveSong(kadrilKey, fragmentKey = 'pilnā') {
        // Atjauninām dziesmu sarakstu
        const songItems = document.querySelectorAll('#songList li');
        songItems.forEach(item => {
            item.classList.toggle('active', item.dataset.kadril === kadrilKey);
        });
        
        // Atjauninām dziesmas virsrakstu
        const songTitle = document.getElementById('activeSongTitle');
        if (songTitle) {
            if (kadrilKey && this.kadrils[kadrilKey]) {
                songTitle.textContent = `${this.kadrils[kadrilKey].name} - ${fragmentKey}`;
            } else {
                songTitle.textContent = 'Izvēlieties dziesmu';
            }
        }
        
        this.activeFragment = fragmentKey;
        this.currentKadril = kadrilKey;
        
        // Atjauninām Play/Pause pogu
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = this.mainAudio && !this.mainAudio.paused ? '⏸️' : '▶️';
        }
        
        // Atjauninām fragmentu sarakstu
        this.updateFragmentsList(kadrilKey);
        
        // Atjauninām titru tekstu
        if (!kadrilKey) {
            const captionElement = document.getElementById('currentCaption');
            if (captionElement) {
                captionElement.textContent = "Izvēlieties dziesmu...";
            }
        }
    }

    // Pārbauda vai fragments atbilst balss komandai (ņemot vērā dažādus locījumus)
    matchesFragment(command, fragmentKey) {
        // Pamata varianti
        if (command.includes(fragmentKey)) return true;
        
        // Locījumu varianti
        const endings = ['u', 'a', 'am', 'ā', 'us', 'as', 'iem', 'ām'];
        for (const ending of endings) {
            if (command.includes(fragmentKey + ending)) return true;
        }
        
        // Specifiskas pārbaudes
        if (fragmentKey === 'sākums' && (command.includes('sāk') || command.includes('sakum'))) return true;
        if (fragmentKey === 'vidus' && (command.includes('vid') || command.includes('vidu'))) return true;
        if (fragmentKey === 'beigas' && (command.includes('beig') || command.includes('noslēgum'))) return true;
        if (fragmentKey === 'otra puse' && (command.includes('otr') || command.includes('otru pus'))) return true;
        if (fragmentKey === 'dārziņš' && (command.includes('dārziņ') || command.includes('darziņ'))) return true;
        if (fragmentKey === 'pilnā' && (command.includes('visp') || command.includes('visu') || command.includes('pilnīb'))) return true;
        
        // Papildinājums konkrētiem fragmentiem
        if (fragmentKey === 'pirmais gabals' && command.includes('pirm')) return true;
        if (fragmentKey === 'otrais gabals' && command.includes('otr')) return true;
        if (fragmentKey === 'trešais gabals' && command.includes('treš')) return true;
        if (fragmentKey === 'ceturtais gabals' && command.includes('ceturt')) return true;
        if (fragmentKey === 'piektais gabals' && command.includes('piekt')) return true;
        if (fragmentKey === 'sestais gabals' && command.includes('sest')) return true;
        
        return false;
    }

    handleCommand(command) {
        if (!command) return null;
        
        command = command.toLowerCase().trim();
        console.log('Audio Menedžeris apstrādā komandu:', command);

        // Pārbaudam wake words un atskaņojam atbildes
        for (const wakeWord in this.wakeWords) {
            if (command.includes(wakeWord)) {
                // Ja komanda ir 'aivar', izvēlamies nejaušu atbildi no masīva
                if (wakeWord === 'aivar') {
                    const randomIndex = Math.floor(Math.random() * this.wakeWords[wakeWord].length);
                    const randomResponse = this.wakeWords[wakeWord][randomIndex];
                    
                    // Atskaņojam skaņu, bet nesabojājam UI
                    this.playAssistantAudio(randomResponse.audio);
                    
                    return randomResponse.text;
                } else {
                    // Citiem wake vārdiem atskaņojam parasto atbildi
                    const response = this.wakeWords[wakeWord];
                    this.playAssistantAudio(response.audio);
                    
                    return response.text;
                }
            }
        }
        
        // Pārbaudam vadības komandas
        if (this.controlCommands.stop.some(cmd => command.includes(cmd))) {
            this.stopPlayback();
            return 'Apturēju atskaņošanu';
        }

        if (this.controlCommands.pause.some(cmd => command.includes(cmd))) {
            this.pausePlayback();
            return 'Nopauzēju atskaņošanu';
        }

        if (this.controlCommands.resume.some(cmd => command.includes(cmd))) {
            this.resumePlayback();
            return 'Turpinu atskaņošanu';
        }

        // Pārbaudam, vai tiek mainīta deja
        for (const [kadrilKey, kadril] of Object.entries(this.kadrils)) {
            if (kadril.keywords.some(keyword => command.includes(keyword))) {
                this.currentKadril = kadrilKey;
                
                // Ja pieminēta pilnā deja vai nav konkrēts fragments
                if (command.includes('pilno') || command.includes('visu') || command.includes('pilnībā')) {
                    this.playSong(kadrilKey, 'pilnā');
                    return `Atskaņoju ${kadril.name} pilnībā`;
                }

                // Meklējam fragmentu
                for (const [fragmentKey, fragment] of Object.entries(kadril.fragments)) {
                    if (this.matchesFragment(command, fragmentKey) && fragmentKey !== 'pilnā') {
                        this.playSong(kadrilKey, fragmentKey);
                        return `Atskaņoju ${kadril.name} - ${fragmentKey}`;
                    }
                }

                // Ja fragments nav norādīts, atskaņojam pilno
                this.playSong(kadrilKey, 'pilnā');
                return `Atskaņoju ${kadril.name}`;
            }
        }

        // Ja ir aktīva deja (vai nopauzēta), meklējam tikai fragmentu
        if (this.currentKadril) {
            const currentKadrilData = this.kadrils[this.currentKadril];
            for (const [fragmentKey, fragment] of Object.entries(currentKadrilData.fragments)) {
                if (this.matchesFragment(command, fragmentKey) && fragmentKey !== 'pilnā') {
                    this.playSong(this.currentKadril, fragmentKey);
                    return `Atskaņoju ${currentKadrilData.name} - ${fragmentKey}`;
                }
            }
        }

        return null;
    }

    // Galvenā metode dziesmas atskaņošanai
    playSong(kadrilKey, fragmentKey = 'pilnā') {
        // Pārbaudam, vai deja un fragments eksistē
        if (!this.kadrils[kadrilKey] || !this.kadrils[kadrilKey].fragments[fragmentKey]) {
            console.error(`Nezināma deja vai fragments: ${kadrilKey} - ${fragmentKey}`);
            return;
        }
        
        // Saglabājam aktīvo deju
        this.currentKadril = kadrilKey;
        this.activeFragment = fragmentKey;
        
        // Iegūstam audio ceļu
        const audioPath = this.kadrils[kadrilKey].fragments[fragmentKey].audio;
        
        // Atskaņojam audio
        this.playAudio(audioPath);
        
        // Atjauninām UI
        this.updateActiveSong(kadrilKey, fragmentKey);
    }

    // Audio atskaņošanas metode
    async playAudio(audioPath) {
        if (!this.mainAudio) {
            console.error('Audio elements nav inicializēts');
            return;
        }
        
        try {
            // Vispirms apturē jebkādus aktīvos medijus
            this.stopPlayback();
            
            // Iestatām audio
            this.mainAudio.src = audioPath;
            await this.mainAudio.load();
            
            // Mēģinām atskaņot
            try {
                await this.mainAudio.play();
                console.log('Atskaņošana sākta:', audioPath);
                
                // Atjauninām Play/Pause pogu
                const playPauseBtn = document.getElementById('playPauseBtn');
                if (playPauseBtn) {
                    playPauseBtn.textContent = '⏸️';
                }
                
                // Atjauninam titrus
                this.updateCaption();
            } catch (playError) {
                console.error('Kļūda atskaņojot audio:', playError);
                
                // Mēģinām atkārtoti pēc lietotāja interakcijas
                const playAudioOnInteraction = () => {
                    this.mainAudio.play()
                        .then(() => {
                            console.log("Audio atskaņošana aktivizēta pēc interakcijas");
                            const playPauseBtn = document.getElementById('playPauseBtn');
                            if (playPauseBtn) {
                                playPauseBtn.textContent = '⏸️';
                            }
                        })
                        .catch(e => console.error("Atkārtota kļūda ar audio:", e));
                    document.removeEventListener('click', playAudioOnInteraction);
                };
                document.addEventListener('click', playAudioOnInteraction);
            }
        } catch (error) {
            console.error('Kļūda atskaņojot:', error);
        }
    }

    stopPlayback() {
        try {
            if (this.mainAudio) {
                this.mainAudio.pause();
                this.mainAudio.currentTime = 0;
                console.log('Atskaņošana apturēta');
                
                // Atjauninām Play/Pause pogu
                const playPauseBtn = document.getElementById('playPauseBtn');
                if (playPauseBtn) {
                    playPauseBtn.textContent = '▶️';
                }
                
                // Notīrām titrus
                const captionElement = document.getElementById('currentCaption');
                if (captionElement) {
                    captionElement.textContent = "Atskaņošana apturēta";
                }
            }
        } catch (error) {
            console.error('Kļūda apturot atskaņošanu:', error);
        }
    }

    pausePlayback() {
        try {
            if (this.mainAudio) {
                // Saglabājam info, ka darbojās
                this.wasPlaying = true;
                
                this.mainAudio.pause();
                console.log('Atskaņošana nopauzēta');
                
                // Atjauninām Play/Pause pogu
                const playPauseBtn = document.getElementById('playPauseBtn');
                if (playPauseBtn) {
                    playPauseBtn.textContent = '▶️';
                }
            }
        } catch (error) {
            console.error('Kļūda nopauzējot atskaņošanu:', error);
        }
    }

    resumePlayback() {
        try {
            if (this.mainAudio) {
                this.mainAudio.play()
                    .then(() => {
                        console.log('Atskaņošana turpināta');
                        
                        // Atjauninām Play/Pause pogu
                        const playPauseBtn = document.getElementById('playPauseBtn');
                        if (playPauseBtn) {
                            playPauseBtn.textContent = '⏸️';
                        }
                    })
                    .catch(error => {
                        console.error('Kļūda turpinot atskaņošanu:', error);
                    });
            }
        } catch (error) {
            console.error('Kļūda turpinot atskaņošanu:', error);
        }
    }
}

export const audioManager = new AudioManager();