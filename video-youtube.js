// video-youtube.js - GATAVS AR VISIEM LABOJUMIEM
// Error 153 fix + origin parameter

console.log('🎬 YouTube video player...');

let currentVideoKadril = null;

const videoModal = document.getElementById('videoModal');
const videoBtn = document.getElementById('videoBtn');
const closeVideo = document.getElementById('closeVideo');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle = document.getElementById('currentVideoTitle');

// ========================================
// HELPER
// ========================================
function parseTimeToSeconds(time) {
    if (typeof time === 'number') return time;
    
    if (typeof time === 'string' && time.includes(':')) {
        const parts = time.split(':');
        if (parts.length === 2) {
            return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10);
        }
        if (parts.length === 3) {
            return (parseInt(parts[0], 10) * 3600) + (parseInt(parts[1], 10) * 60) + parseInt(parts[2], 10);
        }
    }
    
    const parsed = parseFloat(time);
    return !isNaN(parsed) ? parsed : 0;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// ========================================
// IFRAME CREATION - AR ORIGIN FIX!
// ========================================
function createSimpleIframe(videoId, startTime) {
    const container = document.getElementById('youtubePlayer');
    if (!container) {
        console.error('❌ youtubePlayer container nav atrasts!');
        return;
    }
    
    container.innerHTML = '';
    
    // ✅ AR ORIGIN PARAMETRU (Error 153 fix)
    const origin = encodeURIComponent(window.location.origin);
    const iframeUrl = 'https://www.youtube.com/embed/' + videoId + 
                      '?start=' + Math.floor(startTime) +
                      '&autoplay=1' +
                      '&rel=0' +
                      '&modestbranding=1' +
                      '&origin=' + origin;
    
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    
    container.appendChild(iframe);
    
    console.log('✅ Iframe izveidots:', videoId);
    console.log('📍 Origin:', window.location.origin);
    console.log('🔗 URL:', iframeUrl);
}

// ========================================
// MODAL
// ========================================
function openVideoModal() {
    console.log('🎬 Atver video modal...');
    
    // Pārbauda vai audioManager eksistē
    if (!window.audioManager) {
        console.error('❌ window.audioManager nav pieejams!');
        alert('Kļūda: audioManager nav ielādēts!');
        return;
    }
    
    const currentKadril = window.audioManager.getCurrentKadril();
    
    if (!currentKadril) {
        console.warn('⚠️ Nav izvēlēta dziesma');
        alert('Izvēlies dziesmu!');
        return;
    }
    
    console.log('✅ Dziesma:', currentKadril.key);
    
    if (!currentKadril.data.video || !currentKadril.data.video.youtube_id) {
        console.error('❌ Nav YouTube video!');
        alert('Šai dziesmai nav YouTube video!');
        return;
    }
    
    const youtubeId = currentKadril.data.video.youtube_id;
    
    if (youtubeId === 'IEVADI_VIDEO_ID') {
        console.error('❌ YouTube ID ir placeholder!');
        alert('YouTube ID nav ievadīts! Vajag īstu video ID.');
        return;
    }
    
    console.log('✅ YouTube ID:', youtubeId);
    
    currentVideoKadril = currentKadril;
    
    if (currentVideoTitle) {
        currentVideoTitle.textContent = currentKadril.data.name;
    }
    
    if (videoModal) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('✅ Modal atvērts');
    }
    
    // ✅ AUTO-PAUZE AUDIO!
    const mainAudio = document.getElementById('mainAudio');
    if (mainAudio && !mainAudio.paused) {
        mainAudio.pause();
        console.log('⏸️ Audio nopauzēts');
    }
    
    createSimpleIframe(youtubeId, 0);
    loadVideoFragments();
}

function closeVideoModal() {
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // ✅ Ja gribi lai audio turpinās pēc video aizvēršanas, noņem komentārus:
    // const mainAudio = document.getElementById('mainAudio');
    // if (mainAudio && mainAudio.paused) {
    //     mainAudio.play();
    //     console.log('▶️ Audio atsākts');
    // }
    
    currentVideoKadril = null;
    console.log('🔒 Modal aizvērts');
}

// ========================================
// FRAGMENTS
// ========================================
function loadVideoFragments() {
    if (!videoFragmentsList || !currentVideoKadril) return;
    
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
    
    console.log('✅ Fragmenti ielādēti:', Object.keys(fragments).length);
}

function playVideoFragment(fragmentKey) {
    if (!currentVideoKadril) return;
    
    const fragment = currentVideoKadril.data.video.fragments[fragmentKey];
    if (!fragment) return;
    
    const startSec = parseTimeToSeconds(fragment.start);
    console.log('▶️ Fragments:', fragmentKey, 'no', startSec, 'sek');
    
    createSimpleIframe(currentVideoKadril.data.video.youtube_id, startSec);
}

// ========================================
// INIT
// ========================================
function initVideoPlayer() {
    console.log('🔧 Init video player...');
    console.log('📍 Domain:', window.location.hostname);
    console.log('🔗 Origin:', window.location.origin);
    console.log('🔒 Protocol:', window.location.protocol);
    
    if (videoBtn) {
        videoBtn.addEventListener('click', openVideoModal);
        console.log('✅ VIDEO button listener pievienots');
    } else {
        console.error('❌ VIDEO button nav atrasts!');
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
    
    console.log('✅ Video player gatavs');
}

window.videoPlayer = {
    open: openVideoModal,
    close: closeVideoModal,
    playFragment: playVideoFragment
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✅ video-youtube.js ielādēts');
