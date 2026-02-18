// video-youtube.js
// YouTube video atskaņotājs + VIDEO poga pie katras dziesmas sarakstā

console.log('🎬 YouTube video player ielādējas...');

let currentVideoKadril   = null;
let youtubePlayer        = null;
let currentFragmentEnd   = null;
let fragmentCheckInterval = null;
let timerInterval        = null;

const videoModal         = document.getElementById('videoModal');
const closeVideo         = document.getElementById('closeVideo');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle  = document.getElementById('currentVideoTitle');
const videoTimer         = document.getElementById('videoTimer');
const mainVideoBtn       = document.getElementById('videoBtn');

// ─────────────────────────────────────────────
// HELPER: "3:24" → 204 sekundes
// ─────────────────────────────────────────────
function parseTimeToSeconds(time) {
    if (typeof time === 'number') return time;

    if (typeof time === 'string' && time.includes(':')) {
        const parts = time.split(':');
        if (parts.length === 2)
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        if (parts.length === 3)
            return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    }

    const n = parseFloat(time);
    return isNaN(n) ? 0 : n;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' +
           String(Math.floor(seconds % 60)).padStart(2, '0');
}

// ─────────────────────────────────────────────
// VIDEO POGA PIE KATRAS DZIESMAS SARAKSTĀ
//
// SVARĪGI: ui.js loadSongList() veido <li> ar:
//   li.textContent = kadril.name      ← tikai teksts
//   li.dataset.kadrilKey = kadrilKey  ← atslēga
//
// Mēs NEVARAM izmantot textContent pēc tam, jo tas aizstāj visu.
// Tāpēc:
//   1. Saglabājam sākotnējo tekstu kā <span class="song-name-text">
//   2. Pievienojam pogu kā otro bērnu
//   3. Izmantojam dataset.kadrilKey lai atrastu kadril datus
// ─────────────────────────────────────────────
function addVideoButtonToLi(li) {
    // Nepiešķirt divreiz
    if (li.dataset.videoBtnAdded) return;
    if (li.classList.contains('song-search-no-result')) return;

    const kadrilKey = li.dataset.kadrilKey;
    if (!kadrilKey) return;

    // Pārbaudām vai šai dziesmā ir video
    const am = window.audioManager;
    const hasVideo = am && am.kadrils && am.kadrils[kadrilKey] &&
                     am.kadrils[kadrilKey].video &&
                     am.kadrils[kadrilKey].video.youtube_id;

    if (!hasVideo) {
        li.dataset.videoBtnAdded = '1';
        return;
    }

    // NEAIZTIEKAM li.textContent — meklēšana to izmanto!
    // Vienkārši pieliekam pogu klāt kā pēdējo bērnu
    const btn     = document.createElement('span');
    btn.className = 'song-video-btn';
    btn.title     = 'Skatīt video';
    btn.innerHTML = '<img src="movie-850.svg" class="song-video-icon" alt="video">';

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const kadrils = window.audioManager && window.audioManager.kadrils[kadrilKey];
        if (!kadrils || !kadrils.video || !kadrils.video.youtube_id) return;
        openVideoWithKadril({ key: kadrilKey, data: kadrils });
    });

    li.appendChild(btn);
    li.dataset.videoBtnAdded = '1';
}

function attachSongVideoButtons() {
    const songList = document.getElementById('songList');
    if (!songList) return;

    // Pievieno pogām esošajiem <li>
    songList.querySelectorAll('li').forEach(addVideoButtonToLi);

    // Novēro jaunus <li> (async loadSongList)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            m.addedNodes.forEach(function (node) {
                if (node.nodeType === 1 && node.tagName === 'LI') {
                    // Īss aizture lai li.textContent un dataset.kadrilKey būtu jau uzstādīti
                    setTimeout(function () { addVideoButtonToLi(node); }, 0);
                }
            });
        });
    });

    observer.observe(songList, { childList: true });
}

// ─────────────────────────────────────────────
// VIDEO ATVĒRŠANA
// ─────────────────────────────────────────────
function openVideoWithKadril(kadrils) {
    currentVideoKadril = kadrils;

    if (currentVideoTitle) {
        currentVideoTitle.textContent = kadrils.data.name || kadrils.key;
    }

    if (videoModal) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Pauzē audio
    const mainAudio = document.getElementById('mainAudio');
    if (mainAudio && !mainAudio.paused) mainAudio.pause();

    loadYouTubeAPI()
        .then(function () {
            return createYouTubePlayer(kadrils.data.video.youtube_id);
        })
        .then(function () {
            loadVideoFragments();
        })
        .catch(function (err) {
            alert('Kļūda: ' + err.message);
            closeVideoModal();
        });
}

// Galvenā player poga (videoBtn) — atver video pašreizējai dziesmāi
function openVideoModal() {
    const am = window.audioManager;
    const current = am && am.getCurrentKadril && am.getCurrentKadril();

    if (!current) {
        alert('Izvēlieties dziesmu!');
        return;
    }
    if (!current.data.video || !current.data.video.youtube_id) {
        alert('Nav YouTube video šai dziesmāi!');
        return;
    }

    openVideoWithKadril(current);
}

