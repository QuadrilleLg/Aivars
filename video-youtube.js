// video-youtube.js - AR MINŪTES:SEKUNDES FORMĀTU
// Pieņem GAN 204 GAN "3:24"!

console.log('🎬 YouTube video player...');

let currentVideoKadril = null;
let youtubePlayer = null;
let currentFragmentEnd = null;
let fragmentCheckInterval = null;
let timerInterval = null;

const videoModal = document.getElementById('videoModal');
const videoBtn = document.getElementById('videoBtn');
const closeVideo = document.getElementById('closeVideo');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const videoTimer = document.getElementById('videoTimer');

// ========================================
// HELPER: Pārveido "3:24" → 204 sekundes
// ========================================
function parseTimeToSeconds(time) {
    // Ja jau ir skaitlis, atgriež to
    if (typeof time === 'number') {
        return time;
    }
    
    // Ja ir string "3:24"
    if (typeof time === 'string' && time.includes(':')) {
        const parts = time.split(':');
        
        if (parts.length === 2) {
            // Formāts "M:SS" vai "MM:SS"
            const mins = parseInt(parts[0], 10);
            const secs = parseInt(parts[1], 10);
            return (mins * 60) + secs;
        }
        
        if (parts.length === 3) {
            // Formāts "H:MM:SS"
            const hours = parseInt(parts[0], 10);
            const mins = parseInt(parts[1], 10);
            const secs = parseInt(parts[2], 10);
            return (hours * 3600) + (mins * 60) + secs;
        }
    }
    
    // Ja ir string skaitlis "204"
    const parsed = parseFloat(time);
    if (!isNaN(parsed)) {
        return parsed;
    }
    
    // Fallback
    console.warn('Neizdevās konvertēt laiku:', time);
    return 0;
}

// ========================================
// YOUTUBE API LOADING
// ========================================
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
        const timeout = setTimeout(function() {
            reject(new Error('YouTube API timeout (10s)'));
        }, 10000);
        
        window.onYouTubeIframeAPIReady = function() {
            clearTimeout(timeout);
            resolve();
        };
        
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
    });
}

function initVideoPlayer() {
    loadYouTubeAPI().catch(function(err) {
        console.error('API kļūda:', err);
    });
    
    if (videoBtn) {
        videoBtn.addEventListener('click', openVideoModal);
    }
    
    if (closeVideo) {
        closeVideo.addEventListener('click', closeVideoModal);
    }
    
    // Click uz fonu aizvēr modal
    window.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // ESC taustiņš aizvēr modal
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
}

