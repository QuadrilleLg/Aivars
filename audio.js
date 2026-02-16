// audio.js - Refactored versija (TIKAI LOĢIKA)
// Dati tiek ielādēti no kadrils-data.json

class AudioManager {
    constructor() {
        this.currentKadril = null;
        this.mainAudio = document.getElementById('mainAudio');
        this.mainVideo = document.getElementById('mainVideo');
        
        // Datu konteineri (tiks ielādēti no JSON)
        this.controlCommands = {};
        this.wakeWords = {};
        this.kadrils = {};
        
        // Data loading state
        this.isDataLoaded = false;
        this.dataLoadPromise = null;
        
        // Ielādējam datus
        this.dataLoadPromise = this.loadData();
    }

    // ========================================
    // DATU IELĀDE
    // ========================================
    
    async loadData() {
        try {
            const response = await fetch('kadrils-data.json');
            const data = await response.json();
            
            this.controlCommands = data.controlCommands;
            this.wakeWords = data.wakeWords;
            this.kadrils = data.kadrils;
            
            this.isDataLoaded = true;
            
            console.log('✅ Kadriļu dati veiksmīgi ielādēti:', Object.keys(this.kadrils).length, 'kadriļas');
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog(
                    `Ielādētas ${Object.keys(this.kadrils).length} kadriļas`
                );
            }
            
            return true;
        } catch (error) {
            console.error('❌ Kļūda ielādējot kadriļu datus:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda ielādējot datus: ${error.message}`);
            }
            throw error;
        }
    }

    // Gaidīt, kamēr dati ir ielādēti
    async waitForData() {
        if (this.isDataLoaded) {
            return true;
        }
        return await this.dataLoadPromise;
    }
    
    // Pārbaudīt, vai dati ir gatavi
    isReady() {
        return this.isDataLoaded;
    }

    // ========================================
    // KOMANDU APSTRĀDES METODES
    // ========================================

    handleCommand(command) {
        // Pārbaudām, vai dati ir ielādēti
        if (!this.isDataLoaded) {
            console.warn('⚠️ Dati vēl nav ielādēti, komanda tiks ignorēta');
            return 'Lūdzu uzgaidiet, dati vēl ielādējas...';
        }
        
        command = command.toLowerCase().trim();

        // ❌ NOŅEMTS: Wake words apstrādā utils.js + speechManager!
        // Wake words vairs NEAPSTRĀDĀJAM šeit
        
        // Pārbaudam vadības komandas
        if (this.controlCommands.stop?.some(cmd => command.includes(cmd))) {
            this.stopPlayback();
            return 'Apturēju atskaņošanu';
        }

        if (this.controlCommands.pause?.some(cmd => command.includes(cmd))) {
            this.pausePlayback();
            return 'Nopauzēju atskaņošanu';
        }

        if (this.controlCommands.resume?.some(cmd => command.includes(cmd))) {
            this.resumePlayback();
            return 'Turpinu atskaņošanu';
        }

        // Vispirms pārbaudam, vai tiek mainīta deja
        for (const [kadrilKey, kadril] of Object.entries(this.kadrils)) {
            if (kadril.keywords.some(keyword => command.includes(keyword))) {
                this.currentKadril = kadrilKey;
                
                // ✅ ATJAUNINA UI - tāpat kā ar klikšķi!
                if (window.uiManager) {
                    // Atjaunina aktīvās dziesmas nosaukumu
                    const titleEl = document.getElementById('activeSongTitle');
                    if (titleEl) titleEl.textContent = kadril.name;
                    
                    // Ielādē fragmentus
                    window.uiManager.loadFragments(kadrilKey);
                    
                    // Ielādē dejas soļus
                    window.uiManager.loadDanceSteps(kadrilKey, 'pilnā');
                    
                    // Atzīmē dziesmu sarakstā
                    const songList = document.getElementById('songList');
                    if (songList) {
                        songList.querySelectorAll('li').forEach(li => {
                            li.classList.remove('active');
                            if (li.dataset.kadrilKey === kadrilKey) {
                                li.classList.add('active');
                            }
                        });
                    }
                }
                
                // Pārbaudam vai prasīts video
                if (command.includes('video')) {
                    this.playVideo(kadril.video.youtube_id);
                    return `Rādu ${kadril.name} video`;
                }
                
                // Ja pieminēta pilnā deja
                if (command.includes('pilno') || command.includes('visu')) {
                    this.playFragment(kadril.fragments.pilnā);
                    
                    // ✅ Sāk dejas soļu sekošanu
                    if (window.uiManager) {
                        window.uiManager.startDanceStepTracking(kadrilKey, 'pilnā');
                    }
                    
                    return `Atskaņoju ${kadril.name} pilnībā`;
                }

                // Meklējam fragmentu
                for (const [fragmentKey, fragmentPath] of Object.entries(kadril.fragments)) {
                    if (command.includes(fragmentKey)) {
                        this.playFragment(fragmentPath);
                        
                        // ✅ Atjaunina dejas soļus konkrētajam fragmentam
                        if (window.uiManager) {
                            window.uiManager.loadDanceSteps(kadrilKey, fragmentKey);
                            window.uiManager.startDanceStepTracking(kadrilKey, fragmentKey);
                        }
                        
                        return `Atskaņoju ${kadril.name} - ${fragmentKey}`;
                    }
                }

                // Ja fragments nav norādīts, atskaņojam pilno
                this.playFragment(kadril.fragments.pilnā);
                
                // ✅ Sāk dejas soļu sekošanu pilnai dejai
                if (window.uiManager) {
                    window.uiManager.startDanceStepTracking(kadrilKey, 'pilnā');
                }
                
                return `Atskaņoju ${kadril.name}`;
            }
        }

        // Ja ir aktīva deja, meklējam tikai fragmentu
        if (this.currentKadril) {
            const currentKadrilData = this.kadrils[this.currentKadril];
            for (const [fragmentKey, fragmentPath] of Object.entries(currentKadrilData.fragments)) {
                if (command.includes(fragmentKey)) {
                    this.playFragment(fragmentPath);
                    
                    // ✅ Atjaunina UI kad maina fragmentu
                    if (window.uiManager) {
                        window.uiManager.loadDanceSteps(this.currentKadril, fragmentKey);
                        window.uiManager.startDanceStepTracking(this.currentKadril, fragmentKey);
                        
                        // Atzīmē fragmenta pogu
                        const fragmentsList = document.getElementById('fragmentsList');
                        if (fragmentsList) {
                            fragmentsList.querySelectorAll('.fragment-btn').forEach(btn => {
                                btn.classList.remove('active');
                                if (btn.dataset.fragmentKey === fragmentKey) {
                                    btn.classList.add('active');
                                }
                            });
                        }
                    }
                    
                    return `Atskaņoju ${currentKadrilData.name} - ${fragmentKey}`;
                }
            }
        }

        return null;
    }

    // ========================================
    // ATSKAŅOŠANAS METODES
    // ========================================

    async playFragment(fragmentPath) {
        try {
            this.mainAudio.src = fragmentPath;
            await this.mainAudio.load();
            await this.mainAudio.play();
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Atskaņoju: ${fragmentPath}`);
            }
        } catch (error) {
            console.error('Kļūda atskaņojot:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda atskaņojot: ${error.message}`);
            }
        }
    }

    async playVideo(youtubeId) {
        try {
            // YouTube video iegulšana vai pārslēgšanās
            const videoUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Rādu video: ${videoUrl}`);
            }
            
            // Šeit varētu būt loģika video rādīšanai
            // Piemēram:
            // this.mainVideo.src = videoUrl;
        } catch (error) {
            console.error('Kļūda rādot video:', error);
            if (window.uiManager) {
                window.uiManager.updateSystemLog(`Kļūda rādot video: ${error.message}`);
            }
        }
    }

    stopPlayback() {
        if (this.mainAudio) {
            this.mainAudio.pause();
            this.mainAudio.currentTime = 0;
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Atskaņošana apturēta');
            }
        }
    }

    pausePlayback() {
        if (this.mainAudio) {
            this.mainAudio.pause();
            
            if (window.uiManager) {
                window.uiManager.updateSystemLog('Atskaņošana nopauzēta');
            }
        }
    }

    resumePlayback() {
        if (this.mainAudio) {
            this.mainAudio.play()
                .then(() => {
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog('Atskaņošana turpināta');
                    }
                })
                .catch(error => {
                    if (window.uiManager) {
                        window.uiManager.updateSystemLog(`Kļūda turpinot: ${error.message}`);
                    }
                });
        }
    }
    
    // ========================================
    // KADRIĻU INFORMĀCIJAS METODES
    // ========================================
    
    // Atgriež pašreizējo kadriļu ar visiem datiem
    getCurrentKadril() {
        if (this.currentKadril && this.kadrils[this.currentKadril]) {
            return {
                key: this.currentKadril,
                data: this.kadrils[this.currentKadril]
            };
        }
        return null;
    }
    
    // Iestatīt aktīvo kadriļu
    setCurrentKadril(kadrilKey) {
        if (this.kadrils[kadrilKey]) {
            this.currentKadril = kadrilKey;
            return true;
        }
        return false;
    }

    // Iegūt timemarks konkrētam fragmentam
    getTimemarks(kadrilKey, fragmentKey) {
        const kadril = this.kadrils[kadrilKey];
        if (kadril && kadril.timemarks && kadril.timemarks[fragmentKey]) {
            return kadril.timemarks[fragmentKey];
        }
        return [];
    }
    
    // Iegūt visas pieejamās kadriļas
    getAllKadrils() {
        return Object.keys(this.kadrils).map(key => ({
            key: key,
            name: this.kadrils[key].name,
            keywords: this.kadrils[key].keywords
        }));
    }
    
    // Iegūt konkrētas kadriļas fragmentus
    getFragments(kadrilKey) {
        const kadril = this.kadrils[kadrilKey];
        if (kadril && kadril.fragments) {
            return Object.keys(kadril.fragments);
        }
        return [];
    }
    
    // Iegūt video informāciju
    getVideoInfo(kadrilKey) {
        const kadril = this.kadrils[kadrilKey];
        if (kadril && kadril.video) {
            return kadril.video;
        }
        return null;
    }
}

// Eksportējam instanci
export const audioManager = new AudioManager();