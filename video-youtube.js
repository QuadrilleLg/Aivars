// video-youtube-SIMPLE-IFRAME.js
// VIENKĀRŠĀKAIS risinājums - iframe BEZ API
// ⚠️ Fragmenti SĀKSIES pareizi, bet NEAPSTĀSIES beigās!

console.log('🎬 Simple YouTube iframe player...');

let currentVideoKadril = null;

const videoModal = document.getElementById('videoModal');
const videoBtn = document.getElementById('videoBtn');
const closeVideo = document.getElementById('closeVideo');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle = document.getElementById('currentVideoTitle');

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
    
    return 0;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// ========================================
// IFRAME CREATION
// ========================================
function createSimpleIframe(videoId, startTime) {
    const container = document.getElementById('youtubePlayer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Vienkāršs iframe URL
    const iframeUrl = 'https://www.youtube.com/embed/' + videoId + 
                      '?start=' + Math.floor(startTime) +
                      '&autoplay=1' +
                      '&rel=0' +
                      '&modestbranding=1';
    
    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    
    container.appendChild(iframe);
    
    console.log('✅ Iframe izveidots:', videoId, 'start:', startTime);
}

// ========================================
// MODAL
// ========================================
function openVideoModal() {
    const currentKadril = window.audioManager && window.audioManager.getCurrentKadril();
    
    if (!currentKadril) {
        alert('Izvēlies dziesmu!');
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
    
    // Izveido iframe ar pilno video no sākuma
    createSimpleIframe(currentKadril.data.video.youtube_id, 0);
    loadVideoFragments();
}

function closeVideoModal() {
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    currentVideoKadril = null;
}

// ========================================
// FRAGMENTS LIST
// ========================================
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

// ========================================
// PLAY FRAGMENT - REKONSTRUĒ IFRAME!
// ========================================
function playVideoFragment(fragmentKey) {
    if (!currentVideoKadril) return;
    
    const fragment = currentVideoKadril.data.video.fragments[fragmentKey];
    if (!fragment) return;
    
    const startSec = parseTimeToSeconds(fragment.start);
    
    console.log('▶️ Spēlēju fragmentu:', fragmentKey, 'no', startSec, 'sek');
    console.log('⚠️ BRĪDINĀJUMS: Video NEAPSTĀSIES pie', parseTimeToSeconds(fragment.end));
    
    // Rekonstruē iframe ar jaunu start laiku
    createSimpleIframe(currentVideoKadril.data.video.youtube_id, startSec);
}

// ========================================
// INITIALIZATION
// ========================================
function initVideoPlayer() {
    console.log('🔧 Init simple iframe player...');
    
    if (videoBtn) {
        videoBtn.addEventListener('click', openVideoModal);
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
    
    console.log('✅ Simple iframe player ready');
    console.log('⚠️ BRĪDINĀJUMS: Fragmenti sāksies pareizi, bet NEAPSTĀSIES beigās!');
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

console.log('✅ Ready - VIENKĀRŠS IFRAME (bez auto-stop)');
