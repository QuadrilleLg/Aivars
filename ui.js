// ui.js - Fixed version with proper mobile support and video modal integration
class UIManager {
    constructor() {
        console.log('🎬 UIManager constructor started');
        
        this.setupTabSwitching();
        this.setupEventListeners();
        this.startClock();
        this.setupAudioPlayer();
        this.setupDanceDescriptionPanel();
        this.currentDanceInterval = null;
        
        // Songs will be loaded from main.js after audioManager is ready
    }

    setupEventListeners() {
        const micBtn = document.querySelector('.mic-btn');
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (window.recognitionManager) {
                    window.recognitionManager.toggleListening();
                }
            });
        }
        
        const stopButton = document.querySelector('.stop-btn');
        if (stopButton) {
            stopButton.addEventListener('click', () => {
                if (window.audioManager) {
                    window.audioManager.stopPlayback();
                    this.handleResponse("Mūzikas atskaņošana ir apturēta");
                }
            });
        }
        
        const sendBtn = document.querySelector('.send-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', this.handleSendButton.bind(this));
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

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.tab');
        const chatLog = document.getElementById('chatLog');
        const systemLog = document.getElementById('systemLog');

        if (tabs.length >= 2 && chatLog && systemLog) {
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
    }

    handleTextInput(text) {
        if (!text.trim()) return;
        
        console.log('Teksta ievade:', text);
        this.updateChatLog(`Jūs: ${text}`);
    
        // Wake word apstrāde
        if (window.responseManager && window.responseManager.responses) {
            const wakeWord = window.responseManager.responses.wake_word;
            if (wakeWord && wakeWord.questions.some(q => text.toLowerCase().includes(q.toLowerCase()))) {
                const answer = wakeWord.answers[Math.floor(Math.random() * wakeWord.answers.length)];
                this.updateChatLog(`Asistents: ${answer}`);
                
                if (wakeWord.audio_path && window.audioManager) {
                    window.audioManager.playFragment(wakeWord.audio_path);
                }
                return;
            }
        }
    
        // Pārējo komandu apstrāde
        if (window.audioManager) {
            const audioResponse = window.audioManager.handleCommand(text);
            if (audioResponse) {
                this.updateChatLog(`Asistents: ${audioResponse}`);
            }
        }
    }

    handleSendButton() {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            this.handleTextInput(textInput.value);
            textInput.value = '';
        }
    }

    updateChatLog(message) {
        const chatLog = document.getElementById('chatLog');
        if (chatLog) {
            const time = new Date().toLocaleTimeString();
            chatLog.innerHTML += `\n[${time}] ${message}`;
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    }

    updateSystemLog(message) {
        const systemLog = document.getElementById('systemLog');
        if (systemLog) {
            const time = new Date().toLocaleTimeString();
            systemLog.innerHTML += `\n[${time}] ${message}`;
            systemLog.scrollTop = systemLog.scrollHeight;
        }
        console.log('📝 System:', message);
    }

    updateStatusText(text) {
        const statusEl = document.getElementById('statusText');
        if (statusEl) {
            statusEl.textContent = text;
        }
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

        // Aprēķinām grādus (0° ir pulksten 12)
        const secondDegrees = ((seconds / 60) * 360);
        const minuteDegrees = ((minutes + seconds/60) / 60) * 360;
        const hourDegrees = ((hours % 12 + minutes/60) / 12) * 360;

        const secondHand = document.querySelector('.second-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const hourHand = document.querySelector('.hour-hand');

        // ✅ LABOTS: Pareiza transform ar translateX, translateY un rotate
        if (secondHand) secondHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${secondDegrees}deg)`;
        if (minuteHand) minuteHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${minuteDegrees}deg)`;
        if (hourHand) hourHand.style.transform = `translateX(-50%) translateY(-100%) rotate(${hourDegrees}deg)`;
    }

    async handleResponse(response) {
        console.log('Atbilde:', response);
        this.updateChatLog(`Asistents: ${response}`);

        if (response === "Mūzikas atskaņošana ir apturēta") {
            if (window.audioManager) window.audioManager.stopPlayback();
            return;
        }
        if (response === "Mūzika nopauzēta") {
            if (window.audioManager) window.audioManager.pausePlayback();
            return;
        }
        if (response.includes("Sagatavojamies")) {
            return;
        }
    }

    // Ielādē dziesmu sarakstu no audioManager
    loadSongList() {
        console.log('🎵 loadSongList() called');
        
        const songList = document.getElementById('songList');
        if (!songList) {
            console.error('❌ songList element NOT FOUND!');
            return;
        }
        console.log('✅ songList element found:', songList);
        
        if (!window.audioManager) {
            console.error('❌ window.audioManager NOT FOUND!');
            return;
        }
        console.log('✅ window.audioManager found:', window.audioManager);
        
        if (!window.audioManager.kadrils) {
            console.error('❌ window.audioManager.kadrils NOT FOUND!');
            return;
        }
        console.log('✅ window.audioManager.kadrils found:', Object.keys(window.audioManager.kadrils));
        
        songList.innerHTML = '';
        
        const kadrilKeys = Object.keys(window.audioManager.kadrils);
        console.log(`📋 Found ${kadrilKeys.length} kadrils:`, kadrilKeys);
        
        kadrilKeys.forEach(kadrilKey => {
            const kadril = window.audioManager.kadrils[kadrilKey];
            console.log(`  ➕ Adding: ${kadril.name}`);
            
            const li = document.createElement('li');
            li.textContent = kadril.name;
            li.dataset.kadrilKey = kadrilKey;
            
            // Click handler for both desktop and mobile
            li.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🎵 Clicked on: ${kadril.name}`);
                
                // Iestatīt aktīvo kadriļu
                window.audioManager.setCurrentKadril(kadrilKey);
                
                // Noņemt active no visām
                songList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                
                // Pievienot active izvēlētajai
                li.classList.add('active');
                
                // Atjaunot dziesmas nosaukumu
                const titleEl = document.getElementById('activeSongTitle');
                if (titleEl) titleEl.textContent = kadril.name;
                
                // Ielādēt fragmentus
                this.loadFragments(kadrilKey);
                
                // ✅ LABOJUMS: Ielādēt dejas soļus uzreiz!
                this.loadDanceSteps(kadrilKey, 'pilnā');
                
                // Pārbaudīt vai video modālis ir atvērts
                const videoModal = document.getElementById('videoModal');
                const isVideoOpen = videoModal && videoModal.classList.contains('active');
                
                if (isVideoOpen && kadril.video && kadril.video.pilnā) {
                    // Ja video ir atvērts - atskaņot jaunās dziesmas video
                    if (window.videoPlayer && window.videoPlayer.playFragment) {
                        // Atjaunot video kadriļu
                        const currentVideoTitle = document.getElementById('currentVideoTitle');
                        if (currentVideoTitle) currentVideoTitle.textContent = kadril.name;
                        
                        // Atjaunot video fragmentu sarakstu
                        this.updateVideoFragments(kadrilKey);
                        
                        // Atskaņot pilno video
                        const videoPlayerEl = document.getElementById('videoPlayer');
                        if (videoPlayerEl && kadril.video.pilnā) {
                            videoPlayerEl.src = kadril.video.pilnā;
                            videoPlayerEl.load();
                            videoPlayerEl.play().catch(err => console.error('Video kļūda:', err));
                        }
                    }
                    this.updateSystemLog(`Video: ${kadril.name}`);
                } else {
                    // Ja video nav atvērts - atskaņot audio kā parasti
                    if (kadril.fragments.pilnā) {
                        window.audioManager.playFragment(kadril.fragments.pilnā);
                        
                        // ✅ LABOJUMS: Sākt dejas soļu sekošanu PĒC audio!
                        this.startDanceStepTracking(kadrilKey, 'pilnā');
                    }
                    this.updateSystemLog(`Izvēlēta dziesma: ${kadril.name}`);
                }
                
                // Close mobile menu after selection
                this.closeMobileMenu();
            });
            
            // Touch handler for better mobile response
            li.addEventListener('touchend', (e) => {
                // Let click handler do the work, just ensure it fires
                console.log(`📱 Touch on: ${kadril.name}`);
            }, { passive: true });
            
            songList.appendChild(li);
        });
        
        console.log(`✅ Successfully added ${kadrilKeys.length} songs to list!`);
    }
    
    // Close mobile menu helper
    closeMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const menuOverlay = document.getElementById('menuOverlay');
        const songListContainer = document.querySelector('.song-list-container');
        
        if (window.innerWidth <= 768) {
            if (menuToggle) menuToggle.classList.remove('active');
            if (menuOverlay) menuOverlay.classList.remove('active');
            if (songListContainer) songListContainer.classList.remove('active');
        }
    }
    
    // Atjaunot video fragmentu sarakstu
    updateVideoFragments(kadrilKey) {
        const videoFragmentsList = document.getElementById('videoFragmentsList');
        if (!videoFragmentsList) return;
        
        const kadril = window.audioManager?.kadrils[kadrilKey];
        if (!kadril || !kadril.video) return;
        
        videoFragmentsList.innerHTML = '';
        
        Object.keys(kadril.video).forEach(fragmentKey => {
            const btn = document.createElement('button');
            btn.className = 'video-fragment-btn';
            btn.textContent = fragmentKey.charAt(0).toUpperCase() + fragmentKey.slice(1);
            btn.dataset.fragmentKey = fragmentKey;
            
            // Pirmais fragments aktīvs
            if (fragmentKey === 'pilnā') btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                const videoPlayerEl = document.getElementById('videoPlayer');
                if (videoPlayerEl) {
                    videoPlayerEl.src = kadril.video[fragmentKey];
                    videoPlayerEl.load();
                    videoPlayerEl.play().catch(err => console.error('Video kļūda:', err));
                }
                
                videoFragmentsList.querySelectorAll('.video-fragment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
            
            videoFragmentsList.appendChild(btn);
        });
    }

    // Ielādē audio fragmentus vidējā daļā
    loadFragments(kadrilKey) {
        console.log('🎼 loadFragments() called for:', kadrilKey);
        
        const fragmentsList = document.getElementById('fragmentsList');
        if (!fragmentsList) {
            console.error('❌ fragmentsList element NOT FOUND!');
            return;
        }
        
        fragmentsList.innerHTML = '';
        
        const kadril = window.audioManager.kadrils[kadrilKey];
        if (!kadril || !kadril.fragments) {
            console.error('❌ No fragments found for:', kadrilKey);
            return;
        }
        
        console.log('📋 Fragments:', Object.keys(kadril.fragments));
        
        Object.keys(kadril.fragments).forEach(fragmentKey => {
            const fragmentPath = kadril.fragments[fragmentKey];
            const btn = document.createElement('button');
            btn.className = 'fragment-btn';
            
            // Formatē fragmenta nosaukumu
            const displayName = fragmentKey.charAt(0).toUpperCase() + fragmentKey.slice(1);
            btn.textContent = displayName;
            btn.dataset.fragmentKey = fragmentKey;
            
            btn.addEventListener('click', () => {
                console.log(`🎼 Playing fragment: ${displayName}`);
                
                // Atskaņot fragmentu
                window.audioManager.playFragment(fragmentPath);
                
                // Noņemt active no visiem
                fragmentsList.querySelectorAll('.fragment-btn').forEach(b => b.classList.remove('active'));
                
                // Pievienot active izvēlētajam
                btn.classList.add('active');
                
                // Ielādēt dejas soļus
                this.loadDanceSteps(kadrilKey, fragmentKey);
                
                // Uzsākt dejas soļu sekošanu
                this.startDanceStepTracking(kadrilKey, fragmentKey);
                
                this.updateSystemLog(`Atskaņoju fragmentu: ${displayName}`);
            });
            
            fragmentsList.appendChild(btn);
        });
        
        console.log(`✅ Added ${Object.keys(kadril.fragments).length} fragments`);
    }

    // Audio player kontroles
    setupAudioPlayer() {
        const playPauseBtn = document.getElementById('playPauseBtn');
        const stopBtn = document.getElementById('stopBtn');
        const mainAudio = document.getElementById('mainAudio');
        const progressBar = document.getElementById('progressBar');
        const songTimer = document.getElementById('songTimer');
        
        if (!mainAudio) {
            console.warn('⚠️ mainAudio element not found');
            return;
        }
        
        console.log('✅ Audio player controls initialized');
        
        // Play/Pause poga
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => {
                if (mainAudio.paused) {
                    mainAudio.play();
                    playPauseBtn.textContent = '⏸️';
                } else {
                    mainAudio.pause();
                    playPauseBtn.textContent = '▶️';
                }
            });
        }
        
        // Stop poga
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                mainAudio.pause();
                mainAudio.currentTime = 0;
                if (playPauseBtn) playPauseBtn.textContent = '▶️';
            });
        }
        
        // Progress bar atjaunināšana
        if (progressBar && songTimer) {
            mainAudio.addEventListener('timeupdate', () => {
                const progress = (mainAudio.currentTime / mainAudio.duration) * 100;
                progressBar.style.width = progress + '%';
                
                const currentTime = this.formatTime(mainAudio.currentTime);
                const duration = this.formatTime(mainAudio.duration);
                songTimer.textContent = `${currentTime} / ${duration}`;
            });
        }
        
        // ✅ LABOJUMS: Auto-update play/pause button
        mainAudio.addEventListener('play', () => {
            if (playPauseBtn) playPauseBtn.textContent = '⏸️';
        });
        
        mainAudio.addEventListener('pause', () => {
            if (playPauseBtn) playPauseBtn.textContent = '▶️';
        });
        
        // Kad dziesma beidzas
        mainAudio.addEventListener('ended', () => {
            if (playPauseBtn) playPauseBtn.textContent = '▶️';
            if (progressBar) progressBar.style.width = '0%';
        });
    }

    // Formatē laiku
    formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Dejas norises apraksta panelis
    setupDanceDescriptionPanel() {
        const fragmentsContainer = document.querySelector('.fragments-container');
        if (!fragmentsContainer) {
            console.warn('⚠️ fragments-container not found');
            return;
        }

        // Izveidojam dejas norises paneli
        const dancePanel = document.createElement('div');
        dancePanel.id = 'danceDescriptionPanel';
        dancePanel.className = 'dance-description-panel';
        dancePanel.innerHTML = `
            <h4>Dejas norise</h4>
            <div id="danceStepsList" class="dance-steps-list">
                <p class="no-dance-text">Izvēlieties fragmentu, lai redzētu dejas norisi</p>
            </div>
        `;

        // Pievienojam pēc fragmentu saraksta
        fragmentsContainer.appendChild(dancePanel);
        
        console.log('✅ Dance description panel created');
    }

    // Ielādē un parāda dejas soļus
    loadDanceSteps(kadrilKey, fragmentKey) {
        console.log('🎭 Loading dance steps for:', kadrilKey, fragmentKey);
        
        const danceStepsList = document.getElementById('danceStepsList');
        if (!danceStepsList) return;

        const kadril = window.audioManager?.kadrils[kadrilKey];
        if (!kadril || !kadril.timemarks || !kadril.timemarks[fragmentKey]) {
            danceStepsList.innerHTML = '<p class="no-dance-text">Šim fragmentam nav pieejami dejas soļi</p>';
            return;
        }

        const timemarks = kadril.timemarks[fragmentKey];
        
        // Izveidojam soļu sarakstu
        let stepsHTML = '<div class="steps-timeline">';
        timemarks.forEach((mark, index) => {
            stepsHTML += `
                <div class="dance-step" data-time="${mark.time}">
                    <div class="step-time">${this.formatTime(mark.time)}</div>
                    <div class="step-text">${mark.text}</div>
                </div>
            `;
        });
        stepsHTML += '</div>';
        
        danceStepsList.innerHTML = stepsHTML;
        
        console.log(`✅ Loaded ${timemarks.length} dance steps`);
    }

    // Uzsāk dejas soļu sekošanu
    startDanceStepTracking(kadrilKey, fragmentKey) {
        console.log('▶️ Starting dance step tracking');
        
        // Apstādinām iepriekšējo
        this.stopDanceStepTracking();

        const mainAudio = document.getElementById('mainAudio');
        if (!mainAudio) return;

        const kadril = window.audioManager?.kadrils[kadrilKey];
        if (!kadril || !kadril.timemarks || !kadril.timemarks[fragmentKey]) return;

        const timemarks = kadril.timemarks[fragmentKey];
        
        // Izveidojam intervālu, kas pārbauda pašreizējo laiku
        this.currentDanceInterval = setInterval(() => {
            const currentTime = mainAudio.currentTime;
            
            // Atrodam aktīvo soli
            const activeStepIndex = this.findActiveStep(timemarks, currentTime);
            
            // Atjauninām vizualizāciju
            this.updateActiveStep(activeStepIndex);
        }, 100); // Pārbaudam katras 100ms
    }

    // Apstādina dejas soļu sekošanu
    stopDanceStepTracking() {
        if (this.currentDanceInterval) {
            clearInterval(this.currentDanceInterval);
            this.currentDanceInterval = null;
            console.log('⏸️ Stopped dance step tracking');
        }
    }

    // Atrod aktīvo soli pēc laika
    findActiveStep(timemarks, currentTime) {
        let activeIndex = -1;
        
        for (let i = 0; i < timemarks.length; i++) {
            if (currentTime >= timemarks[i].time) {
                activeIndex = i;
            } else {
                break;
            }
        }
        
        return activeIndex;
    }

    // Atjaunina aktīvo soli vizualizācijā
    updateActiveStep(index) {
        const steps = document.querySelectorAll('.dance-step');
        
        steps.forEach((step, i) => {
            // Noņemam visas klases
            step.classList.remove('active', 'completed', 'upcoming', 'next-up');
            
            if (i === index) {
                // AKTĪVAIS solis
                step.classList.add('active');
                
                // ✅ UZLABOJUMS: Scroll uz CENTRU (nevis 'nearest')
                step.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center',      // ← PA VIDU!
                    inline: 'nearest' 
                });
            } else if (i < index) {
                // Pabeigti soļi
                step.classList.add('completed');
            } else if (i === index + 1) {
                // NĀKAMAIS solis (īpaši highlight)
                step.classList.add('next-up');
            } else if (i > index && i <= index + 3) {
                // Tuvākie 2-3 soļi pēc nākamā
                step.classList.add('upcoming');
            }
        });
    }
}

export const uiManager = new UIManager();

// TEST FUNKCIJA - izsauc manuāli console
window.testLoadSongs = function() {
    console.log('🧪 TEST: Manual song load');
    if (window.uiManager) {
        window.uiManager.loadSongList();
    } else {
        console.error('❌ uiManager not found!');
    }
};

console.log('💡 TIP: If songs dont load, try: testLoadSongs()');