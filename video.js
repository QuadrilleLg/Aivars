// VIDEO PLAYER FUNCTIONALITY - Integrēts ar audioManager

// Globālie mainīgie
let currentVideoKadril = null;

// DOM elementi
const videoModal = document.getElementById('videoModal');
const videoBtn = document.getElementById('videoBtn');
const closeVideo = document.getElementById('closeVideo');
const videoPlayer = document.getElementById('videoPlayer');
const videoFragmentsList = document.getElementById('videoFragmentsList');
const currentVideoTitle = document.getElementById('currentVideoTitle');
const videoTimer = document.getElementById('videoTimer');

// Inicializācija
function initVideoPlayer() {
    // Atver video modal
    videoBtn.addEventListener('click', openVideoModal);
    
    // Aizver video modal
    closeVideo.addEventListener('click', closeVideoModal);
    
    // Aizver, klikšķinot ārpus modal
    window.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Video laika atjaunināšana
    videoPlayer.addEventListener('timeupdate', updateVideoTimer);
    
    // Video playeris ielādēts
    videoPlayer.addEventListener('loadedmetadata', () => {
        console.log('Video ielādēts:', videoPlayer.src);
    });
    
    // Video kļūda
    videoPlayer.addEventListener('error', (e) => {
        console.error('Video kļūda:', e);
        alert('Nevar ielādēt video failu!\nPārliecinieties, ka fails eksistē.');
    });
}

// Atver video modal un ielādē pašreizējo dziesmu
function openVideoModal() {
    // Iegūst pašreizējo kadriļu no audioManager
    const currentKadril = window.audioManager?.getCurrentKadril();
    
    if (!currentKadril) {
        alert('Vispirms izvēlieties dziesmu no saraksta!');
        return;
    }
    
    // Pārbauda vai ir video
    if (!currentKadril.data.video || !currentKadril.data.video.pilnā) {
        alert('Šai dziesmai nav pieejams video!');
        return;
    }
    
    // Saglabā pašreizējo video kadriļu
    currentVideoKadril = currentKadril;
    
    // Atjauno nosaukumu
    currentVideoTitle.textContent = currentKadril.data.name;
    
    // Ielādē video fragmentus
    loadVideoFragments();
    
    // Ielādē un atskaņo pilno video
    playVideoFragment('pilnā');
    
    // Atver modal
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Aizver video modal
function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    videoPlayer.pause();
    currentVideoKadril = null;
}

// Ielādē video fragmentus
function loadVideoFragments() {
    videoFragmentsList.innerHTML = '';
    
    if (!currentVideoKadril || !currentVideoKadril.data.video) {
        console.warn('Nav video fragmentu');
        return;
    }
    
    const videoData = currentVideoKadril.data.video;
    
    // Izveidot pogas katram video fragmentam
    Object.keys(videoData).forEach(fragmentKey => {
        const fragmentPath = videoData[fragmentKey];
        const btn = document.createElement('button');
        btn.className = 'video-fragment-btn';
        
        // Formatē fragmenta nosaukumu
        const displayName = fragmentKey.charAt(0).toUpperCase() + fragmentKey.slice(1);
        btn.textContent = displayName;
        btn.dataset.fragmentKey = fragmentKey;
        
        btn.addEventListener('click', () => {
            playVideoFragment(fragmentKey);
            
            // Noņem active class no visiem
            videoFragmentsList.querySelectorAll('.video-fragment-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Pievieno active class izvēlētajam
            btn.classList.add('active');
        });
        
        videoFragmentsList.appendChild(btn);
    });
    
    // Aktivizē pirmo fragmentu (parasti 'pilnā')
    const firstBtn = videoFragmentsList.querySelector('.video-fragment-btn');
    if (firstBtn) {
        firstBtn.classList.add('active');
    }
}

// Atskaņo video fragmentu
function playVideoFragment(fragmentKey) {
    if (!currentVideoKadril || !currentVideoKadril.data.video) {
        console.error('Nav ielādēts video kadril');
        return;
    }
    
    const fragmentPath = currentVideoKadril.data.video[fragmentKey];
    
    if (!fragmentPath) {
        console.error('Fragments nav atrasts:', fragmentKey);
        alert(`Fragments "${fragmentKey}" nav pieejams!`);
        return;
    }
    
    console.log('Ielādēju video:', fragmentPath);
    
    videoPlayer.src = fragmentPath;
    videoPlayer.load();
    
    videoPlayer.play().catch(err => {
        console.error('Nevar atskaņot video:', err);
        alert('Nevar ielādēt video failu: ' + fragmentPath + '\nPārliecinieties, ka fails eksistē un ceļš ir pareizs.');
    });
}

// Atjauno video taimeri
function updateVideoTimer() {
    const currentTime = formatTime(videoPlayer.currentTime);
    const duration = formatTime(videoPlayer.duration);
    videoTimer.textContent = `${currentTime} / ${duration}`;
}

// Formatē laiku
function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '00:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Eksportē funkcijas, ja vajag
window.videoPlayer = {
    open: openVideoModal,
    close: closeVideoModal,
    playFragment: playVideoFragment
};

// Inicializē, kad lapa ielādējas
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideoPlayer);
} else {
    initVideoPlayer();
}
