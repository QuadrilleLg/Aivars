// video-youtube.js
// YouTube video atskaņotājs + VIDEO poga pie katras dziesmas sarakstā

console.log('🎬 YouTube video player ielādējas...');

let currentVideoKadril  = null;
let youtubePlayer       = null;
let currentFragmentEnd  = null;
let fragmentCheckInterval = null;
let timerInterval       = null;

const videoModal        = document.getElementById('videoModal');
const closeVideo        = document.getElementById('closeVideo');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const videoTimer        = document.getElementById('videoTimer');

// Poga galvenajā player panelī (ja ir aktīva dziesma)
const mainVideoBtn      = document.getElementById('videoBtn');

// ========================================
// HELPER: "3:24" → 204 sekundes
// ========================================
function parseTimeToSeconds(time) {
    if (typeof time === 'number') return time;

    if (typeof time === 'string' && time.includes(':')) {
        const parts = time.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        if (parts.length === 3) {
            return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
        }
    }

    const parsed = parseFloat(time);
    if (!isNaN(parsed)) return parsed;

    console.warn('Neizdevās konvertēt laiku:', time);
    return 0;
}

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

// ========================================
// VIDEO POGA PIE KATRAS DZIESMAS SARAKSTĀ
// Pievieno pogas pēc tam, kad dziesmu saraksts ir ielādēts
// ========================================
function attachSongVideoButtons() {
    const songList = document.getElementById('songList');
    if (!songList) return;

    function addButtonsToItems() {
        const items = songList.querySelectorAll('li:not(.song-search-no-result)');
        items.forEach(function (li) {
            // Nepiešķirt divreiz
            if (li.querySelector('.song-video-btn')) return;

            const songName = li.dataset.songName || li.textContent.trim().replace(/^-\s*/, '');

            // Ietver tekstu span, lai flex layout darbojas
            if (!li.querySelector('.song-name-text')) {
                const textNode = li.childNodes[0];
                const nameSpan = document.createElement('span');
                nameSpan.className = 'song-name-text';
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    nameSpan.textContent = textNode.textContent;
                    li.replaceChild(nameSpan, textNode);
                } else {
                    nameSpan.textContent = songName;
                    li.prepend(nameSpan);
                }
            }

            // Izveido video pogu
            const btn = document.createElement('span');
            btn.className   = 'song-video-btn';
            btn.textContent = '🎬';
            btn.title       = 'Skatīt video';

            btn.addEventListener('click', function (e) {
                e.stopPropagation(); // Neaktivizē dziesmu izvēli

                // Iegūst dziesmas datus no audioManager
                const am = window.audioManager;
                if (!am) {
                    alert('Audio pārvaldnieks nav pieejams!');
                    return;
                }

                // Meklē dziesmu pēc saraksta indeksa vai nosaukuma
                const kadrils = getKadrilByLi(li);
                if (!kadrils) {
                    showNoBtnFeedback(btn);
                    return;
                }

                if (!kadrils.data.video || !kadrils.data.video.youtube_id) {
                    showNoBtnFeedback(btn);
                    return;
                }

                openVideoWithKadril(kadrils);
            });

            li.appendChild(btn);
        });
    }

    // Pēc sākotnējās ielādes
    addButtonsToItems();

    // Novēro jaunus elementus (async ielāde)
    const observer = new MutationObserver(function () {
        addButtonsToItems();
    });
    observer.observe(songList, { childList: true, subtree: false });
}

// Atrod kadril objektu pēc <li> elementa
function getKadrilByLi(li) {
    const am = window.audioManager;
    if (!am || !am.kadrils) return null;

    // Mēģina pēc data-song-key atribūta (ja ui.js to piešķir)
    const key = li.dataset.songKey;
    if (key && am.kadrils[key]) {
        return { key: key, data: am.kadrils[key] };
    }

    // Fallback — meklē pēc teksta sakritības
    const liText = li.querySelector('.song-name-text')
        ? li.querySelector('.song-name-text').textContent.trim().toLowerCase()
        : li.textContent.replace('🎬', '').trim().toLowerCase();

    const found = Object.keys(am.kadrils).find(function (k) {
        const name = (am.kadrils[k].name || k).toLowerCase();
        return name === liText || liText.includes(name) || name.includes(liText);
    });

    if (found) {
        return { key: found, data: am.kadrils[found] };
    }

    // Mēģina izmantot li indeksu — saraksta <li> pozīcija
    const allLi = Array.from(li.closest('ul').querySelectorAll('li:not(.song-search-no-result)'));
    const idx = allLi.indexOf(li);
    const keys = Object.keys(am.kadrils);
    if (idx >= 0 && idx < keys.length) {
        return { key: keys[idx], data: am.kadrils[keys[idx]] };
    }

    return null;
}

