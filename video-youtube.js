// video-youtube-DEBUG.js - AR DETALIZĒTU LOGGING
// Izmanto lai atrastu problēmu production!

console.log('🎬 YouTube video player - DEBUG MODE...');

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
    if (typeof time === 'number') {
        return time;
    }
    
    if (typeof time === 'string' && time.includes(':')) {
        const parts = time.split(':');
        
        if (parts.length === 2) {
            const mins = parseInt(parts[0], 10);
            const secs = parseInt(parts[1], 10);
            return (mins * 60) + secs;
        }
        
        if (parts.length === 3) {
            const hours = parseInt(parts[0], 10);
            const mins = parseInt(parts[1], 10);
            const secs = parseInt(parts[2], 10);
            return (hours * 3600) + (mins * 60) + secs;
        }
    }
    
    const parsed = parseFloat(time);
    if (!isNaN(parsed)) {
        return parsed;
    }
    
    console.warn('⚠️ Neizdevās konvertēt laiku:', time);
    return 0;
}

// ========================================
// YOUTUBE API LOADING - AR DEBUG
// ========================================
function loadYouTubeAPI() {
    console.log('📡 Mēģinu ielādēt YouTube API...');
    console.log('🌐 Current domain:', window.location.hostname);
    console.log('🔗 Current URL:', window.location.href);
    
    if (window.YT && window.YT.Player) {
        console.log('✅ YouTube API jau ielādēts!');
        return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
        const timeout = setTimeout(function() {
            console.error('❌ YouTube API timeout pēc 10s!');
            console.error('🔍 Pārbaudi vai API script ielādējās');
            reject(new Error('YouTube API timeout (10s)'));
        }, 10000);
        
        window.onYouTubeIframeAPIReady = function() {
            clearTimeout(timeout);
            console.log('✅ YouTube API ready callback!');
            console.log('✅ window.YT:', window.YT);
            resolve();
        };
        
        const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (existingScript) {
            console.log('⚠️ YouTube API script jau ir DOM!');
        } else {
            console.log('📥 Pievienoju YouTube API script...');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.onload = function() {
                console.log('✅ YouTube script ielādēts!');
            };
            tag.onerror = function() {
                console.error('❌ Neizdevās ielādēt YouTube script!');
                clearTimeout(timeout);
                reject(new Error('Script load failed'));
            };
            document.head.appendChild(tag);
        }
    });
}

function initVideoPlayer() {
    console.log('🔧 Inicializēju video player...');
    console.log('🌐 Domain:', window.location.hostname);
    console.log('📍 Protocol:', window.location.protocol);
    
    loadYouTubeAPI()
        .then(function() {
            console.log('✅ YouTube API ielādēts veiksmīgi!');
        })
        .catch(function(err) {
            console.error('❌ YouTube API kļūda:', err);
            alert('YouTube API neielādējās! Pārbaudi console.');
        });
    
    if (videoBtn) {
        console.log('✅ Video button atrasts');
        videoBtn.addEventListener('click', openVideoModal);
    } else {
        console.error('❌ Video button NAV atrasts!');
    }
    
    if (closeVideo) {
        closeVideo.addEventListener('click', closeVideoModal);
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });
    
    console.log('✅ Event listeners pievienoti');
}

