// audio.js

class AudioManager {
    constructor() {
        this.currentKadril = null;
        this.mainAudio = document.getElementById('mainAudio');
        this.mainVideo = document.getElementById('mainVideo');
        
        // Definējam vadības komandas
        this.controlCommands = {
            stop: ['stop', 'apstāties', 'beidz', 'beigt', 'pietiek', 'pārtrauc'],
            pause: ['pauze', 'pauzt', 'nopauze', 'nopauzēt', 'pagaidi'],
            resume: ['turpini', 'turpināt', 'atsākt', 'atsāc']
        };
        
        // Definējam wake word audio atbildes
        this.wakeWords = {
            'aivar': 'MUSIC/voice_responses/greetings/sei.mp3',
            'adi': 'AUDIO/responses/adi_response.mp3',
            'adelaida': 'MUSIC/voice_responses/greetings/palidze.mp3'
        };

        // Definējam deju struktūru ar atsevišķu VIDEO objektu
        this.kadrils = {
            'rusiņš': {
                name: 'Kadriļa Rusiņš',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/ada/parts/sakums.mp3',
                    'grieziens': 'MUSIC/kadrilas/ada/parts/grieziens.mp3',
                    'pilnā': 'MUSIC/kadrilas/rusins/rusinsfull.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/rusins/rusins.mp4',
                    'sākums': 'VIDEO/kadrilas/rusins/sakums.mp4',
                    'grieziens': 'VIDEO/kadrilas/rusins/grieziens.mp4'
                },
                timemarks: {
                    'pilnā': [
                        { time: 0, text: "Sākuma nostāšanās - četri pāri kvadrātā" },
                        { time: 8, text: "Visi soļo uz priekšu, tad atpakaļ" },
                        { time: 16, text: "Dāmas paiet uz vidū, plaukšķina" },
                        { time: 24, text: "Kungi paiet uz vidū, plaukšķina" }
                    ],
                    'sākums': [
                        { time: 0, text: "Partneru maiņa - dāmas rotē pa labi" },
                        { time: 12, text: "Grieziens ar jauno partneri" },
                        { time: 24, text: "Atgriešanās pie sava partnera" },
                        { time: 36, text: "Visi kopā ķēdē - zvaigzne" }
                    ],
                    'grieziens': [
                        { time: 0, text: "Noslēguma rītis - promenāde" },
                        { time: 10, text: "Pāri rotē ap sevi" },
                        { time: 20, text: "Visi paceļ rokas - loks" },
                        { time: 28, text: "Noslēguma paklanīšanās" }
                    ]
                },
                keywords: ['rusiņš', 'rusiņu', 'russu']
            },
            
            'padespaņs': {
                name: 'Padespaņs',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/adi/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/adi/parts/vidus.mp3', 
                    'beigas': 'MUSIC/kadrilas/adi/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/padespans/Padespaan_v1.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/padespans/padespans.mp4',
                    'sākums': 'VIDEO/kadrilas/padespans/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/padespans/vidus.mp4',
                    'beigas': 'VIDEO/kadrilas/padespans/beigas.mp4'
                },
                keywords: ['padespaņs', 'spainis', 'bada spains']
            },
            'narečenka': {
                name: 'Narečenka',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/adelaida/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/adelaida/parts/vidus.mp3',
                    'beigas': 'MUSIC/kadrilas/adelaida/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/narecenka/Narechenka.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/narecenka/narecenka.mp4',
                    'sākums': 'VIDEO/kadrilas/narecenka/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/narecenka/vidus.mp4',
                    'beigas': 'VIDEO/kadrilas/narecenka/beigas.mp4'
                },
                keywords: ['narečenku', 'uz upi', 'uz upīti']
            },
            'bērzgali': {
                name: 'Bērzgales kadriļa!!',
                fragments: {
                    'pirmais gabals': 'MUSIC/kadrilas/berzgale/parts/pirmais.mp3',
                    'otrais gabals': 'MUSIC/kadrilas/berzgale/parts/otrais.mp3',
                    'trešais gabals': 'MUSIC/kadrilas/berzgale/parts/trešais.mp3',
                    'ceturtais gabals': 'MUSIC/kadrilas/berzgale/parts/ceturtais.mp3',
                    'piektais gabals': 'MUSIC/kadrilas/berzgale/parts/piektais.mp3',
                    'sestais gabals': 'MUSIC/kadrilas/berzgale/parts/sestais.mp3',
                    'pilnā': 'MUSIC/kadrilas/berzgale/berzgalefull_v1.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/berzgales/berzgales.mp4',
                    'pirmais gabals': 'VIDEO/kadrilas/berzgales/pirmais.mp4',
                    'otrais gabals': 'VIDEO/kadrilas/berzgales/otrais.mp4',
                    'trešais gabals': 'VIDEO/kadrilas/berzgale/tresais.mp4',
                    'ceturtais gabals': 'VIDEO/kadrilas/berzgale/ceturtais.mp4',
                    'piektais gabals': 'VIDEO/kadrilas/berzgale/piektais.mp4',
                    'sestais gabals': 'VIDEO/kadrilas/berzgale/sestais.mp4'
                },
                timemarks: {
                    'pirmais gabals': [
                                { time: 0, text: "V2...PIRMAIS GABALS - gatavojamies" },
                                { time: 5, text: "Pāru maiņa- pirmie pāri" },
                                { time: 18, text: "Pāru maiņa- otrie pāri" },
                                { time: 30, text: "Pāru maiņa- pirmie pāri" },
                                { time: 42, text: "Pāru maiņa- otrie pāri" },
                            
                    ],
                    'otrais gabals': [
                        { time: 0, text: "Otrais gabals - griezieni" },
                        { time: 8, text: "Grieziens ar partneri" },
                        { time: 16, text: "Grieziens ar pretējo" },
                        { time: 22, text: "Atpakaļ pie sava" }
                    ],
                    'trešais gabals': [
                        { time: 0, text: "Trešais gabals - zvaigzne" },
                        { time: 8, text: "Visi veido zvaigzni" },
                        { time: 16, text: "Rotācija pa labi" },
                        { time: 24, text: "Iziet no zvaigznes" }
                    ],
                    'ceturtais gabals': [
                        { time: 0, text: "Ceturtais gabals - ķēde" },
                        { time: 8, text: "Visi saķeras ķēdē" },
                        { time: 16, text: "Ķēde kustas pa aploksni" },
                        { time: 24, text: "Atgriešanās sākuma pozīcijās" }
                    ],
                    'piektais gabals': [
                        { time: 0, text: "Piektais gabals - tilts" },
                        { time: 8, text: "Divi pāri veido tiltu" },
                        { time: 16, text: "Citi pāri iet zem tilta" },
                        { time: 24, text: "Maiņa - jauni pāri veido tiltu" }
                    ],
                    'sestais gabals': [
                        { time: 0, text: "Sestais gabals - noslēgums" },
                        { time: 8, text: "Visi kopā promenāde" },
                        { time: 16, text: "Liels loks ar visiem" },
                        { time: 24, text: "Noslēguma paklanīšanās" }
                    ]
                },
                keywords: ['bērzgale', 'bērzgali', 'bērzgales']
            },
            'berlins': {
                name: 'Brambergas Berliņš!',
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/berlins/berlinsfull_v2.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/berlins/berlins.mp4',
                    'dārziņš': 'VIDEO/kadrilas/berlins/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/berlins/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/berlins/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/berlins/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/berlins/beigas.mp4'
                },
                timemarks: {
                    'dārziņš': [
                        { time: 0, text: "-----" },
                        { time: 8, text: "-----" },
                        { time: 16, text: "-----" },
                        { time: 24, text: "-----" }
                    ],
                    'sākums': [
                        { time: 0, text: "-----" },
                        { time: 8, text: "-----" },
                        { time: 16, text: "Partneru satikšanās centrā" },
                        { time: 24, text: "Atgriešanās vietās" }
                    ],
                    'vidus': [
                        { time: 0, text: "Vidus - dāmu maiņa" },
                        { time: 10, text: "Dāmas rotē pa kreisi" },
                        { time: 20, text: "Grieziens ar jauno partneri" },
                        { time: 30, text: "Vēl viena maiņa" }
                    ],
                    'otra puse': [
                        { time: 0, text: "Otra puse - kungu maiņa" },
                        { time: 10, text: "Kungi rotē pretēji" },
                        { time: 20, text: "Sastapu ar pretējo dāmu" },
                        { time: 30, text: "Visi atgriežas pie savējiem" }
                    ],
                    'beigas': [
                        { time: 0, text: "Beigas - noslēguma figūra" },
                        { time: 8, text: "Visi kopā promenāde" },
                        { time: 16, text: "Liels riņķis" },
                        { time: 24, text: "Paklanīšanās noslēgumā" }
                    ]
                },
                keywords: ['berliņš', 'berliņu', 'berliņa', 'brambergas']
            },
            'kvadrats': {
                name: 'Kvadrāts!', 
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/kvadrats/kvadrat_v1.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/kvadrats/kvadrats.mp4',
                    'dārziņš': 'VIDEO/kadrilas/kvadrats/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/kvadrats/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/kvadrats/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/kvadrats/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/kvadrats/beigas.mp4'
                },
                keywords: ['kvadrāts', 'kvadrātu', 'karēļu kvadrātu', 'karēļu kvadrāts']
            },
            'ciganovskis': {
                name: 'Ciganovskis!',
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/ciganovskis/Ciganovskisfull.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/ciganovskis/ciganovskis.mp4',
                    'dārziņš': 'VIDEO/kadrilas/ciganovskis/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/ciganovskis/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/ciganovskis/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/ciganovskis/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/ciganovskis/beigas.mp4'
                },
                keywords: ['ciganovskis', 'ciganovski', 'cigi']
            },
            'rikava': {
                name: 'Rikavas kadriļa',
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/ciganovskis/rikavafull.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/rikava/rikava.mp4',
                    'dārziņš': 'VIDEO/kadrilas/rikava/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/rikava/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/rikava/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/rikava/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/rikava/beigas.mp4'
                },
                keywords: ['rikavu', 'rikava', 'rika']
            },
            'sarkano': {
                name: 'sarkanbaltsarkanais',
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/sarkanaisfull.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/sarkanais/sarkanais.mp4',
                    'dārziņš': 'VIDEO/kadrilas/sarkanais/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/sarkanais/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/sarkanais/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/sarkanais/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/sarkanais/beigas.mp4'
                },
                keywords: ['sarkanais', 'sarkano', 'baltais']
            },
            'žīga': {
                name: 'family jig',
                fragments: {
                    'dārziņš': 'MUSIC/kadrilas/berlins/parts/darzins.mp3',
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/family_jig/Family Jig.mp3'
                },
                video: {
                    'pilnā': 'VIDEO/kadrilas/family_jig/family_jig.mp4',
                    'dārziņš': 'VIDEO/kadrilas/family_jig/darzins.mp4',
                    'sākums': 'VIDEO/kadrilas/family_jig/sakums.mp4',
                    'vidus': 'VIDEO/kadrilas/family_jig/vidus.mp4',
                    'otra puse': 'VIDEO/kadrilas/family_jig/otra_puse.mp4',
                    'beigas': 'VIDEO/kadrilas/family_jig/beigas.mp4'
                },
                keywords: ['family jig', 'džīga', 'žīga', 'brambergas']
            },
            
        };
        
    }

    handleCommand(command) {
        command = command.toLowerCase().trim();

        // Pārbaudam wake words un atskaņojam atbildes
        if (Object.keys(this.wakeWords).includes(command)) {
            this.playFragment(this.wakeWords[command]);
            return null;
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

        // Vispirms pārbaudam, vai tiek mainīta deja
        for (const [kadrilKey, kadril] of Object.entries(this.kadrils)) {
            if (kadril.keywords.some(keyword => command.includes(keyword))) {
                this.currentKadril = kadrilKey;
                
                // Pārbaudam vai prasīts video
                if (command.includes('video')) {
                    this.playVideo(kadril.video.pilnā);
                    return `Rādu ${kadril.name} video`;
                }
                
                // Ja pieminēta pilnā deja
                if (command.includes('pilno') || command.includes('visu')) {
                    this.playFragment(kadril.fragments.pilnā);
                    return `Atskaņoju ${kadril.name} pilnībā`;
                }

                // Meklējam fragmentu
                for (const [fragmentKey, fragmentPath] of Object.entries(kadril.fragments)) {
                    if (command.includes(fragmentKey)) {
                        this.playFragment(fragmentPath);
                        return `Atskaņoju ${kadril.name} - ${fragmentKey}`;
                    }
                }

                // Ja fragments nav norādīts, atskaņojam pilno
                this.playFragment(kadril.fragments.pilnā);
                return `Atskaņoju ${kadril.name}`;
            }
        }

        // Ja ir aktīva deja, meklējam tikai fragmentu
        if (this.currentKadril) {
            const currentKadrilData = this.kadrils[this.currentKadril];
            for (const [fragmentKey, fragmentPath] of Object.entries(currentKadrilData.fragments)) {
                if (command.includes(fragmentKey)) {
                    this.playFragment(fragmentPath);
                    return `Atskaņoju ${currentKadrilData.name} - ${fragmentKey}`;
                }
            }
        }

        return null;
    }

    async playFragment(fragmentPath) {
        try {
            this.mainAudio.src = fragmentPath;
            await this.mainAudio.load();
            await this.mainAudio.play();
            window.uiManager.updateSystemLog(`Atskaņoju: ${fragmentPath}`);
        } catch (error) {
            console.error('Kļūda atskaņojot:', error);
            window.uiManager.updateSystemLog(`Kļūda atskaņojot: ${error.message}`);
        }
    }

    async playVideo(videoPath) {
        try {
            this.mainVideo.src = videoPath;
            await this.mainVideo.load();
            await this.mainVideo.play();
            window.uiManager.updateSystemLog(`Rādu video: ${videoPath}`);
        } catch (error) {
            console.error('Kļūda rādot video:', error);
            window.uiManager.updateSystemLog(`Kļūda rādot video: ${error.message}`);
        }
    }

    stopPlayback() {
        if (this.mainAudio) {
            this.mainAudio.pause();
            this.mainAudio.currentTime = 0;
            window.uiManager.updateSystemLog('Atskaņošana apturēta');
        }
        if (this.mainVideo) {
            this.mainVideo.pause();
            this.mainVideo.currentTime = 0;
            window.uiManager.updateSystemLog('Video apturēts');
        }
    }

    pausePlayback() {
        if (this.mainAudio) {
            this.mainAudio.pause();
            window.uiManager.updateSystemLog('Atskaņošana nopauzēta');
        }
        if (this.mainVideo) {
            this.mainVideo.pause();
            window.uiManager.updateSystemLog('Video nopauzēts');
        }
    }

    resumePlayback() {
        if (this.mainAudio) {
            this.mainAudio.play()
                .then(() => window.uiManager.updateSystemLog('Atskaņošana turpināta'))
                .catch(error => window.uiManager.updateSystemLog(`Kļūda turpinot: ${error.message}`));
        }
        if (this.mainVideo) {
            this.mainVideo.play()
                .then(() => window.uiManager.updateSystemLog('Video turpināts'))
                .catch(error => window.uiManager.updateSystemLog(`Kļūda turpinot video: ${error.message}`));
        }
    }
    
    // Jauna metode - atgriež pašreizējo kadriļu ar video datiem
    getCurrentKadril() {
        if (this.currentKadril && this.kadrils[this.currentKadril]) {
            return {
                key: this.currentKadril,
                data: this.kadrils[this.currentKadril]
            };
        }
        return null;
    }
    
    // Jauna metode - iestatīt aktīvo kadriļu
    setCurrentKadril(kadrilKey) {
        if (this.kadrils[kadrilKey]) {
            this.currentKadril = kadrilKey;
            return true;
        }
        return false;
    }
}

export const audioManager = new AudioManager();