// Vizuāla atgriezeniskā saite — nav video
function showNoBtnFeedback(btn) {
    const orig = btn.textContent;
    btn.textContent = '✗';
    btn.style.color = 'rgba(255, 80, 80, 0.8)';
    setTimeout(function () {
        btn.textContent = orig;
        btn.style.color = '';
    }, 1200);
}

// ========================================
// VIDEO ATVĒRŠANA AR KONKRĒTU KADRIL
// ========================================
function openVideoWithKadril(kadrils) {
    currentVideoKadril = kadrils;

    if (currentVideoTitle) {
        currentVideoTitle.textContent = kadrils.data.name || kadrils.key;
    }

    if (videoModal) {
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Pauzē audio, ja spēlē
    const mainAudio = document.getElementById('mainAudio');
    if (mainAudio && !mainAudio.paused) {
        mainAudio.pause();
    }

    loadYouTubeAPI()
        .then(function () {
            return createYouTubePlayer(kadrils.data.video.youtube_id);
        })
        .then(function () {
            loadVideoFragments();
        })
        .catch(function (error) {
            alert('Kļūda: ' + error.message);
            closeVideoModal();
        });
}

// ========================================
// GALVENĀ PLAYER POGA (videoBtn) — atver video pašreizējai dziesmiai
// ========================================
function openVideoModal() {
    const am = window.audioManager;
    const currentKadril = am && am.getCurrentKadril && am.getCurrentKadril();

    if (!currentKadril) {
        alert('Izvēlieties dziesmu!');
        return;
    }

    if (!currentKadril.data.video || !currentKadril.data.video.youtube_id) {
        alert('Nav YouTube video šai dziesmāi!');
        return;
    }

    openVideoWithKadril(currentKadril);
}

// ========================================
// YOUTUBE API
// ========================================
function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        return Promise.resolve();
    }

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
                    mute: 1,
                    origin: window.location.origin
                },
                events: {
                    onReady: function (event) {
                        startTimerUpdate();
                        resolve(event.target);
                    },
                    onError: function (event) {
                        let msg = 'Kļūda';
                        if (event.data === 2)               msg = 'Nederīgs video ID';
                        if (event.data === 100)             msg = 'Video nav atrasts';
                        if (event.data === 101 || event.data === 150)
                            msg = 'Video nav embeddable — iespējojiet "Allow embedding"';
                        reject(new Error(msg));
                    },
                    onStateChange: function (event) {
                        if (event.data === 0) stopFragmentCheck();
                    }
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}

// ========================================
// AIZVĒRT MODĀLU
// ========================================
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

// ========================================
// FRAGMENTI
// ========================================
function loadVideoFragments() {
    if (!videoFragmentsList || !currentVideoKadril) return;

    videoFragmentsList.innerHTML = '';

    const fragments = currentVideoKadril.data.video.fragments;
    if (!fragments || Object.keys(fragments).length === 0) {
        videoFragmentsList.innerHTML = '<p style="color: rgba(230,255,0,0.5); text-align:center;">Nav fragmentu</p>';
        return;
    }

    Object.keys(fragments).forEach(function (key) {
        const frag    = fragments[key];
        const startSec = parseTimeToSeconds(frag.start);
        const endSec   = parseTimeToSeconds(frag.end);

        const name = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

        const btn = document.createElement('button');
        btn.className   = 'video-fragment-btn';
        btn.textContent = name + ' (' + formatTime(startSec) + ' – ' + formatTime(endSec) + ')';

        btn.addEventListener('click', function () {
            playVideoFragment(key);
            videoFragmentsList.querySelectorAll('.video-fragment-btn').forEach(function (b) {
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

    const startSec = parseTimeToSeconds(fragment.start);
    const endSec   = parseTimeToSeconds(fragment.end);

    currentFragmentEnd = endSec;

    youtubePlayer.seekTo(startSec, true);
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

// ========================================
// TAIMERIS
// ========================================
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

// ========================================
// INICIALIZĀCIJA
// ========================================
function initVideoPlayer() {
    loadYouTubeAPI().catch(function (err) {
        console.error('YouTube API kļūda:', err);
    });

    // Galvenā player poga
    if (mainVideoBtn) {
        mainVideoBtn.addEventListener('click', openVideoModal);
    }

    // Aizvērt × poga
    if (closeVideo) {
        closeVideo.addEventListener('click', closeVideoModal);
    }

    // Klikšķis uz fona aizvēr modālu
    window.addEventListener('click', function (e) {
        if (e.target === videoModal) closeVideoModal();
    });

    // ESC aizvēr modālu
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // Pievieno video pogas dziesmu sarakstā
    // Gaida, kamēr dziesmas ir ielādētas (audioManager ir async)
    attachSongVideoButtons();

    // Rezerves — mēģina vēlreiz pēc 2s, ja async ielāde kavējas
    setTimeout(attachSongVideoButtons, 2000);
}

// Publiskā API
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