// ─────────────────────────────────────────────
// YOUTUBE API
// ─────────────────────────────────────────────
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();

    return new Promise(function (resolve, reject) {
        const timeout = setTimeout(function () {
            reject(new Error('YouTube API timeout (10s)'));
        }, 10000);

        window.onYouTubeIframeAPIReady = function () {
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

function createYouTubePlayer(videoId) {
    return new Promise(function (resolve, reject) {
        if (!window.YT || !window.YT.Player) {
            reject(new Error('YouTube API nav pieejams'));
            return;
        }

        const container = document.getElementById('youtubePlayer');
        if (!container) {
            reject(new Error('YouTube konteiners nav atrasts'));
            return;
        }

        if (youtubePlayer) {
            try { youtubePlayer.destroy(); } catch (e) {}
        }
        container.innerHTML = '';

        try {
            youtubePlayer = new YT.Player('youtubePlayer', {
                videoId: videoId,
                playerVars: {
                    playsinline: 1,
                    rel: 0,
                    modestbranding: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: function (e) {
                        startTimerUpdate();
                        resolve(e.target);
                    },
                    onError: function (e) {
                        let msg = 'Kļūda';
                        if (e.data === 2)                 msg = 'Nederīgs video ID';
                        if (e.data === 100)               msg = 'Video nav atrasts';
                        if (e.data === 101 || e.data === 150) msg = 'Video nav embeddable';
                        reject(new Error(msg));
                    },
                    onStateChange: function (e) {
                        if (e.data === 0) stopFragmentCheck();
                    }
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

// ─────────────────────────────────────────────
// AIZVĒRT MODĀLU
// ─────────────────────────────────────────────
function closeVideoModal() {
    if (videoModal) {
        videoModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    if (youtubePlayer && youtubePlayer.pauseVideo) {
        try { youtubePlayer.pauseVideo(); } catch (e) {}
    }

    stopFragmentCheck();
    stopTimerUpdate();
    currentVideoKadril = null;
}

// ─────────────────────────────────────────────
// FRAGMENTI
// ─────────────────────────────────────────────
function loadVideoFragments() {
    if (!videoFragmentsList || !currentVideoKadril) return;
    videoFragmentsList.innerHTML = '';

    const fragments = currentVideoKadril.data.video.fragments;
    if (!fragments || Object.keys(fragments).length === 0) {
        videoFragmentsList.innerHTML =
            '<p style="color:rgba(230,255,0,0.5);text-align:center;">Nav fragmentu</p>';
        return;
    }

    Object.keys(fragments).forEach(function (key) {
        const frag = fragments[key];
        const s    = parseTimeToSeconds(frag.start);
        const e    = parseTimeToSeconds(frag.end);
        const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        const btn       = document.createElement('button');
        btn.className   = 'video-fragment-btn';
        btn.textContent = name + ' (' + formatTime(s) + ' – ' + formatTime(e) + ')';

        btn.addEventListener('click', function () {
            playVideoFragment(key);
            videoFragmentsList.querySelectorAll('.video-fragment-btn')
                .forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });

        videoFragmentsList.appendChild(btn);
    });
}

function playVideoFragment(fragmentKey) {
    if (!youtubePlayer || !currentVideoKadril) return;

    const frag = currentVideoKadril.data.video.fragments[fragmentKey];
    if (!frag) return;

    stopFragmentCheck();

    const s = parseTimeToSeconds(frag.start);
    const e = parseTimeToSeconds(frag.end);
    currentFragmentEnd = e;

    youtubePlayer.seekTo(s, true);
    youtubePlayer.playVideo();
    startFragmentCheck();
}

function startFragmentCheck() {
    fragmentCheckInterval = setInterval(function () {
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
        currentFragmentEnd    = null;
    }
}

// ─────────────────────────────────────────────
// TAIMERIS
// ─────────────────────────────────────────────
function startTimerUpdate() {
    stopTimerUpdate();
    timerInterval = setInterval(function () {
        if (!youtubePlayer || !videoTimer) return;
        try {
            videoTimer.textContent =
                formatTime(youtubePlayer.getCurrentTime()) + ' / ' +
                formatTime(youtubePlayer.getDuration());
        } catch (e) {}
    }, 500);
}

function stopTimerUpdate() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// ─────────────────────────────────────────────
// INICIALIZĀCIJA
// ─────────────────────────────────────────────
function initVideoPlayer() {
    loadYouTubeAPI().catch(function (err) {
        console.warn('YouTube API:', err.message);
    });

    if (mainVideoBtn) {
        // Pievieno SVG ikonu pogai
        mainVideoBtn.innerHTML = '<img src="movie-850.svg" class="video-btn-icon" alt="VIDEO"> VIDEO';
        mainVideoBtn.addEventListener('click', openVideoModal);
    }

    if (closeVideo) {
        closeVideo.addEventListener('click', closeVideoModal);
    }

    window.addEventListener('click', function (e) {
        if (e.target === videoModal) closeVideoModal();
    });

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // Video pogas dziesmu sarakstā — noņemtas
}

window.videoPlayer = {
    open:         openVideoModal,
    openKadril:   openVideoWithKadril,
    close:        closeVideoModal,
    playFragment: playVideoFragment
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}

console.log('✅ video-youtube.js gatavs');