function createYouTubePlayer(videoId) {
    console.log('🎥 Veidoju YouTube player ar ID:', videoId);
    
    return new Promise(function(resolve, reject) {
        if (!window.YT) {
            console.error('❌ window.YT NAV pieejams!');
            reject(new Error('YouTube API nav pieejams'));
            return;
        }
        
        if (!window.YT.Player) {
            console.error('❌ window.YT.Player NAV pieejams!');
            reject(new Error('YouTube Player nav pieejams'));
            return;
        }
        
        console.log('✅ window.YT.Player ir pieejams');
        
        const container = document.getElementById('youtubePlayer');
        if (!container) {
            console.error('❌ Container #youtubePlayer NAV atrasts!');
            reject(new Error('Container nav atrasts'));
            return;
        }
        
        console.log('✅ Container atrasts:', container);
        
        if (youtubePlayer) {
            console.log('⚠️ Iznīcinu veco player...');
            try {
                youtubePlayer.destroy();
                console.log('✅ Vecs player iznīcināts');
            } catch (e) {
                console.warn('⚠️ Veco player neizdevās iznīcināt:', e);
            }
        }
        
        container.innerHTML = '';
        
        try {
            console.log('🔨 Veidoju jaunu YT.Player...');
            youtubePlayer = new YT.Player('youtubePlayer', {
                videoId: videoId,
                playerVars: {
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                    origin: window.location.origin  // ⬅️ SVARĪGI PRODUCTION!
                },
                events: {
                    onReady: function(event) {
                        console.log('✅ Player onReady callback!');
                        console.log('✅ Player object:', event.target);
                        startTimerUpdate();
                        resolve(event.target);
                    },
                    onError: function(event) {
                        console.error('❌ YouTube onError:', event.data);
                        let msg = 'YouTube kļūda [' + event.data + ']';
                        
                        switch(event.data) {
                            case 2:
                                msg = 'Nederīgs video ID: ' + videoId;
                                console.error('❌', msg);
                                break;
                            case 5:
                                msg = 'HTML5 player kļūda';
                                console.error('❌', msg);
                                break;
                            case 100:
                                msg = 'Video nav atrasts (ID: ' + videoId + ')';
                                console.error('❌', msg);
                                break;
                            case 101:
                            case 150:
                                msg = 'Video nav embeddable!';
                                console.error('❌', msg);
                                console.error('🔧 Risinājums: YouTube Studio → Video Settings → Allow embedding = ON');
                                console.error('🔧 Pārbaudi: https://studio.youtube.com');
                                break;
                        }
                        
                        reject(new Error(msg));
                    },
                    onStateChange: function(event) {
                        const states = {
                            '-1': 'UNSTARTED',
                            '0': 'ENDED',
                            '1': 'PLAYING',
                            '2': 'PAUSED',
                            '3': 'BUFFERING',
                            '5': 'CUED'
                        };
                        console.log('🎬 Player state:', states[event.data] || event.data);
                        
                        if (event.data === 0) {
                            console.log('✅ Video beidzies');
                            stopFragmentCheck();
                        }
                    }
                }
            });
            console.log('✅ YT.Player objekts izveidots');
        } catch (error) {
            console.error('❌ Kļūda veidojot player:', error);
            reject(error);
        }
    });
}

function openVideoModal() {
    console.log('🎬 Atver video modal...');
    
    const currentKadril = window.audioManager && window.audioManager.getCurrentKadril();
    
    if (!currentKadril) {
        console.error('❌ Nav izvēlēta dziesma!');
        alert('⚠️ Izvēlies dziesmu!');
        return;
    }
    
    console.log('✅ Pašreizējā dziesma:', currentKadril.key);
    console.log('📊 Dziesmas dati:', currentKadril.data);
    
    if (!currentKadril.data.video) {
        console.error('❌ Dziesmai nav video objekta!');
        alert('⚠️ Šai dziesmai nav video datu!');
        return;
    }
    
    if (!currentKadril.data.video.youtube_id) {
        console.error('❌ Dziesmai nav youtube_id!');
        console.log('📊 Video objekts:', currentKadril.data.video);
        alert('⚠️ Nav YouTube video ID!');
        return;
    }
    
    console.log('✅ YouTube ID:', currentKadril.data.video.youtube_id);
    console.log('✅ Fragmenti:', currentKadril.data.video.fragments);
    
    currentVideoKadril = currentKadril;
    
    if (currentVideoTitle) {
        currentVideoTitle.textContent = currentKadril.data.name;
        console.log('✅ Virsraksts iestatīts');
    }
    
    if (videoModal) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal atvērts');
    }
    
    console.log('📡 Ielādēju YouTube API...');
    loadYouTubeAPI()
        .then(function() {
            console.log('✅ API ielādēts, veidoju player...');
            return createYouTubePlayer(currentKadril.data.video.youtube_id);
        })
        .then(function() {
            console.log('✅ Player izveidots, ielādēju fragmentus...');
            loadVideoFragments();
        })
        .catch(function(error) {
            console.error('❌ KĻŪDA PROCESĀ:', error);
            console.error('📊 Error stack:', error.stack);
            alert('❌ Kļūda: ' + error.message + '\n\nPārbaudi console (F12)!');
            closeVideoModal();
        });
}

function closeVideoModal() {
    console.log('🔒 Aizver video modal...');
    
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    if (youtubePlayer && youtubePlayer.pauseVideo) {
        try {
            youtubePlayer.pauseVideo();
            console.log('✅ Video nopauzēts');
        } catch (e) {
            console.warn('⚠️ Kļūda pauzējot:', e);
        }
    }
    
    stopFragmentCheck();
    stopTimerUpdate();
    currentVideoKadril = null;
}

