// audio.js - AR YOUTUBE VIDEO VISĀM DZIESMĀM

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

        // Definējam deju struktūru ar YOUTUBE VIDEO
        this.kadrils = {
            // ========================================
            // 1️⃣ RUSIŅŠ - JAU GATAVS
            // ========================================
            'rusiņš': {
                name: 'Kadriļa Rusiņš',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/ada/parts/sakums.mp3',
                    'grieziens': 'MUSIC/kadrilas/ada/parts/grieziens.mp3',
                    'pilnā': 'MUSIC/kadrilas/rusins/rusinsfull.mp3'
                },
                video: {
                    youtube_id: "yALk8KpCwKw",
                    fragments: {
                        pilna: { start: 0, end: 240 },
                        ievads: { start: 0, end: 15 },
                        pamata: { start: 15, end: 90 },
                        griezieni: { start: 90, end: 165 },
                        kombinacija: { start: 165, end: 240 }
                    }
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
            
            // ========================================
            // 2️⃣ PADESPAŅS
            // ========================================
            'padespaņs': {
                name: 'Padespaņs',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/adi/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/adi/parts/vidus.mp3', 
                    'beigas': 'MUSIC/kadrilas/adi/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/padespans/Padespaan_v1.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 180 },        // ⬅️ Mainīt sekundes
                        sakums: { start: 0, end: 60 },
                        vidus: { start: 60, end: 120 },
                        beigas: { start: 120, end: 180 }
                    }
                },
                keywords: ['padespaņs', 'spainis', 'bada spains']
            },
            
            // ========================================
            // 3️⃣ NAREČENKA
            // ========================================
            'narečenka': {
                name: 'Narečenka',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/adelaida/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/adelaida/parts/vidus.mp3',
                    'beigas': 'MUSIC/kadrilas/adelaida/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/narecenka/Narechenka.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 180 },        // ⬅️ Mainīt sekundes
                        sakums: { start: 0, end: 60 },
                        vidus: { start: 60, end: 120 },
                        beigas: { start: 120, end: 180 }
                    }
                },
                keywords: ['narečenku', 'uz upi', 'uz upīti']
            },
            
            // ========================================
            // 4️⃣ BĒRZGALI
            // ========================================
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
                    youtube_id: "_f_B58CEZNc",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 300 },              // ⬅️ Mainīt sekundes
                        pirmais_gabals: { start: 0, end: 50 },
                        otrais_gabals: { start: 50, end: 100 },
                        tresais_gabals: { start: 100, end: 169 },
                        ceturtais_gabals: { start: 169, end: 204 },
                        piektais_gabals: { start: 204 , end: 250 },
                        sestais_gabals: { start: 250, end: 300 }
                    }
                },
                timemarks: {
                    'pirmais gabals': [
                        { time: 0, text: "V2...PIRMAIS GABALS - gatavojamies" },
                        { time: 5, text: "Pāru maiņa- pirmie pāri" },
                        { time: 18, text: "Pāru maiņa- otrie pāri" },
                        { time: 30, text: "Pāru maiņa- pirmie pāri" },
                        { time: 42, text: "Pāru maiņa- otrie pāri" }
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
            
            // ========================================
            // 5️⃣ BUKMUIŽAS
            // ========================================
            'bukmuižas': {
                name: 'Bukmuižas kadriļa',
                fragments: {
                    'pirmais gabals': 'MUSIC/kadrilas/berzgale/parts/pirmais.mp3',
                    'otrais gabals': 'MUSIC/kadrilas/berzgale/parts/otrais.mp3',
                    'trešais gabals': 'MUSIC/kadrilas/berzgale/parts/trešais.mp3',
                    'ceturtais gabals': 'MUSIC/kadrilas/berzgale/parts/ceturtais.mp3',
                    'piektais gabals': 'MUSIC/kadrilas/berzgale/parts/piektais.mp3',
                    'sestais gabals': 'MUSIC/kadrilas/berzgale/parts/sestais.mp3',
                    'pilnā': 'MUSIC/kadrilas/bukmuizas/bukmuizasfull_v1.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 300 },              // ⬅️ Mainīt sekundes
                        pirmais_gabals: { start: 0, end: 50 },
                        otrais_gabals: { start: 50, end: 100 },
                        tresais_gabals: { start: 100, end: 150 },
                        ceturtais_gabals: { start: 150, end: 200 },
                        piektais_gabals: { start: 200, end: 250 },
                        sestais_gabals: { start: 250, end: 300 }
                    }
                },
                timemarks: {
                    'pirmais gabals': [
                        { time: 0, text: "Pirmais gabals - sākas" },
                        { time: 10, text: "Soļi pa labi" },
                        { time: 20, text: "Grieziens" },
                        { time: 30, text: "Atpakaļ" }
                    ],
                    'otrais gabals': [
                        { time: 0, text: "Otrais gabals" },
                        { time: 10, text: "Partneru maiņa" }
                    ],
                    'trešais gabals': [
                        { time: 0, text: "Trešais gabals" },
                        { time: 10, text: "Zvaigzne" }
                    ],
                    'ceturtais gabals': [
                        { time: 0, text: "Ceturtais gabals" },
                        { time: 10, text: "Ķēde" }
                    ],
                    'piektais gabals': [
                        { time: 0, text: "Piektais gabals" },
                        { time: 10, text: "Tilts" }
                    ],
                    'sestais gabals': [
                        { time: 0, text: "Sestais gabals - noslēgums" },
                        { time: 10, text: "Paklanīšanās" }
                    ]
                },
                keywords: ['bukmuiža', 'bukmuižas']
            },
            
            // ========================================
            // 6️⃣ LĪGO
            // ========================================
            'līgo': {
                name: 'Līgo',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/adelaida/parts/sakums.mp3',
                    'pilnā': 'MUSIC/kadrilas/ligo/ligofull_v1.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 200 },        // ⬅️ Mainīt sekundes
                        sakums: { start: 0, end: 50 }
                    }
                },
                keywords: ['līgo', 'līgu']
            },
            
            // ========================================
            // 7️⃣ BERLĪNS
            // ========================================
            'berlīns': {
                name: 'Berlīns',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/berlins/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/berlins/parts/vidus.mp3',
                    'otra puse': 'MUSIC/kadrilas/berlins/parts/otra_puse.mp3',
                    'beigas': 'MUSIC/kadrilas/berlins/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/berlins/berlinsfull_v1.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 240 },          // ⬅️ Mainīt sekundes
                        sakums: { start: 0, end: 60 },
                        vidus: { start: 60, end: 120 },
                        otra_puse: { start: 120, end: 180 },
                        beigas: { start: 180, end: 240 }
                    }
                },
                keywords: ['berlīns', 'berlīnu', 'berlīnā']
            },
            
            // ========================================
            // 8️⃣ SARKANAIS/BALTAIS
            // ========================================
            'sarkanais': {
                name: 'Sarkanais/Baltais',
                fragments: {
                    'sākums': 'MUSIC/kadrilas/sarkanais_baltais/parts/sakums.mp3',
                    'vidus': 'MUSIC/kadrilas/sarkanais_baltais/parts/vidus.mp3',
                    'beigas': 'MUSIC/kadrilas/sarkanais_baltais/parts/beigas.mp3',
                    'pilnā': 'MUSIC/kadrilas/sarkanais_baltais/sarkanais_baltais_full.mp3'
                },
                video: {
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 180 },        // ⬅️ Mainīt sekundes
                        sakums: { start: 0, end: 60 },
                        vidus: { start: 60, end: 120 },
                        beigas: { start: 120, end: 180 }
                    }
                },
                keywords: ['sarkanais', 'sarkano', 'baltais']
            },
            
            // ========================================
            // 9️⃣ ŽĪGA (Family Jig)
            // ========================================
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
                    youtube_id: "IEVADI_VIDEO_ID",  // ⬅️ Ievadi YouTube ID
                    fragments: {
                        pilna: { start: 0, end: 240 },          // ⬅️ Mainīt sekundes
                        darzins: { start: 0, end: 48 },
                        sakums: { start: 48, end: 96 },
                        vidus: { start: 96, end: 144 },
                        otra_puse: { start: 144, end: 192 },
                        beigas: { start: 192, end: 240 }
                    }
                },
                keywords: ['family jig', 'džīga', 'žīga', 'brambergas']
            }
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