function createYouTubePlayer(videoId) {
    return new Promise(function(resolve, reject) {
        if (!window.YT || !window.YT.Player) {
            reject(new Error('YouTube API nav pieejams'));
            return;
        }
        
        const container = document.getElementById('youtubePlayer');
        if (!container) {
            reject(new Error('Container nav atrasts'));
            return;
        }
        
        if (youtubePlayer) {
            try {
                youtubePlayer.destroy();
            } catch (e) {}
        }
        
        container.innerHTML = '';
        
        try {
            youtubePlayer = new YT.Player('youtubePlayer', {
                videoId: videoId,
                playerVars: {
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                    mute: 1,  // Autoplay pieprasa muted video
                    origin: window.location.origin
                },
                events: {
                    onReady: function(event) {
                        startTimerUpdate();
                        resolve(event.target);
                    },
                    onError: function(event) {
                        let msg = 'Kļūda';
                        if (event.data === 2) msg = 'Nederīgs video ID';
                        if (event.data === 100) msg = 'Video nav atrasts';
                        if (event.data === 101 || event.data === 150) {
                            msg = 'Video nav embeddable! Iestatījumos: Allow embedding ON';
                        }
                        reject(new Error(msg));
                    },
                    onStateChange: function(event) {
                        if (event.data === 0) { // Video beidzies
                            stopFragmentCheck();
                        }
                    }
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

function openVideoModal() {
    const currentKadril = window.audioManager && window.audioManager.getCurrentKadril();
    
    if (!currentKadril) {
        alert('Izvēlieties dziesmu!');
        return;
    }
    
    if (!currentKadril.data.video || !currentKadril.data.video.youtube_id) {
        alert('Nav YouTube video!');
        return;
    }
    
    currentVideoKadril = currentKadril;
    
    if (currentVideoTitle) {
        currentVideoTitle.textContent = currentKadril.data.name;
    }
    
    if (videoModal) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // ✅ AUTO-PAUZE AUDIO!
    const mainAudio = document.getElementById('mainAudio');
    if (mainAudio && !mainAudio.paused) {
        mainAudio.pause();
    }
    
    loadYouTubeAPI()
        .then(function() {
            return createYouTubePlayer(currentKadril.data.video.youtube_id);
        })
        .then(function() {
            loadVideoFragments();
        })
        .catch(function(error) {
            alert('Kļūda: ' + error.message);
            closeVideoModal();
        });
}

// ✅ JAUNA FUNKCIJA: Nomaina video bez modāla aizvēršanas
function updateVideoInModal() {
    if (!videoModal || !videoModal.classList.contains('active')) {
        return; // Modal nav atvērts, neko nedarām
    }
    
    const currentKadril = window.audioManager && window.audioManager.getCurrentKadril();
    
    if (!currentKadril) {
        return;
    }
    
    if (!currentKadril.data.video || !currentKadril.data.video.youtube_id) {
        alert('Šai dziesmai nav video!');
        closeVideoModal();
        return;
    }
    
    // Ja tā pati dziesma, neko nedarām
    if (currentVideoKadril && currentVideoKadril.key === currentKadril.key) {
        return;
    }
    
    console.log('🔄 Mainam video uz:', currentKadril.data.name);
    
    currentVideoKadril = currentKadril;
    
    if (currentVideoTitle) {
        currentVideoTitle.textContent = currentKadril.data.name;
    }
    
    // Pārlādējam video
    loadYouTubeAPI()
        .then(function() {
            return createYouTubePlayer(currentKadril.data.video.youtube_id);
        })
        .then(function() {
            loadVideoFragments();
        })
        .catch(function(error) {
            console.error('Kļūda mainot video:', error);
        });
}

function closeVideoModal() {
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (youtubePlayer && youtubePlayer.pauseVideo) {
        try {
            youtubePlayer.pauseVideo();
        } catch (e) {}
    }
    
    stopFragmentCheck();
    stopTimerUpdate();
    currentVideoKadril = null;
}

function loadVideoFragments() {
    if (!videoFragmentsList || !currentVideoKadril) {
        return;
    }
    
    videoFragmentsList.innerHTML = '';
    
    const fragments = currentVideoKadril.data.video.fragments;
    if (!fragments) {
        videoFragmentsList.innerHTML = '<p style="color: rgba(230,255,0,0.5);">Nav fragmentu</p>';
        return;
    }
    
    Object.keys(fragments).forEach(function(key) {
        const frag = fragments[key];
        const btn = document.createElement('button');
        btn.className = 'video-fragment-btn';
        
        // Konvertē laiku uz sekundēm ⬅️ SVARĪGI!
        const startSec = parseTimeToSeconds(frag.start);
        const endSec = parseTimeToSeconds(frag.end);
        
        const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        btn.textContent = name + ' (' + formatTime(startSec) + ' - ' + formatTime(endSec) + ')';
        
        btn.addEventListener('click', function() {
            playVideoFragment(key);
            
            videoFragmentsList.querySelectorAll('.video-fragment-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
        
        videoFragmentsList.appendChild(btn);
    });
}

function playVideoFragment(fragmentKey) {
    if (!youtubePlayer || !currentVideoKadril) return;
    
    const fragment = currentVideoKadril.data.video.fragments[fragmentKey];
    if (!fragment) return;
    
    stopFragmentCheck();
    
    // Konvertē laiku uz sekundēm ⬅️ SVARĪGI!
    const startSec = parseTimeToSeconds(fragment.start);
    const endSec = parseTimeToSeconds(fragment.end);
    
    currentFragmentEnd = endSec;
    
    youtubePlayer.seekTo(startSec, true);
    youtubePlayer.playVideo();
    startFragmentCheck();
    
    // ✅ SCROLL UZ AKTĪVO FRAGMENTU
    const fragmentButtons = document.querySelectorAll('.video-fragment-btn');
    fragmentButtons.forEach(function(btn) {
        if (btn.textContent.toLowerCase().includes(fragmentKey.toLowerCase())) {
            btn.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest' 
            });
        }
    });
}

function startFragmentCheck() {
    fragmentCheckInterval = setInterval(function() {
        if (!youtubePlayer || !currentFragmentEnd) return;
        
        if (youtubePlayer.getCurrentTime() >= currentFragmentEnd) {
            youtubePlayer.pauseVideo();
            stopFragmentCheck();
        }
    }, 100);
}

function stopFragmentCheck() {
    if (fragmentCheckInterval) {
        clearInterval(fragmentCheckInterval);
        fragmentCheckInterval = null;
        currentFragmentEnd = null;
    }
}

function startTimerUpdate() {
    stopTimerUpdate();
    timerInterval = setInterval(function() {
        if (!youtubePlayer || !videoTimer) return;
        
        try {
            const current = formatTime(youtubePlayer.getCurrentTime());
            const duration = formatTime(youtubePlayer.getDuration());
            videoTimer.textContent = current + ' / ' + duration;
        } catch (e) {}
    }, 500);
}

function stopTimerUpdate() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

window.videoPlayer = {
    open: openVideoModal,
    close: closeVideoModal,
    playFragment: playVideoFragment,
    updateVideo: updateVideoInModal  // ✅ JAUNA eksportētā funkcija
};

// ✅ Klausāmies uz dziesmas maiņu no UI
if (window.addEventListener) {
    window.addEventListener('songChanged', function() {
        console.log('🎵 Dziesma mainījās, atjaunojam video...');
        updateVideoInModal();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✅ Ready');