function loadVideoFragments() {
    console.log('📋 Ielādēju video fragmentus...');
    
    if (!videoFragmentsList) {
        console.error('❌ videoFragmentsList nav atrasts!');
        return;
    }
    
    if (!currentVideoKadril) {
        console.error('❌ currentVideoKadril nav iestatīts!');
        return;
    }
    
    videoFragmentsList.innerHTML = '';
    
    const fragments = currentVideoKadril.data.video.fragments;
    if (!fragments) {
        console.warn('⚠️ Nav fragmentu');
        videoFragmentsList.innerHTML = '<p style="color: rgba(230,255,0,0.5);">Nav fragmentu</p>';
        return;
    }
    
    console.log('✅ Fragmenti atrasti:', Object.keys(fragments));
    
    Object.keys(fragments).forEach(function(key) {
        const frag = fragments[key];
        console.log('🔨 Veidoju pogu:', key, frag);
        
        const btn = document.createElement('button');
        btn.className = 'video-fragment-btn';
        
        const startSec = parseTimeToSeconds(frag.start);
        const endSec = parseTimeToSeconds(frag.end);
        
        console.log('⏱️ Fragment:', key, '→', startSec, '-', endSec, 'sek');
        
        const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        btn.textContent = name + ' (' + formatTime(startSec) + ' - ' + formatTime(endSec) + ')';
        
        btn.addEventListener('click', function() {
            console.log('🎯 Clicked fragment:', key);
            playVideoFragment(key);
            
            videoFragmentsList.querySelectorAll('.video-fragment-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
        });
        
        videoFragmentsList.appendChild(btn);
    });
    
    console.log('✅', Object.keys(fragments).length, 'fragmenti izveidoti');
}

function playVideoFragment(fragmentKey) {
    console.log('▶️ Spēlēju fragmentu:', fragmentKey);
    
    if (!youtubePlayer) {
        console.error('❌ youtubePlayer nav pieejams!');
        return;
    }
    
    if (!currentVideoKadril) {
        console.error('❌ currentVideoKadril nav iestatīts!');
        return;
    }
    
    const fragment = currentVideoKadril.data.video.fragments[fragmentKey];
    if (!fragment) {
        console.error('❌ Fragments nav atrasts:', fragmentKey);
        return;
    }
    
    stopFragmentCheck();
    
    const startSec = parseTimeToSeconds(fragment.start);
    const endSec = parseTimeToSeconds(fragment.end);
    
    console.log('⏱️ Fragment laiks:', startSec, '→', endSec, 'sek');
    
    currentFragmentEnd = endSec;
    
    try {
        youtubePlayer.seekTo(startSec, true);
        console.log('✅ seekTo(' + startSec + ') izpildīts');
        
        youtubePlayer.playVideo();
        console.log('✅ playVideo() izpildīts');
        
        startFragmentCheck();
    } catch (e) {
        console.error('❌ Kļūda spēlējot fragmentu:', e);
    }
}

function startFragmentCheck() {
    console.log('⏱️ Sāku fragment check...');
    fragmentCheckInterval = setInterval(function() {
        if (!youtubePlayer || !currentFragmentEnd) return;
        
        const currentTime = youtubePlayer.getCurrentTime();
        if (currentTime >= currentFragmentEnd) {
            console.log('🛑 Fragment beidzies pie', currentTime, '/', currentFragmentEnd);
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
        console.log('⏹️ Fragment check apturēts');
    }
}

function startTimerUpdate() {
    console.log('⏱️ Sāku timer update...');
    stopTimerUpdate();
    timerInterval = setInterval(function() {
        if (!youtubePlayer || !videoTimer) return;
        
        try {
            const current = formatTime(youtubePlayer.getCurrentTime());
            const duration = formatTime(youtubePlayer.getDuration());
            videoTimer.textContent = current + ' / ' + duration;
        } catch (e) {
            console.warn('⚠️ Timer kļūda:', e);
        }
    }, 500);
}

function stopTimerUpdate() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log('⏹️ Timer update apturēts');
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// ========================================
// GLOBAL API - pieejams caur window.videoPlayer
// ========================================
window.videoPlayer = {
    open: openVideoModal,
    close: closeVideoModal,
    playFragment: playVideoFragment,
    debug: function() {
        console.log('=== VIDEO PLAYER DEBUG ===');
        console.log('YouTube API loaded:', !!(window.YT && window.YT.Player));
        console.log('Current kadril:', currentVideoKadril);
        console.log('YouTube player:', youtubePlayer);
        console.log('Domain:', window.location.hostname);
        console.log('Protocol:', window.location.protocol);
        console.log('==========================');
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✅ Video player ready - izmanto window.videoPlayer.debug() diagnostikai');
