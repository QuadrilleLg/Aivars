// video-youtube.js - VIENKĀRŠA un PAREIZA versija
// 16:9 HORIZONTĀLS video (width LIELĀKS par height)

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

function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }
    
    return new Promise(function(resolve, reject) {
        const timeout = setTimeout(function() {
            reject(new Error('Timeout'));
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
    
    window.addEventListener('click', function(e) {
        if (e.target === videoModal) {
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
                    modestbranding: 1
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
        
        const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        btn.textContent = name + ' (' + formatTime(frag.start) + ' - ' + formatTime(frag.end) + ')';
        
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
    currentFragmentEnd = fragment.end;
    
    youtubePlayer.seekTo(fragment.start, true);
    youtubePlayer.playVideo();
    startFragmentCheck();
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
    playFragment: playVideoFragment
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✅ Ready');